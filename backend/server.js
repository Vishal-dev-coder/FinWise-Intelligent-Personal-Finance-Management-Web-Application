const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'https://fin-wise-intelligent-personal-finan.vercel.app',
  'http://localhost:5173',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'FinWise Backend REST API',
  });
});

// Mount route handlers
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/budgets', require('./src/routes/budgetRoutes'));
app.use('/api/goals', require('./src/routes/goalRoutes'));
app.use('/api/debts', require('./src/routes/debtRoutes'));
app.use('/api/investments', require('./src/routes/investmentRoutes'));
app.use('/api/bills', require('./src/routes/billRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/insights', require('./src/routes/smartInsightsRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));

// 404 handler for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - API route not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[FinWise Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
