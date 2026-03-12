// =============================================
// MGTS - Express App Configuration
// =============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { securityMiddlewares, globalLimiter } = require('./src/middlewares/security.middleware');
const errorHandler = require('./src/middlewares/errorHandler.middleware');

// Route imports
const authRoutes      = require('./src/routes/auth.routes');
const clientRoutes    = require('./src/routes/client.routes');
const supplierRoutes  = require('./src/routes/supplier.routes');
const transportRoutes = require('./src/routes/transport.routes');
const transitaireRoutes = require('./src/routes/transitaire.routes');
const adminRoutes     = require('./src/routes/admin.routes');
const productRoutes   = require('./src/routes/product.routes');
const messageRoutes   = require('./src/routes/message.routes');

const app = express();

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Security ──────────────────────────────────
securityMiddlewares.forEach(mw => app.use(mw));
app.use(globalLimiter);

// ── Body Parsers ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logger ────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static Files (uploads) ────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/client',      clientRoutes);
app.use('/api/supplier',    supplierRoutes);
app.use('/api/transport',   transportRoutes);
app.use('/api/transitaire', transitaireRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/messages',    messageRoutes);

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MGTS API is running 🚀', env: process.env.NODE_ENV });
});

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────
app.use(errorHandler);

module.exports = app;
