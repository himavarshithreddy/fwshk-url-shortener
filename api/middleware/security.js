/**
 * Security middleware for proxy detection, IP reputation,
 * and abuse prevention.
 */

const MAX_FORWARDED_IPS = 5;

// Known data-center / cloud provider IP ranges (partial, common CIDR prefixes)
// These are well-known ranges used by hosting providers, not residential ISPs
const DATACENTER_IP_PREFIXES = [
  '10.',         // RFC1918 private
  '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
  '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.',    // RFC1918 private
];

// Headers that indicate Tor, VPN, or anonymising proxy usage
const ANONYMISING_HEADERS = [
  'via',
  'x-proxy-id',
  'forwarded',
  'x-tor-is',
  'x-tor',
];

/**
 * Extract the real client IP from the request.
 * Works with Express trust proxy setting enabled.
 */
function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Check if an IP appears to be from a known data center range.
 * This is a heuristic check using common prefixes.
 */
function isDataCenterIp(ip) {
  if (!ip) return false;
  // Normalise IPv4-mapped IPv6
  const normalised = ip.replace(/^::ffff:/i, '');
  return DATACENTER_IP_PREFIXES.some(prefix => normalised.startsWith(prefix));
}

/**
 * Middleware that detects potentially suspicious proxy usage,
 * Tor exit nodes, VPN indicators, and data center IPs.
 */
function proxyDetection(req, res, next) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const ips = xff.split(',').map(ip => ip.trim()).filter(Boolean);
    if (ips.length > MAX_FORWARDED_IPS) {
      return res.status(403).json({ error: 'Request blocked: too many proxy hops detected.' });
    }
  }

  // Flag requests with common anonymising proxy/Tor headers
  const hasSuspiciousHeaders = ANONYMISING_HEADERS.some(h => req.headers[h]);

  const clientIp = getClientIp(req);
  const dcIp = isDataCenterIp(clientIp);

  // Attach metadata for downstream middleware / logging
  req.securityMeta = {
    clientIp,
    proxied: hasSuspiciousHeaders || Boolean(xff),
    dataCenterIp: dcIp,
  };

  next();
}

/**
 * Key generator for express-rate-limit that uses the real client IP.
 */
function rateLimitKeyGenerator(req) {
  return getClientIp(req);
}

module.exports = {
  proxyDetection,
  rateLimitKeyGenerator,
  getClientIp,
  isDataCenterIp,
};
