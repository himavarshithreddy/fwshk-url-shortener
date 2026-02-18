const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createShortUrl, getOriginalUrl, trackClicks, healthCheck } = require('../controllers/linkController');

// Rate limiter for URL creation - stricter limit
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Rate limiter for general requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Health check route
router.get('/health', healthCheck);

// Route to create short URL (with stricter rate limiting)
router.post('/shorten', createLimiter, createShortUrl);

// Route to track clicks (must be before the catch-all /:shortCode route)
router.get('/track/:shortCode', generalLimiter, trackClicks);

// Route to get the original URL (catch-all, must be last)
router.get('/:shortCode', generalLimiter, getOriginalUrl);

module.exports = router;
