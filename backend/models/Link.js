const { Redis } = require('@upstash/redis');

let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (err) {
  console.error('Failed to initialize Redis client:', err.message,
    '- Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are set.');
}

// Key prefixes
const LINK_PREFIX = 'l:';
const MISS_PREFIX = 'miss:';
const CLICKS_PREFIX = 'clicks:';
const MISS_TTL_SECONDS = 60;

// L1 in-process memory cache
const l1Cache = new Map();
const L1_TTL_MS = 5000;
const L1_MAX_SIZE = 50000;

function l1Get(code) {
  const entry = l1Cache.get(code);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    l1Cache.delete(code);
    return null;
  }
  // Move to end so FIFO eviction becomes LRU
  l1Cache.delete(code);
  l1Cache.set(code, entry);
  return entry.val;
}

function l1Set(code, value) {
  if (l1Cache.size >= L1_MAX_SIZE) {
    l1Cache.delete(l1Cache.keys().next().value);
  }
  l1Cache.set(code, { val: value, exp: Date.now() + L1_TTL_MS });
}

function l1Delete(code) {
  l1Cache.delete(code);
}

/**
 * Check if Redis is available by performing a ping.
 */
async function checkRedisConnection() {
  if (!redis) return false;
  try {
    await redis.ping();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Create a new shortened link in Redis.
 * Stores as a packed JSON record under l:{shortCode}.
 * Record fields: u (url), t (expiry epoch ms, 0=never), e (enabled), p (protected), r (redirect type), ca (createdAt ISO)
 * @param {string} shortCode
 * @param {string} originalUrl
 * @param {number|null} ttlSeconds - Optional TTL in seconds
 * @param {string} redirectType - '308' (default), '302', or '301'
 */
async function createLink(shortCode, originalUrl, ttlSeconds = null, redirectType = '308') {
  if (!redis) throw new Error('Redis connection is not available');
  const key = `${LINK_PREFIX}${shortCode}`;
  const exists = await redis.exists(key);
  if (exists) return null;

  const now = Date.now();
  const expiresTimestamp = ttlSeconds ? now + ttlSeconds * 1000 : 0;
  const record = {
    u: originalUrl,
    t: expiresTimestamp,
    e: 1,
    p: 0,
    r: redirectType,
    ca: new Date(now).toISOString(),
  };

  if (ttlSeconds) {
    await redis.set(key, record, { ex: ttlSeconds });
  } else {
    await redis.set(key, record);
  }

  // Clear any stale negative cache for this code
  l1Delete(shortCode);
  await redis.del(`${MISS_PREFIX}${shortCode}`);

  return {
    shortCode,
    originalUrl,
    expiresAt: expiresTimestamp ? new Date(expiresTimestamp).toISOString() : null,
  };
}

/**
 * Fast-path: get packed redirect record using L1 cache → negative cache → Redis.
 * Returns the record object, or null if not found (including negative-cached misses).
 */
async function getRedirectRecord(shortCode) {
  if (!redis) throw new Error('Redis connection is not available');

  // L1 cache hit
  const cached = l1Get(shortCode);
  if (cached !== null) return cached;

  // Negative cache check (avoid Redis lookup for known missing codes)
  const isMiss = await redis.exists(`${MISS_PREFIX}${shortCode}`);
  if (isMiss) return null;

  // Redis lookup
  const raw = await redis.get(`${LINK_PREFIX}${shortCode}`);
  if (!raw) {
    await redis.set(`${MISS_PREFIX}${shortCode}`, 1, { ex: MISS_TTL_SECONDS });
    return null;
  }
  // Upstash SDK auto-deserialises JSON; handle legacy string values defensively
  const record = typeof raw === 'string' ? JSON.parse(raw) : raw;

  l1Set(shortCode, record);
  return record;
}

/**
 * Find a link by its shortCode (for tracking endpoint – not on the hot redirect path).
 */
async function findByShortCode(shortCode) {
  if (!redis) throw new Error('Redis connection is not available');

  const pipeline = redis.pipeline();
  pipeline.get(`${LINK_PREFIX}${shortCode}`);
  pipeline.get(`${CLICKS_PREFIX}${shortCode}`);
  const [rawRecord, clicks] = await pipeline.exec();

  if (!rawRecord) return null;
  const record = typeof rawRecord === 'string' ? JSON.parse(rawRecord) : rawRecord;
  return {
    shortCode,
    originalUrl: record.u,
    clickCount: Number(clicks) || 0,
    createdAt: record.ca || null,
    expiresAt: record.t ? new Date(record.t).toISOString() : null,
  };
}

/**
 * Increment the click count for a link (fire-and-forget safe).
 */
async function incrementClickCount(shortCode) {
  if (!redis) return;
  return redis.incr(`${CLICKS_PREFIX}${shortCode}`);
}

module.exports = {
  createLink,
  getRedirectRecord,
  findByShortCode,
  incrementClickCount,
  checkRedisConnection,
  l1Delete,
};
