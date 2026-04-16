const { db } = require('../db');

/**
 * Vérifie que la transaction ciblée (:id) appartient à l'utilisateur connecté.
 * Protège contre les attaques IDOR.
 * À utiliser après authMiddleware sur les routes avec :id.
 */
const ownerGuard = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const existing = await db.oneOrNone(
            'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (!existing) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        next();
    } catch (error) {
        console.error('ownerGuard error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = ownerGuard;
