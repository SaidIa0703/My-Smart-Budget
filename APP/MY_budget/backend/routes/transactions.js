const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');
const ownerGuard = require('../middleware/ownerGuard');

const router = express.Router();

// Toutes les routes transactions nécessitent une authentification
router.use(authMiddleware);

// POST /api/transactions/add
router.post('/add', async (req, res) => {
    try {
        const { name, category, amount, date } = req.body;
        const userId = req.user.userId; // extrait du token JWT, pas du body

        if (!name || !category || !amount) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        const transaction = await db.one(
            'INSERT INTO transactions (user_id, name, category, amount, date, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userId, name, category, amount, date]
        );
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/transactions — transactions de l'utilisateur connecté uniquement
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactions = await db.any(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );
        res.json(transactions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/transactions/stats — stats de l'utilisateur connecté (doit être avant /:id)
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await db.one(`
            SELECT
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_revenus,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_depenses,
                COUNT(*) as total_transactions
            FROM transactions
            WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 month'
        `, [userId]);

        res.json(stats);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/transactions/:id
router.put('/:id', ownerGuard, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, amount, date, is_recurring } = req.body;

        if (!name || !category || !amount) {
            return res.status(400).json({ message: 'Champs requis manquants' });
        }

        const transaction = await db.one(
            'UPDATE transactions SET name=$1, category=$2, amount=$3, date=$4, is_recurring=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
            [name, category, amount, date, is_recurring ?? false, id]
        );
        res.json(transaction);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', ownerGuard, async (req, res) => {
    try {
        const { id } = req.params;

        await db.none('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: 'Transaction supprimée' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
