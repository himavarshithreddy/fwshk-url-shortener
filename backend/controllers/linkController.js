const { createLink, findByShortCode, incrementClickCount } = require('../models/Link');
const shortid = require('shortid');

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
  const { originalUrl, customShortCode } = req.body;

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
