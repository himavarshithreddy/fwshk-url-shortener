const Link = require('../models/Link');
const shortid = require('shortid');

// Controller to create a shortened URL
const createShortUrl = async (req, res) => {
  const { originalUrl, customShortCode } = req.body;
  let shortCode = customShortCode || shortid.generate(); // Use custom shortcode or generate a random one
  
  try {
    // Check if the shortcode already exists
    let existingLink = await Link.findOne({ shortCode });
    if (existingLink) {
      return res.status(400).json({ error: 'Shortcode already exists' });
    }

    const newLink = new Link({
      originalUrl,
      shortCode,
    });
    
    await newLink.save();
    res.json({ shortCode, originalUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller to get the original URL
const getOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;
  
  try {
    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.redirect(link.originalUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller to track clicks
const trackClicks = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    link.clickCount++;
    await link.save();

    res.json({ clickCount: link.clickCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  trackClicks,
};
