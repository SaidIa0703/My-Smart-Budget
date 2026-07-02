// services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_budget_secret_dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
  }

  async register(email, password, name) {
    const existing = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) throw new Error('Email déjà utilisé');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await db.one(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role`,
      [email, password_hash, name]
    );

    return { user, token: this.generateAccessToken(user) };
  }

  async login(email, password) {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE', [email]);

    if (!user) throw new Error('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Identifiants invalides');

    const token = this.generateAccessToken(user);
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async deleteAccount(userId) {
    const { v4: uuidv4 } = require('uuid');
    const client = await db.$pool.connect();
    await client.query('BEGIN');
    try {
      await client.query(
        `UPDATE users SET email=$1, name='Deleted', password_hash='', is_deleted=TRUE, deleted_at=NOW() WHERE id=$2`,
        [`deleted-${uuidv4()}@anonyme.local`, userId]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AuthService();
