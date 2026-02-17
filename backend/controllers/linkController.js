const { createLink, findByShortCode, incrementClickCount } = require('../models/Link');
const shortid = require('shortid');

// Controller to create a shortened URL
const createShortUrl = async (req, res) => {
  const { originalUrl, customShortCode } = req.body;
  const shortCode = customShortCode || shortid.generate();

  try {
    const link = await createLink(shortCode, originalUrl);
    if (!link) {
      return res.status(400).json({ error: 'Shortcode already exists' });
    }

    res.json({ shortCode, originalUrl });
  } catch (err) {
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
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  trackClicks,
};
