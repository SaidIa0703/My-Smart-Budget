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
const transactionsRouter = require('../routes/transactions');

const JWT_SECRET = 'your-secret-key-change-in-prod';
const authToken = jwt.sign({ userId: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/transactions', transactionsRouter);

describe('Transactions', () => {
  test('POST /add - ajout réussi', async () => {
    db.one.mockResolvedValue({
      id: 1, user_id: 1, name: 'Courses', category: 'Alimentation', amount: 50, date: '2025-01-01',
    });

    const res = await request(app)
      .post('/api/transactions/add')
      .send({ userId: 1, name: 'Courses', category: 'Alimentation', amount: 50, date: '2025-01-01' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.name).toBe('Courses');
  });

  test('POST /add - champs manquants', async () => {
    const res = await request(app)
      .post('/api/transactions/add')
      .send({ name: 'Courses' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/requis/);
  });

  test('GET /:userId - liste des transactions', async () => {
    db.any.mockResolvedValue([
      { id: 1, name: 'Courses', amount: -50 },
      { id: 2, name: 'Salaire', amount: 2000 },
    ]);

    const res = await request(app).get('/api/transactions/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('PUT /:id - modification autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.one.mockResolvedValue({ id: 1, name: 'Modifié', category: 'Loisirs', amount: -30 });

    const res = await request(app)
      .put('/api/transactions/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ name: 'Modifié', category: 'Loisirs', amount: -30, date: '2025-01-01' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Modifié');
  });

  test('PUT /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .put('/api/transactions/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ name: 'Hack', category: 'Loisirs', amount: -30, date: '2025-01-01' });

    expect(res.status).toBe(403);
  });

  test('DELETE /:id - suppression autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.none.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/api/transactions/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimée/);
  });

  test('DELETE /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .delete('/api/transactions/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(403);
  });
});
