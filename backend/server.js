const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const linkRoutes = require('./routes/linkRoutes');
const { proxyDetection } = require('./middleware/security');

dotenv.config();

const app = express();

// Trust the first proxy (Vercel / load-balancer) so req.ip reflects the real client
app.set('trust proxy', 1);

// Security headers (XSS, HSTS, Content-Type sniffing, etc.)
app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Proxy detection – block requests with too many proxy hops
app.use(proxyDetection);

// Middleware
app.use(express.json({ limit: '10kb' }));

// Serve favicon explicitly
const faviconLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.get('/favicon.svg', faviconLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

// Routes (no /api prefix so shortened URLs work at root level)
app.use('/', linkRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless deployment
module.exports = app;
