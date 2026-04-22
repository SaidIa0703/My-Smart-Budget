const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const goals = await db.any(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(goals);
  } catch (error) {
    console.error('GET /api/goals error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/goals — créer un objectif
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, icon, target_amount, current_amount, deadline, color } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ message: 'Nom et montant cible requis' });
    }
    if (Number(target_amount) <= 0) {
      return res.status(400).json({ message: 'Le montant cible doit être positif' });
    }

    const goal = await db.one(
      `INSERT INTO savings_goals (user_id, name, icon, target_amount, current_amount, deadline, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
        name,
        icon || '🎯',
        Number(target_amount),
        Number(current_amount || 0),
        deadline || null,
        color || '#6366f1',
      ]
    );
    res.status(201).json(goal);
  } catch (error) {
    console.error('POST /api/goals error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/goals/:id — modifier un objectif
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, icon, target_amount, current_amount, deadline, color } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ message: 'Nom et montant cible requis' });
    }

    // Vérification propriété
    const existing = await db.oneOrNone(
      'SELECT id FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!existing) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const goal = await db.one(
      `UPDATE savings_goals
       SET name=$1, icon=$2, target_amount=$3, current_amount=$4, deadline=$5, color=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, icon || '🎯', Number(target_amount), Number(current_amount || 0), deadline || null, color || '#6366f1', id]
    );
    res.json(goal);
  } catch (error) {
    console.error('PUT /api/goals error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await db.oneOrNone(
      'SELECT id FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!existing) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await db.none('DELETE FROM savings_goals WHERE id = $1', [id]);
    res.json({ message: 'Objectif supprimé' });
  } catch (error) {
    console.error('DELETE /api/goals error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
