const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const linkRoutes = require('./routes/linkRoutes');

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes (no /api prefix so shortened URLs work at root level)
app.use('/', linkRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless deployment
module.exports = app;
