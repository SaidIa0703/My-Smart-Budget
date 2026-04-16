const express = require('express');
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

module.exports = router;
