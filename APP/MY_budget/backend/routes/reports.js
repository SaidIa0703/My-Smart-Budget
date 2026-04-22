const express = require('express');
const { db } = require('../db');
const Report = require('../models/report');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/reports/generate
// Calcule les statistiques du mois en cours depuis PostgreSQL (pas sauvegardé)
router.get('/generate', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query; // format YYYY-MM, défaut = mois courant

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const startDate = `${targetMonth}-01`;
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1))
      .toISOString()
      .split('T')[0];

    // Totaux revenus / dépenses du mois
    const totaux = await db.one(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)  AS total_revenus,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS total_depenses,
        COUNT(*) AS nb_transactions
      FROM transactions
      WHERE user_id = $1 AND date >= $2 AND date < $3
    `, [userId, startDate, endDate]);

    // Dépenses par catégorie du mois
    const parCategorie = await db.any(`
      SELECT
        category AS name,
        SUM(ABS(amount)) AS montant
      FROM transactions
      WHERE user_id = $1 AND amount < 0 AND date >= $2 AND date < $3
      GROUP BY category
      ORDER BY montant DESC
    `, [userId, startDate, endDate]);

    // Évolution mensuelle sur les 6 derniers mois
    const evolution = await db.any(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS mois,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)  AS revenus,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS depenses
      FROM transactions
      WHERE user_id = $1 AND date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date)
    `, [userId]);

    // Calcul des pourcentages par catégorie
    const totalDep = Number(totaux.total_depenses);
    const parCategorieAvecPct = parCategorie.map(c => ({
      name: c.name,
      montant: Number(c.montant),
      pct: totalDep > 0 ? Math.round((Number(c.montant) / totalDep) * 100) : 0,
    }));

    res.json({
      mois: targetMonth,
      totalRevenus: Number(totaux.total_revenus),
      totalDepenses: Number(totaux.total_depenses),
      solde: Number(totaux.total_revenus) - Number(totaux.total_depenses),
      nbTransactions: Number(totaux.nb_transactions),
      parCategorie: parCategorieAvecPct,
      evolution: evolution.map(e => ({
        mois: e.mois,
        revenus: Number(e.revenus),
        depenses: Number(e.depenses),
      })),
    });
  } catch (error) {
    console.error('GET /api/reports/generate error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reports — liste des rapports sauvegardés (MongoDB)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('GET /api/reports error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/reports — sauvegarder un rapport dans MongoDB
router.post('/', async (req, res) => {
  try {
    const { title, description, data, type } = req.body;
    if (!title || !data) {
      return res.status(400).json({ message: 'Titre et données requis' });
    }
    const report = new Report({
      userId: String(req.user.userId),
      title,
      description: description || '',
      data,
      type: type || 'monthly',
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('POST /api/reports error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/reports/:id — supprimer un rapport archivé
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: String(req.user.userId),
    });
    if (!report) return res.status(404).json({ message: 'Rapport introuvable' });
    res.json({ message: 'Rapport supprimé' });
  } catch (error) {
    console.error('DELETE /api/reports error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
