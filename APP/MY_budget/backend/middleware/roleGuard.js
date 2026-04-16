/**
 * Vérifie que l'utilisateur connecté possède le rôle requis.
 * À utiliser après authMiddleware.
 *
 * Usage : router.get('/admin/stats', authMiddleware, roleGuard('admin'), handler)
 */
const roleGuard = (requiredRole) => (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    next();
};

module.exports = roleGuard;
