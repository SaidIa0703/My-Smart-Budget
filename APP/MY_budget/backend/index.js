const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const { connectMongo, testPostgres } = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const transactionsRoutes = require('./routes/transactions');

const app = express();

// Sécurité de base
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

// Parsing JSON — doit être avant toutes les routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionsRoutes);

// Reports MongoDB (protégé)
app.get('/api/reports', authMiddleware, async (req, res) => {
  try {
    const Report = require('./models/report');
    const reports = await Report.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Erreur reports:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', authMiddleware, async (req, res) => {
  try {
    const Report = require('./models/report');
    const { title, description, data, type } = req.body;
    const report = new Report({ userId: req.user.userId, title, description, data, type });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Erreur reports:', err);
    res.status(500).json({ error: err.message });
  }
});

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

// Connexion aux bases de données
connectMongo();
testPostgres();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
