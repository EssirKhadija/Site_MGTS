// =============================================
// MGTS - Security Middlewares
// =============================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter for auth routes
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const securityMiddlewares = [
  helmet(),   // HTTP headers security
  xss(),      // Sanitize body input against XSS
  hpp(),      // Prevent HTTP Parameter Pollution
];

module.exports = { securityMiddlewares, globalLimiter, authLimiter };
