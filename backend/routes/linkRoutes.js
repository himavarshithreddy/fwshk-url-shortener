const express = require('express');
const router = express.Router();
const { createShortUrl, getOriginalUrl, trackClicks } = require('../controllers/linkController');

// Route to create short URL
router.post('/shorten', createShortUrl);

// Route to get the original URL
router.get('/:shortCode', getOriginalUrl);

// Route to track clicks (you can track clicks by simply hitting the shortened link)
router.get('/track/:shortCode', trackClicks);

module.exports = router;
