const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-change-in-prod';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict',
};

const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Minimum 6 caractères' });
    }

    const existingUser = await db.oneOrNone(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await db.one(
      'INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await db.oneOrNone(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(404).json({ message: 'Identifiant inconnu' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// VERIFY TOKEN
router.get('/verify', (req, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: 'Token manquant' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false, message: 'Token invalide' });
  }
});

// REFRESH TOKEN
router.post('/refresh', (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token manquant' });
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.json({ message: 'Token renouvelé' });
  } catch {
    res.status(401).json({ message: 'Refresh token invalide' });
  }
});

// LOGOUT
router.post('/logout', (_req, res) => {
  res.clearCookie('accessToken', COOKIE_OPTS);
  res.clearCookie('refreshToken', COOKIE_OPTS);
  res.json({ message: 'Déconnecté' });
});

// RGPD — MODIFIER INFORMATIONS (art. 16)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.userId;
    const updates = [];
    const values = [];
    let idx = 1;

    if (name) { updates.push(`name = $${idx++}`); values.push(name); }
    if (email) {
      const existing = await db.oneOrNone('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });
      updates.push(`email = $${idx++}`); values.push(email);
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Minimum 6 caractères' });
      updates.push(`password = $${idx++}`); values.push(await bcrypt.hash(password, 10));
    }
    if (updates.length === 0) return res.status(400).json({ message: 'Aucune modification fournie' });

    values.push(userId);
    const updated = await db.one(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name`,
      values
    );
    res.json({ message: 'Informations mises à jour', user: updated });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// RGPD — EXPORTER DONNÉES (art. 15 & 20)
router.get('/export', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [user, transactions, budgets, objectifs, profile] = await Promise.all([
      db.oneOrNone('SELECT id, email, name, created_at FROM users WHERE id = $1', [userId]),
      db.any('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]),
      db.any('SELECT * FROM budgets WHERE user_id = $1', [userId]),
      db.any('SELECT * FROM objectifs WHERE user_id = $1', [userId]),
      db.oneOrNone('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
    ]);

    let reports = [];
    try {
      const Report = require('../models/Report');
      reports = await Report.find({ userId: String(userId) }).lean();
    } catch {}

    res.setHeader('Content-Disposition', `attachment; filename="mes-donnees-${new Date().toISOString().split('T')[0]}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json({ exportDate: new Date().toISOString(), user, transactions, budgets, objectifs, profile, reports });
  } catch (error) {
    console.error('Erreur export données:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// RGPD — SUPRIMER COMPTE (art. 17)
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.tx(async t => {
      await t.none('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await t.none('DELETE FROM budgets WHERE user_id = $1', [userId]);
      await t.none('DELETE FROM objectifs WHERE user_id = $1', [userId]);
      await t.none('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
      await t.none('DELETE FROM users WHERE id = $1', [userId]);
    });

    try {
      const Report = require('../models/Report');
      await Report.deleteMany({ userId: String(userId) });
    } catch {}

    res.clearCookie('token', { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'strict' });
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;