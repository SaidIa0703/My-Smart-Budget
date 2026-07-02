// middleware/ownership.js
const { db } = require('../db');

const checkTransactionOwnership = async (req, res, next) => {
  const transactionId = req.params.id;
  const userId = req.user.id;

  try {
    const transaction = await db.oneOrNone(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    if (String(transaction.user_id) !== String(userId)) {
      console.warn(`[SECURITY] Tentative d'accès non autorisé : user ${userId} -> transaction ${transactionId}`);
      return res.status(403).json({ error: 'Accès interdit' });
    }

    req.transaction = transaction;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { checkTransactionOwnership };
