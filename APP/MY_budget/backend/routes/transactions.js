const express = require('express');
const {db} = require('../db');

const router = express.Router();

async function checkBudgetAlert(db, userId, category) {
    const budget = await db.oneOrNone(
        'SELECT * FROM budgets WHERE user_id = $1 AND category = $2',
        [userId, category]
    );
    if (!budget || !budget.limit || parseFloat(budget.limit) === 0) return null;

    const result = await db.one(
        `SELECT COALESCE(SUM(ABS(amount)), 0) AS total
         FROM transactions
         WHERE user_id = $1 AND category = $2
           AND amount < 0
           AND date >= date_trunc('month', CURRENT_DATE)`,
        [userId, category]
    );

    const spent = parseFloat(result.total);
    const limit = parseFloat(budget.limit);
    const percentage = (spent / limit) * 100;

    let threshold = null;
    if (percentage >= 100) threshold = '100';
    else if (percentage >= 90) threshold = '90';
    else if (percentage >= 70) threshold = '70';

    if (!threshold) return null;

    const existing = await db.oneOrNone(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND budget_id = $2 AND type = $3
           AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [userId, budget.id, threshold]
    );
    if (existing) return null;

    await db.none(
        'INSERT INTO notifications (user_id, budget_id, type, category, percentage) VALUES ($1, $2, $3, $4, $5)',
        [userId, budget.id, threshold, category, percentage.toFixed(2)]
    );

    return { threshold, percentage: Math.round(percentage), category, limit };
}

router.post('/add', async (req, res) => {
    try {
        const { userId, name, category, amount, date } = req.body;

        if (!userId || !name || !category || !amount) {
            return res.status(400).json({ message: 'Tout les champs sont requis' });
        }

        const transaction = await db.one(
            'INSERT INTO transactions (user_id, name, category, amount, date, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
            [userId, name, category, amount, date]
        );

        let alert = null;
        if (parseFloat(amount) < 0) {
            alert = await checkBudgetAlert(db, userId, category);
        }

        res.status(201).json({ transaction, alert });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

//recup transaction de l'user
router.get('/:userId', async (req, res) =>{
    try{
        const { userId } = req.params;
        const transactions = await db.any(
            'SELECT * FROM TRANSACTIONS WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );
        res.json(transactions)
    }catch (error){
        console.error('Error:', error);
        res.status(500).json({ message : 'Erreur serveur'});
    }
});

// modifier une transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, amount, date } = req.body;
        const transaction = await db.one(
            'UPDATE transactions SET name=$1, category=$2, amount=$3, date=$4 WHERE id=$5 RETURNING *',
            [name, category, amount, date, id]
        );
        res.json(transaction);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

//suprimer une transactions
router.delete('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        await db.one('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({message : 'Transaction supprimée'});
    }catch(error){
        console.error('Error', error);
        res.status(500).json({message : 'Transaction supprimée'});
    }
});

//recuperation statistique 

router.get('/stats/:userId', async (req, res) => {
    try{
        const { userId } = req.params;

        const stats = await db.one(`
      SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_revenus,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_depenses,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 month'
    `, [userId]);

      res.json(stats);
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message : 'Erreur serveur'});
    }
});

// notifications du mois courant par user
router.get('/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await db.any(
            `SELECT n.*, b.category, b.limit
             FROM notifications n
             JOIN budgets b ON n.budget_id = b.id
             WHERE n.user_id = $1
               AND n.created_at >= date_trunc('month', CURRENT_DATE)
             ORDER BY n.created_at DESC`,
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;