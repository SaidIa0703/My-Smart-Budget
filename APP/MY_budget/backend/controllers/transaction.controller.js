// controllers/transaction.controller.js
const { db } = require('../db');
const budgetService = require('../services/budget.service');
const { body, validationResult } = require('express-validator');

class TransactionController {
  // Validation rules
  static validationRules() {
    return [
      body('amount').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
      body('type').isIn(['income', 'expense']).withMessage('Type invalide'),
      body('label').trim().notEmpty().withMessage('Libellé requis'),
      body('description').optional().trim().escape(),
    ];
  }

  async getAll(req, res) {
    try {
      const transactions = await db.query(
        `SELECT t.*, c.name AS category_name, c.color AS category_color
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = $1
         ORDER BY t.date DESC, t.created_at DESC`,
        [req.user.id]
      );
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createTransaction(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { amount, type, label, category_id, description, date } = req.body;
      const userId = req.user.id;

      const transaction = await db.one(
        `INSERT INTO transactions (user_id, category_id, label, amount, type, description, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, category_id || null, label, amount, type, description || null, date || new Date()]
      );

      // Vérification asynchrone du budget (sans bloquer la réponse)
      if (category_id && type === 'expense') {
        budgetService.checkBudgetAlert(userId, category_id, transaction.date)
          .catch(err => console.error('[BudgetAlert Error]', err.message));
      }

      res.status(201).json(transaction);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteTransaction(req, res) {
    try {
      await db.none('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      res.json({ message: 'Transaction supprimée' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await db.query(
        `SELECT type, COUNT(*) AS count, SUM(amount) AS total
         FROM transactions WHERE user_id = $1 GROUP BY type`,
        [req.user.id]
      );
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new TransactionController();
