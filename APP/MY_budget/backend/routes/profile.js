const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes profil nécessitent une authentification
router.use(authMiddleware);

// POST /api/profile/save
router.post('/save', async (req, res) => {
    try {
        const userId = req.user.userId; // extrait du token JWT, pas du body
        const { profileType, revensuMensuels, situationFamiliale, objectifsEpargne, categoriesPrioritaires } = req.body;

        const profile = await db.one(
            `INSERT INTO user_profiles
                (user_id, profile_type, revenus_mensuels, situation_familiale, objectifs_epargne, categories_prioritaires)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET
                profile_type = $2, revenus_mensuels = $3, situation_familiale = $4,
                objectifs_epargne = $5, categories_prioritaires = $6
             RETURNING *`,
            [userId, profileType, revensuMensuels, situationFamiliale, objectifsEpargne, categoriesPrioritaires]
        );
        res.status(201).json(profile);
    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/profile  de l'utilisateur connecté uniquement
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const profile = await db.oneOrNone(
            'SELECT * FROM user_profiles WHERE user_id = $1',
            [userId]
        );
        res.json({ exists: !!profile, profile });
    } catch (error) {
        console.error('Erreur profil GET:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/profile/password — changer le mot de passe
router.put('/password', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Les deux mots de passe sont requis' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
            });
        }

        const user = await db.oneOrNone('SELECT password FROM users WHERE id = $1', [userId]);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.none('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

        res.json({ message: 'Mot de passe mis à jour' });
    } catch (error) {
        console.error('Erreur changement mdp:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/profile/export — exporter toutes les données de l'utilisateur (RGPD)
router.get('/export', async (req, res) => {
    try {
        const userId = req.user.userId;

        const [user, profile, transactions, budgets, goals] = await Promise.all([
            db.oneOrNone('SELECT id, email, name, created_at FROM users WHERE id = $1', [userId]),
            db.oneOrNone('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
            db.any('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]),
            db.any('SELECT * FROM budgets WHERE user_id = $1', [userId]),
            db.any('SELECT * FROM goals WHERE user_id = $1', [userId]).catch(() => []),
        ]);

        const payload = {
            exported_at: new Date().toISOString(),
            user,
            profile,
            transactions,
            budgets,
            goals,
        };

        res.setHeader('Content-Disposition', `attachment; filename="my-smart-budget-export-${userId}.json"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(payload);
    } catch (error) {
        console.error('Erreur export RGPD:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DELETE /api/profile/account — supprimer le compte et toutes les données (RGPD)
router.delete('/account', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: 'Mot de passe requis pour confirmer' });

        const user = await db.oneOrNone('SELECT password FROM users WHERE id = $1', [userId]);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Mot de passe incorrect' });

        // Suppression en cascade (transactions, budgets, profil, goals, puis user)
        await db.tx(async t => {
            await t.none('DELETE FROM transactions WHERE user_id = $1', [userId]);
            await t.none('DELETE FROM budgets WHERE user_id = $1', [userId]);
            await t.none('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
            await t.none('DELETE FROM goals WHERE user_id = $1', [userId]).catch(() => {});
            await t.none('DELETE FROM users WHERE id = $1', [userId]);
        });

        res.json({ message: 'Compte supprimé' });
    } catch (error) {
        console.error('Erreur suppression compte:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
