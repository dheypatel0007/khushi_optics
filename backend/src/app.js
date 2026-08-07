const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/cors');
const apiLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors(corsOptions));

// Compression (Gzip / Brotli)
app.use(compression());

// Body Parsers & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate Limiting for API routes
app.use('/api', apiLimiter);

// API Router
app.use('/api', apiRoutes);

// Serve Frontend Static Build if available
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const frontendPublicPath = path.join(__dirname, '../../frontend/public');

if (require('fs').existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDistPath, 'index.html')));
} else if (require('fs').existsSync(frontendPublicPath)) {
  app.use(express.static(frontendPublicPath));
}

// Global Error Handler
app.use(errorHandler);

module.exports = app;
