// tests/integration/api/transactions.test.js
const request = require('supertest');
const app     = require('../../../index');
const { db }  = require('../../../db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_budget_secret_dev';

describe('Transactions API — Tests d\'intégration', () => {
  let authToken;
  let testUserId;
  let testCategoryId;

  beforeAll(async () => {
    // Créer un utilisateur de test
    const hash = await bcrypt.hash('Test123!@#', 12);
    const user = await db.one(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3) RETURNING id`,
      ['test-integration@mysmartbudget.com', hash, 'Test User']
    );
    testUserId = user.id;

    authToken = jwt.sign(
      { id: testUserId, email: 'test-integration@mysmartbudget.com', role: 'USER' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Créer une catégorie de test
    const cat = await db.one(
      `INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING id`,
      ['Test-Alimentation', 'shopping-cart', '#4CAF50']
    );
    testCategoryId = cat.id;
  });

  afterAll(async () => {
    await db.none('DELETE FROM transactions WHERE user_id = $1', [testUserId]);
    await db.none('DELETE FROM categories WHERE name = $1', ['Test-Alimentation']);
    await db.none('DELETE FROM users WHERE id = $1', [testUserId]);
    await db.$pool.end();
  });

  // ── POST /api/transactions ────────────────────────────────────────────────

  describe('POST /api/transactions', () => {
    test('crée une transaction avec des données valides', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label:       'Courses Carrefour',
          amount:      45.50,
          type:        'expense',
          category_id: testCategoryId,
          date:        new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.label).toBe('Courses Carrefour');
      expect(parseFloat(res.body.amount)).toBe(45.50);
      expect(res.body.user_id).toBe(testUserId);
    });

    test('rejette une transaction sans authentification', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ label: 'Test', amount: 10, type: 'expense' });

      expect(res.status).toBe(401);
    });

    test('rejette un montant invalide (négatif)', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ label: 'Test', amount: -50, type: 'expense' });

      expect(res.status).toBe(400);
    });

    test('rejette un type inconnu', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ label: 'Test', amount: 50, type: 'unknown' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/transactions ────────────────────────────────────────────────

  describe('GET /api/transactions', () => {
    test('retourne uniquement les transactions de l\'utilisateur connecté', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(t => {
        expect(t.user_id).toBe(testUserId);
      });
    });

    test('refuse sans token JWT', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });
  });

  // ── Sécurité XSS ────────────────────────────────────────────────────────

  describe('Sécurité — Injection XSS', () => {
    test('échappe les caractères XSS dans la description', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label:       'Test XSS',
          amount:      50,
          type:        'expense',
          description: '<script>alert("Hacked")</script>',
        });

      expect(res.status).toBe(201);
      expect(res.body.description).not.toContain('<script>');
    });
  });
});
