const express = require('express');
const { db } = require('../db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const budgets = await db.any('SELECT * FROM budgets WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
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

router.put('/:id', authenticate, async (req, res) => {
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

router.delete('/:id', authenticate, async (req, res) => {
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

module.exports = router;
