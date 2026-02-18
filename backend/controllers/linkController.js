const { createLink, findByShortCode, incrementClickCount, checkRedisConnection } = require('../models/Link');
const shortid = require('shortid');

// Controller to create a shortened URL
const createShortUrl = async (req, res) => {
  const { originalUrl, customShortCode, ttl } = req.body;
  const shortCode = customShortCode || shortid.generate();

  // Validate TTL if provided
  let ttlSeconds = null;
  if (ttl) {
    ttlSeconds = parseInt(ttl, 10);
    if (isNaN(ttlSeconds) || ttlSeconds < 60) {
      return res.status(400).json({ error: 'TTL must be at least 60 seconds' });
    }
    if (ttlSeconds > 31536000) {
      return res.status(400).json({ error: 'TTL must not exceed 1 year (31536000 seconds)' });
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

    // Increment click count on redirect
    await incrementClickCount(shortCode);

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
