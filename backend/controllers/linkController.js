const { createLink, findByShortCode, incrementClickCount, checkRedisConnection } = require('../models/Link');
const shortid = require('shortid');

const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 31536000; // 1 year

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
  const { originalUrl, customShortCode, ttl } = req.body;

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
    const link = await createLink(shortCode, originalUrl, ttlSeconds);
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

// Controller to get the original URL and redirect (also tracks clicks)
const getOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const link = await findByShortCode(shortCode);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Increment click count asynchronously (fire-and-forget) to avoid delaying the redirect
    incrementClickCount(shortCode).catch(err =>
      console.error('Failed to increment click count for', shortCode, ':', err.message)
    );

    res.redirect(link.originalUrl);
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
