jest.mock('../db', () => ({
  db: {
    one: jest.fn(),
    oneOrNone: jest.fn(),
    any: jest.fn(),
    none: jest.fn(),
    query: jest.fn(),
    tx: jest.fn(),
  },
  connectMongo: jest.fn(),
  testPostgres: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const budgetsRouter = require('../routes/budgets');

const JWT_SECRET = 'your-secret-key-change-in-prod';
const authToken = jwt.sign({ userId: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/budgets', budgetsRouter);

describe('Budgets', () => {
  test('GET /:userId - liste des budgets', async () => {
    db.any.mockResolvedValue([
      { id: 1, user_id: 1, category: 'Alimentation', limit: 500 },
      { id: 2, user_id: 1, category: 'Loisirs', limit: 200 },
    ]);

    const res = await request(app).get('/api/budgets/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /:userId - erreur serveur', async () => {
    db.any.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/budgets/1');

    expect(res.status).toBe(500);
  });

  test('POST / - création réussie', async () => {
    db.one.mockResolvedValue({ id: 3, user_id: 1, category: 'Transport', limit: 150 });

    const res = await request(app)
      .post('/api/budgets')
      .send({ user_id: 1, category: 'Transport', limit: 150 });

    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Transport');
  });

  test('POST / - erreur serveur', async () => {
    db.one.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/budgets')
      .send({ user_id: 1, category: 'Transport', limit: 150 });

    expect(res.status).toBe(500);
  });

  test('PUT /:id - modification autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.one.mockResolvedValue({ id: 1, category: 'Alimentation', limit: 600 });

    const res = await request(app)
      .put('/api/budgets/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ category: 'Alimentation', limit: 600 });

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(600);
  });

  test('PUT /:id - budget introuvable', async () => {
    db.oneOrNone.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/budgets/999')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ category: 'Alimentation', limit: 600 });

    expect(res.status).toBe(404);
  });

  test('PUT /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .put('/api/budgets/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ category: 'Alimentation', limit: 600 });

    expect(res.status).toBe(403);
  });

  test('DELETE /:id - suppression autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.none.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/api/budgets/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimé/);
  });

  test('DELETE /:id - budget introuvable', async () => {
    db.oneOrNone.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/budgets/999')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(404);
  });

  test('DELETE /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .delete('/api/budgets/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(403);
  });
});
