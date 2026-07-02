const express = require('express');
const cors = require('cors');
const { db, connectMongo, testPostgres } = require('./db');
const applySecurityMiddleware = require('./config/security');
const { verifyToken } = require('./middleware/auth');
const { checkTransactionOwnership } = require('./middleware/ownership');
const transactionController = require('./controllers/transaction.controller');
const authService = require('./services/auth.service');
const budgetService = require('./services/budget.service');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://16.171.253.76:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Sécurité (Helmet, rate-limit, sanitize, xss)
applySecurityMiddleware(app);

// Connexions DB
connectMongo();
testPostgres();

// ===== AUTH ROUTES =====

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.delete('/api/auth/account', verifyToken, async (req, res) => {
  try {
    await authService.deleteAccount(req.user.id);
    res.json({ message: 'Compte supprimé et données anonymisées.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TRANSACTION ROUTES (protégées JWT) =====

app.get('/api/transactions',
  verifyToken,
  (req, res) => transactionController.getAll(req, res)
);

app.post('/api/transactions',
  verifyToken,
  ...transactionController.constructor.validationRules
    ? transactionController.constructor.validationRules() : [],
  (req, res) => transactionController.createTransaction(req, res)
);

app.delete('/api/transactions/:id',
  verifyToken,
  checkTransactionOwnership,
  (req, res) => transactionController.deleteTransaction(req, res)
);

app.get('/api/stats',
  verifyToken,
  (req, res) => transactionController.getStats(req, res)
);

// ===== BUDGET ROUTES =====

app.get('/api/budgets', verifyToken, async (req, res) => {
  try {
    const budgets = await db.query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', verifyToken, async (req, res) => {
  const { category, category_id, name, amount, alert_threshold, start_date, end_date } = req.body;
  try {
    const budget = await db.one(
      `INSERT INTO budgets (user_id, category_id, category, name, amount, alert_threshold, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, category_id || null, category, name || category, amount, alert_threshold || 80, start_date || new Date(), end_date || null]
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/budgets/:id/remaining', verifyToken, async (req, res) => {
  try {
    const budget = await db.oneOrNone('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!budget) return res.status(404).json({ error: 'Budget non trouvé' });
    const data = await budgetService.getRemainingBudget(req.user.id, budget.category_id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ALERTS ROUTES =====

app.get('/api/alerts', verifyToken, async (req, res) => {
  try {
    const alerts = await db.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MONGODB REPORT ROUTES =====

app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const Report = require('./models/Report').default || require('./models/Report');
    const reports = await Report.find({ userId: req.user.id }).sort({ generatedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', verifyToken, async (req, res) => {
  try {
    const Report = require('./models/Report').default || require('./models/Report');
    const report = new Report({ ...req.body, userId: req.user.id });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CATEGORIES =====

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'My Smart Budget API v1.0',
    endpoints: {
      auth:         ['POST /api/auth/register', 'POST /api/auth/login', 'DELETE /api/auth/account'],
      transactions: ['GET /api/transactions', 'POST /api/transactions', 'DELETE /api/transactions/:id'],
      budgets:      ['GET /api/budgets', 'POST /api/budgets', 'GET /api/budgets/:id/remaining'],
      alerts:       ['GET /api/alerts'],
      reports:      ['GET /api/reports', 'POST /api/reports'],
      categories:   ['GET /api/categories'],
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
