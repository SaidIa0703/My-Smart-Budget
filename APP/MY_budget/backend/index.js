const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db, connectMongo, testPostgres } = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const transactionsRoutes = require('./routes/transactions');
const objectifsRoutes = require('./routes/objectifs');
const reportsRoutes = require('./routes/reports');
const authenticate = require('./middleware/authenticate');
const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, réessayez dans 15 minutes' },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(globalLimiter);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/objectifs', objectifsRoutes);
app.use('/api/reports', reportsRoutes);

// Connecter MongoDB et PostgreSQL au démarrage
connectMongo();
testPostgres();

// ===== ROUTES POSTGRESQL =====

// GET toutes les transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(transactions);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST une nouvelle transaction
app.post('/api/transactions', async (req, res) => {
  const { user_id, label, amount, type } = req.body;
  try {
    const transaction = await db.one(
      'INSERT INTO transactions (user_id, label, amount, type, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [user_id || 1, label, amount, type]
    );
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE une transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Transaction supprimée' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET budgets par user
app.get('/api/budgets/:userId', async (req, res) => {
  try {
    const budgets = await db.any('SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST un nouveau budget
app.post('/api/budgets', async (req, res) => {
  const { user_id, category, limit } = req.body;
  try {
    const budget = await db.one(
      'INSERT INTO budgets (user_id, category, "limit", created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [user_id, category, limit]
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier un budget
app.put('/api/budgets/:id', authenticate, async (req, res) => {
  try {
    const existing = await db.oneOrNone('SELECT user_id FROM budgets WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Budget introuvable' });
    if (existing.user_id !== req.user.userId) return res.status(403).json({ error: 'Accès interdit' });
    const { category, limit } = req.body;
    const budget = await db.one(
      'UPDATE budgets SET category=$1, "limit"=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [category, limit, req.params.id]
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE un budget
app.delete('/api/budgets/:id', authenticate, async (req, res) => {
  try {
    const existing = await db.oneOrNone('SELECT user_id FROM budgets WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Budget introuvable' });
    if (existing.user_id !== req.user.userId) return res.status(403).json({ error: 'Accès interdit' });
    await db.none('DELETE FROM budgets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Budget supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ROUTES MONGODB =====

// GET tous les reports
app.get('/api/reports', async (req, res) => {
  try {
    const Report = require('./models/Report').default;
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST un nouveau report
app.post('/api/reports', async (req, res) => {
  try {
    const Report = require('./models/Report').default;
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const transactions = await db.query('SELECT type, COUNT(*) as count, SUM(amount) as total FROM transactions GROUP BY type');
    res.json(transactions);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Budget API',
    endpoints: {
      transactions: '/api/transactions',
      budgets: '/api/budgets',
      reports: '/api/reports',
      stats: '/api/stats',
      health: '/health',
    },
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

