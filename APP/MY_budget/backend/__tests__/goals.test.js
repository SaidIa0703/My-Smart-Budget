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
const objectifsRouter = require('../routes/objectifs');

const JWT_SECRET = 'your-secret-key-change-in-prod';
const authToken = jwt.sign({ userId: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/objectifs', objectifsRouter);

describe('Goals (Objectifs)', () => {
  test('GET /:userId - liste des objectifs', async () => {
    db.any.mockResolvedValue([
      { id: 1, user_id: 1, name: 'Vacances', target: 2000, current_amount: 500 },
      { id: 2, user_id: 1, name: 'Voiture', target: 10000, current_amount: 3000 },
    ]);

    const res = await request(app).get('/api/objectifs/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /:userId - erreur serveur', async () => {
    db.any.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/objectifs/1');

    expect(res.status).toBe(500);
  });

  test('POST / - création réussie', async () => {
    db.one.mockResolvedValue({
      id: 3, user_id: 1, name: 'MacBook', icon: '💻', target: 2500, current_amount: 0,
    });

    const res = await request(app)
      .post('/api/objectifs')
      .send({ user_id: 1, name: 'MacBook', target: 2500 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('MacBook');
  });

  test('POST / - erreur serveur', async () => {
    db.one.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/objectifs')
      .send({ user_id: 1, name: 'MacBook', target: 2500 });

    expect(res.status).toBe(500);
  });

  test('PUT /:id - modification autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.one.mockResolvedValue({
      id: 1, name: 'Vacances +', icon: '✈️', target: 3000, current_amount: 800,
    });

    const res = await request(app)
      .put('/api/objectifs/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ name: 'Vacances +', icon: '✈️', target: 3000, current_amount: 800 });

    expect(res.status).toBe(200);
    expect(res.body.target).toBe(3000);
  });

  test('PUT /:id - objectif introuvable', async () => {
    db.oneOrNone.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/objectifs/999')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ name: 'X', icon: '🎯', target: 100, current_amount: 0 });

    expect(res.status).toBe(404);
  });

  test('PUT /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .put('/api/objectifs/1')
      .set('Cookie', [`accessToken=${authToken}`])
      .send({ name: 'Hack', icon: '🎯', target: 100, current_amount: 0 });

    expect(res.status).toBe(403);
  });

  test('PUT /:id - non authentifié', async () => {
    const res = await request(app)
      .put('/api/objectifs/1')
      .send({ name: 'X', icon: '🎯', target: 100, current_amount: 0 });

    expect(res.status).toBe(401);
  });

  test('DELETE /:id - suppression autorisée (propriétaire)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 1 });
    db.none.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/api/objectifs/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimé/);
  });

  test('DELETE /:id - IDOR refusé (autre utilisateur)', async () => {
    db.oneOrNone.mockResolvedValue({ user_id: 99 });

    const res = await request(app)
      .delete('/api/objectifs/1')
      .set('Cookie', [`accessToken=${authToken}`]);

    expect(res.status).toBe(403);
  });
});
