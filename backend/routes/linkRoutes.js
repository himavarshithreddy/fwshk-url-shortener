const express = require('express');
const router = express.Router();
const { createShortUrl, getOriginalUrl, trackClicks } = require('../controllers/linkController');

// Route to create short URL
router.post('/shorten', createShortUrl);

// Route to track clicks (must be before the catch-all /:shortCode route)
router.get('/track/:shortCode', trackClicks);

// Route to get the original URL (catch-all, must be last)
router.get('/:shortCode', getOriginalUrl);

module.exports = router;
