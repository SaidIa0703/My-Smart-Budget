const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db, connectMongo, testPostgres } = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const transactionsRoutes = require('./routes/transactions');
const budgetsRoutes = require('./routes/budgets');
const goalsRoutes = require('./routes/goals');
const reportsRoutes = require('./routes/reports');

const app = express();

// Headers de sécurité
app.use(helmet());
app.disable('x-powered-by');

// CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? [process.env.CORS_ORIGIN, `https://www.${process.env.CORS_ORIGIN.replace('https://', '')}`]
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing JSON — limité à 10kb pour éviter les payloads abusifs
app.use(express.json({ limit: '10kb' }));

// Rate limiting sur les routes d'authentification (brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check (public)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Route racine (public)
app.get('/', (_req, res) => {
  res.json({
    message: 'Smart Budget API',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      profile: '/api/profile',
      reports: '/api/reports',
      health: '/health',
    },
  });
});

// Migration automatique — idempotente, tourne à chaque démarrage
const runMigrations = async () => {
  try {
    await db.none(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP DEFAULT NOW();
      ALTER TABLE users        ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP DEFAULT NOW();
    `);
    console.log('✅ Migrations PostgreSQL appliquées');
  } catch (err) {
    console.error('❌ Erreur migrations:', err.message);
  }
};

// Démarrage
(async () => {
  await runMigrations();
  connectMongo();
  testPostgres();

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
})();
