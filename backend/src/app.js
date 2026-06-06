const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { errorMiddleware } = require('./middlewares/error.middleware');
const routes = require('./routes');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Adjust for production

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
