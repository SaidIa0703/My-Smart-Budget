// services/budget.service.js
const { db } = require('../db');

class BudgetService {
  async checkBudgetAlert(userId, categoryId, date) {
    const budget = await db.oneOrNone(
      `SELECT * FROM budgets
       WHERE user_id = $1 AND category_id = $2
         AND start_date <= $3 AND (end_date IS NULL OR end_date >= $3)
       LIMIT 1`,
      [userId, categoryId, date]
    );
    if (!budget) return;

    const result = await db.one(
      `SELECT COALESCE(SUM(amount), 0) AS spent
       FROM transactions
       WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
         AND date >= $3 AND date <= COALESCE($4, CURRENT_DATE)`,
      [userId, categoryId, budget.start_date, budget.end_date]
    );

    const spent = parseFloat(result.spent);
    const percentage = (spent / parseFloat(budget.amount)) * 100;

    if (percentage >= (budget.alert_threshold || 80)) {
      await db.none(
        `INSERT INTO alerts (user_id, budget_id, type, message)
         VALUES ($1, $2, 'BUDGET_WARNING', $3)`,
        [
          userId,
          budget.id,
          `Attention : vous avez consommé ${percentage.toFixed(1)}% de votre budget "${budget.name || budget.category}".`
        ]
      );
    }
  }

  async getRemainingBudget(userId, categoryId, date = new Date()) {
    const budget = await db.oneOrNone(
      `SELECT * FROM budgets WHERE user_id = $1 AND category_id = $2 LIMIT 1`,
      [userId, categoryId]
    );
    if (!budget) return null;

    const result = await db.one(
      `SELECT COALESCE(SUM(amount), 0) AS spent FROM transactions
       WHERE user_id = $1 AND category_id = $2 AND type = 'expense'`,
      [userId, categoryId]
    );

    const spent = parseFloat(result.spent);
    const limit = parseFloat(budget.amount);
    return {
      budget,
      spent,
      remaining: limit - spent,
      percentage: (spent / limit) * 100
    };
  }
}

module.exports = new BudgetService();
