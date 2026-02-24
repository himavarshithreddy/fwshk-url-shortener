/**
 * Advanced rate limiting middleware with tiered limits, subnet tracking,
 * user-agent throttling, and progressive backoff.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// --- Configurable thresholds ---
const PER_IP_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MIN, 10) || 5;
const PER_IP_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR, 10) || 50;
const PER_SUBNET_PER_MINUTE = parseInt(process.env.RATE_LIMIT_SUBNET_PER_MIN, 10) || 30;
const PER_SUBNET_PER_HOUR = parseInt(process.env.RATE_LIMIT_SUBNET_PER_HOUR, 10) || 200;

// Progressive backoff: block durations escalate on repeat abuse
const BACKOFF_THRESHOLDS = [
  { violations: 3, blockMs: 5 * MINUTE },
  { violations: 6, blockMs: 30 * MINUTE },
  { violations: 10, blockMs: HOUR },
  { violations: 20, blockMs: 24 * HOUR },
];

// Suspicious user-agent patterns (bots, scrapers, empty)
const SUSPICIOUS_UA_PATTERNS = [
  /^$/,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpie/i,
  /scrapy/i,
  /bot(?!tle)/i,
  /spider/i,
  /crawl/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
];

// UA throttle: suspicious UAs get stricter limits
const UA_THROTTLE_FACTOR = 0.5; // 50% of normal limits

// --- In-memory stores ---
const ipBuckets = new Map();      // ip -> { minute: [], hour: [] }
const subnetBuckets = new Map();  // subnet -> { minute: [], hour: [] }
const violations = new Map();     // ip -> { count, blockedUntil }

const MAX_TRACKED_IPS = 100000;
const CLEANUP_INTERVAL = 5 * MINUTE;

/**
 * Extract /24 subnet from an IPv4 address.
 * For IPv6, uses the first 48 bits equivalent.
 */
function getSubnet(ip) {
  if (!ip) return 'unknown';
  // Handle IPv4-mapped IPv6
  const v4Match = ip.match(/(?:::ffff:)?(\d+\.\d+\.\d+)\.\d+$/i);
  if (v4Match) return v4Match[1] + '.0/24';
  // IPv6: use first 3 groups
  const parts = ip.split(':');
  if (parts.length >= 3) return parts.slice(0, 3).join(':') + '::/48';
  return ip;
}

/**
 * Check if a user-agent string matches suspicious patterns.
 */
function isSuspiciousUA(ua) {
  if (!ua) return true;
  return SUSPICIOUS_UA_PATTERNS.some(pattern => pattern.test(ua));
}

/**
 * Get or create a rate bucket for a key.
 */
function getBucket(store, key) {
  let bucket = store.get(key);
  if (!bucket) {
    if (store.size >= MAX_TRACKED_IPS) {
      // Evict oldest entry
      const firstKey = store.keys().next().value;
      store.delete(firstKey);
    }
    bucket = { minute: [], hour: [] };
    store.set(key, bucket);
  }
  return bucket;
}

/**
 * Record a request timestamp and check against limits.
 * Returns { allowed, retryAfterMs } 
 */
