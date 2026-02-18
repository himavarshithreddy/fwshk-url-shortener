const { createLink, getRedirectRecord, findByShortCode, incrementClickCount, checkRedisConnection } = require('../models/Link');
const shortid = require('shortid');

const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 31536000; // 1 year
const VALID_REDIRECT_TYPES = new Set(['301', '302', '308']);

/**
 * Validate that a string is a well-formed URL.
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Controller to create a shortened URL
const createShortUrl = async (req, res) => {
  const { originalUrl, customShortCode, ttl, redirectType } = req.body;

  if (!originalUrl || typeof originalUrl !== 'string') {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  if (originalUrl.length > 2048) {
    return res.status(400).json({ error: 'URL is too long (max 2048 characters)' });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
  }

  if (customShortCode) {
    if (!/^[a-zA-Z0-9-]+$/.test(customShortCode)) {
      return res.status(400).json({ error: 'Short code can only contain letters, numbers, and hyphens' });
    }
    if (customShortCode.length > 20) {
      return res.status(400).json({ error: 'Short code must be 20 characters or fewer' });
    }
  }

  // Validate redirect type
  const resolvedRedirectType = redirectType && VALID_REDIRECT_TYPES.has(String(redirectType))
    ? String(redirectType)
    : '308';

  const shortCode = customShortCode || shortid.generate();

  // Validate TTL if provided
  let ttlSeconds = null;
  if (ttl) {
    ttlSeconds = parseInt(ttl, 10);
    if (isNaN(ttlSeconds) || ttlSeconds < MIN_TTL_SECONDS) {
      return res.status(400).json({ error: `TTL must be at least ${MIN_TTL_SECONDS} seconds` });
    }
    if (ttlSeconds > MAX_TTL_SECONDS) {
      return res.status(400).json({ error: `TTL must not exceed 1 year (${MAX_TTL_SECONDS} seconds)` });
    }
  }

  try {
    const link = await createLink(shortCode, originalUrl, ttlSeconds, resolvedRedirectType);
    if (!link) {
      return res.status(400).json({ error: 'Shortcode already exists' });
    }

    res.json({ shortCode, originalUrl, expiresAt: link.expiresAt });
  } catch (err) {
    if (err.message === 'Redis connection is not available') {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error creating short URL:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller to redirect to the original URL (optimised fast path)
const getOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;

  // Validate format locally before any I/O
  if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
    return res.status(404).json({ error: 'Link not found' });
  }

  try {
    const record = await getRedirectRecord(shortCode);

    if (!record) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Expired?
    if (record.t > 0 && Date.now() > record.t) {
      return res.status(410).json({ error: 'Link has expired' });
    }

    // Disabled?
    if (record.e !== 1) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const statusCode = parseInt(record.r, 10) || 308;

    // Send redirect immediately with minimal headers
    res.set('Location', record.u);
    if (statusCode === 301 || statusCode === 308) {
      res.set('Cache-Control', 'public, max-age=86400, immutable');
    } else {
      res.set('Cache-Control', 'no-store');
    }
    res.status(statusCode).end();
    // Increment click count asynchronously (fire-and-forget) to avoid delaying the redirect
    incrementClickCount(shortCode).catch(err =>
      console.error('Failed to increment click count for', shortCode, ':', err.message)
    );

    // Fire analytics asynchronously – never blocks the redirect.
    // Note: in serverless environments a small number of clicks may be
    // lost if the process is terminated before the timer fires; this is
    // an acceptable trade-off versus adding async queue infrastructure.
    setTimeout(() => incrementClickCount(shortCode), 0);
  } catch (err) {
    if (err.message === 'Redis connection is not available') {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error redirecting:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller to track clicks and return link info
const trackClicks = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const link = await findByShortCode(shortCode);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      clicks: link.clickCount,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
    });
  } catch (err) {
    if (err.message === 'Redis connection is not available') {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    console.error('Error tracking clicks:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Health check controller
const healthCheck = async (req, res) => {
  const redisOk = await checkRedisConnection();
  const status = redisOk ? 'healthy' : 'degraded';
  const statusCode = redisOk ? 200 : 503;

  res.status(statusCode).json({
    status,
    redis: redisOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  trackClicks,
  healthCheck,
};
