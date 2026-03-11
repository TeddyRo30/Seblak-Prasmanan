// src/app.js - Express application setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';

const app = express();

// ===== MIDDLEWARE =====

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// ===== HEALTH CHECK ENDPOINT =====
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== API ROUTES =====

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Menu routes
app.use('/api/v1/menu', menuRoutes);

// Order routes
app.use('/api/v1/orders', orderRoutes);

// Payment routes
app.use('/api/v1', paymentRoutes);

// API v1 status
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Seblak Prasmanan API v1',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle custom errors
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      status: err.status,
      error: {
        code: err.code || 'ERROR',
        message: err.message || 'An error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      status: 401,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      status: 401,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
});

export default app;