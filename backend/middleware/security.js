/**
 * Security middleware for proxy detection and IP-based abuse prevention.
 */

const MAX_FORWARDED_IPS = 5;

/**
 * Extract the real client IP from the request.
 * Works with Express trust proxy setting enabled.
 */
function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Middleware that detects potentially suspicious proxy usage.
 * Flags requests that pass through an unusual number of proxies
 * or include known anonymising headers.
 */
function proxyDetection(req, res, next) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const ips = xff.split(',').map(ip => ip.trim()).filter(Boolean);
    if (ips.length > MAX_FORWARDED_IPS) {
      return res.status(403).json({ error: 'Request blocked: too many proxy hops detected.' });
    }
  }

  // Flag requests with common anonymising proxy headers
  const suspiciousHeaders = ['via', 'x-proxy-id', 'forwarded'];
  const hasSuspiciousHeaders = suspiciousHeaders.some(h => req.headers[h]);

  // Attach metadata for downstream middleware / logging
  req.securityMeta = {
    clientIp: getClientIp(req),
    proxied: hasSuspiciousHeaders || Boolean(xff),
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
};