function checkBucket(bucket, now, perMinute, perHour) {
  // Prune expired entries
  bucket.minute = bucket.minute.filter(t => now - t < MINUTE);
  bucket.hour = bucket.hour.filter(t => now - t < HOUR);

  // Check minute limit
  if (bucket.minute.length >= perMinute) {
    const oldest = bucket.minute[0];
    return { allowed: false, retryAfterMs: MINUTE - (now - oldest) };
  }

  // Check hour limit
  if (bucket.hour.length >= perHour) {
    const oldest = bucket.hour[0];
    return { allowed: false, retryAfterMs: HOUR - (now - oldest) };
  }

  // Record this request
  bucket.minute.push(now);
  bucket.hour.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Check and update violation tracking for progressive backoff.
 */
function checkViolations(ip, now) {
  let record = violations.get(ip);
  if (!record) {
    record = { count: 0, blockedUntil: 0 };
    violations.set(ip, record);
  }

  // Currently blocked?
  if (record.blockedUntil > now) {
    return { blocked: true, retryAfterMs: record.blockedUntil - now };
  }

  return { blocked: false, retryAfterMs: 0 };
}

function recordViolation(ip, now) {
  let record = violations.get(ip);
  if (!record) {
    record = { count: 0, blockedUntil: 0 };
    violations.set(ip, record);
  }

  record.count++;

  // Find the appropriate backoff duration
  let blockMs = 0;
  for (const threshold of BACKOFF_THRESHOLDS) {
    if (record.count >= threshold.violations) {
      blockMs = threshold.blockMs;
    }
  }

  if (blockMs > 0) {
    record.blockedUntil = now + blockMs;
  }

  violations.set(ip, record);
}

/**
 * Express middleware for creation endpoint rate limiting.
 * Implements per-IP, per-subnet, UA-based throttling, and progressive backoff.
 */
function creationRateLimiter(req, res, next) {
  const ip = req.securityMeta?.clientIp || req.ip || 'unknown';
  const subnet = getSubnet(ip);
  const ua = req.headers['user-agent'] || '';
  const now = Date.now();
  const suspicious = isSuspiciousUA(ua);
  const factor = suspicious ? UA_THROTTLE_FACTOR : 1;

  // 1. Check progressive backoff (is IP currently blocked?)
  const violationCheck = checkViolations(ip, now);
  if (violationCheck.blocked) {
    const retryAfter = Math.ceil(violationCheck.retryAfterMs / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'You have been temporarily blocked due to excessive requests. Please try again later.',
    });
  }

  // 2. Per-IP rate check
  const ipBucket = getBucket(ipBuckets, ip);
  const ipCheck = checkBucket(
    ipBucket, now,
    Math.floor(PER_IP_PER_MINUTE * factor),
    Math.floor(PER_IP_PER_HOUR * factor)
  );

  if (!ipCheck.allowed) {
    recordViolation(ip, now);
    const retryAfter = Math.ceil(ipCheck.retryAfterMs / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
    });
  }

  // 3. Per-subnet rate check
  const snBucket = getBucket(subnetBuckets, subnet);
  const snCheck = checkBucket(snBucket, now, PER_SUBNET_PER_MINUTE, PER_SUBNET_PER_HOUR);

  if (!snCheck.allowed) {
    const retryAfter = Math.ceil(snCheck.retryAfterMs / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many requests from your network. Please try again later.',
    });
  }

  // Attach suspicion score for downstream middleware
  req.securityMeta = req.securityMeta || {};
  req.securityMeta.suspiciousUA = suspicious;

  next();
}

/**
 * Periodic cleanup of expired entries to prevent memory leaks.
 */
function cleanup() {
  const now = Date.now();

  for (const [key, bucket] of ipBuckets) {
    bucket.minute = bucket.minute.filter(t => now - t < MINUTE);
    bucket.hour = bucket.hour.filter(t => now - t < HOUR);
    if (bucket.minute.length === 0 && bucket.hour.length === 0) {
      ipBuckets.delete(key);
    }
  }

  for (const [key, bucket] of subnetBuckets) {
    bucket.minute = bucket.minute.filter(t => now - t < MINUTE);
    bucket.hour = bucket.hour.filter(t => now - t < HOUR);
    if (bucket.minute.length === 0 && bucket.hour.length === 0) {
      subnetBuckets.delete(key);
    }
  }

  // Clean up old violation records
  for (const [key, record] of violations) {
    if (record.blockedUntil < now && now - record.blockedUntil > HOUR) {
      violations.delete(key);
    }
  }
}

const cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL);
if (cleanupTimer.unref) cleanupTimer.unref();

/**
 * Graceful shutdown: clear the cleanup timer.
 */
function shutdown() {
  clearInterval(cleanupTimer);
}

module.exports = {
  creationRateLimiter,
  getSubnet,
  isSuspiciousUA,
  shutdown,
  // Exposed for testing
  _ipBuckets: ipBuckets,
  _subnetBuckets: subnetBuckets,
  _violations: violations,
};
