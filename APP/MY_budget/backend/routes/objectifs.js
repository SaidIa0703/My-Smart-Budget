const express = require('express');
const { db } = require('../db');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const objectifs = await db.any('SELECT * FROM objectifs WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(objectifs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  const { user_id, name, icon, target, current_amount, deadline } = req.body;
  try {
    const obj = await db.one(
      'INSERT INTO objectifs (user_id, name, icon, target, current_amount, deadline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [user_id, name, icon || '🎯', target, current_amount || 0, deadline || null]
    );
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await db.oneOrNone('SELECT user_id FROM objectifs WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Objectif introuvable' });
    if (existing.user_id !== req.user.userId) return res.status(403).json({ message: 'Accès interdit' });
    const { name, icon, target, current_amount, deadline } = req.body;
    const obj = await db.one(
      'UPDATE objectifs SET name=$1, icon=$2, target=$3, current_amount=$4, deadline=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, icon, target, current_amount, deadline || null, req.params.id]
    );
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await db.oneOrNone('SELECT user_id FROM objectifs WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'Objectif introuvable' });
    if (existing.user_id !== req.user.userId) return res.status(403).json({ message: 'Accès interdit' });
    await db.none('DELETE FROM objectifs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Objectif supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
