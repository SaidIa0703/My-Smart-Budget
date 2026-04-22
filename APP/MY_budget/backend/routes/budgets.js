const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/budgets — liste des budgets avec dépenses du mois en cours
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const budgets = await db.any(`
      SELECT
        b.id,
        b.category,
        b.limit,
        b.created_at,
        b.updated_at,
        COALESCE(
          SUM(CASE WHEN t.amount < 0
            AND date_trunc('month', t.date) = date_trunc('month', CURRENT_DATE)
            THEN ABS(t.amount) ELSE 0 END
          ), 0
        ) AS current_spending
      FROM budgets b
      LEFT JOIN transactions t
        ON t.user_id = b.user_id AND LOWER(t.category) = LOWER(b.category)
      WHERE b.user_id = $1
      GROUP BY b.id, b.category, b.limit, b.created_at, b.updated_at
      ORDER BY b.category
    `, [userId]);

    res.json(budgets);
  } catch (error) {
    console.error('GET /api/budgets error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/budgets — créer un budget
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, limit } = req.body;

    if (!category || limit === undefined || limit === null) {
      return res.status(400).json({ message: 'Catégorie et limite requis' });
    }
    if (Number(limit) <= 0) {
      return res.status(400).json({ message: 'La limite doit être positive' });
    }

    // Empêcher les doublons de catégorie pour un même utilisateur
    const existing = await db.oneOrNone(
      'SELECT id FROM budgets WHERE user_id = $1 AND LOWER(category) = LOWER($2)',
      [userId, category]
    );
    if (existing) {
      return res.status(409).json({ message: 'Un budget existe déjà pour cette catégorie' });
    }

    const budget = await db.one(
      'INSERT INTO budgets (user_id, category, limit) VALUES ($1, $2, $3) RETURNING *',
      [userId, category, Number(limit)]
    );
    res.status(201).json(budget);
  } catch (error) {
    console.error('POST /api/budgets error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/budgets/:id — modifier un budget
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { category, limit } = req.body;

    if (!category || limit === undefined || limit === null) {
      return res.status(400).json({ message: 'Catégorie et limite requis' });
    }
    if (Number(limit) <= 0) {
      return res.status(400).json({ message: 'La limite doit être positive' });
    }

    // Vérification propriété (IDOR)
    const existing = await db.oneOrNone(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!existing) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const budget = await db.one(
      'UPDATE budgets SET category=$1, limit=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [category, Number(limit), id]
    );
    res.json(budget);
  } catch (error) {
    console.error('PUT /api/budgets error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/budgets/:id — supprimer un budget
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await db.oneOrNone(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!existing) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await db.none('DELETE FROM budgets WHERE id = $1', [id]);
    res.json({ message: 'Budget supprimé' });
  } catch (error) {
    console.error('DELETE /api/budgets error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
