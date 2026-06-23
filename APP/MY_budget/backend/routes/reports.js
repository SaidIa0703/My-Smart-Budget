const express = require('express');
const Report = require('../models/Report');
const router = express.Router();

// GET tous les rapports d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST créer un rapport
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, type, data } = req.body;
    const report = new Report({ userId, title, description, type: type || 'monthly', data });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE supprimer un rapport
router.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rapport supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
