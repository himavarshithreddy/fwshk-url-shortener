const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const linkRoutes = require('./routes/linkRoutes');

dotenv.config();

const app = express();

app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use('/api', linkRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
