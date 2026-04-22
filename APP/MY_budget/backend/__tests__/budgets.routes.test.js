const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

// Mock pg-promise
jest.mock('../db', () => ({
  db: {
    any: jest.fn(),
    one: jest.fn(),
    oneOrNone: jest.fn(),
    none: jest.fn(),
  },
}));

const { db } = require('../db');
const budgetsRoutes = require('../routes/budgets');

const app = express();
app.use(express.json());
app.use('/api/budgets', budgetsRoutes);

const token = jwt.sign({ userId: 1 }, 'test-secret');
const auth = { Authorization: `Bearer ${token}` };

describe('GET /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.status).toBe(401);
  });

  it('retourne la liste des budgets', async () => {
    db.any.mockResolvedValue([
      { id: 1, category: 'Alimentation', limit: 350, current_spending: 200 },
    ]);
    const res = await request(app).get('/api/budgets').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('Alimentation');
  });
});

describe('POST /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 400 si champs manquants', async () => {
    const res = await request(app).post('/api/budgets').set(auth).send({ category: 'Transport' });
    expect(res.status).toBe(400);
  });

  it('retourne 400 si limite <= 0', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).post('/api/budgets').set(auth).send({ category: 'Transport', limit: -50 });
    expect(res.status).toBe(400);
  });

  it('retourne 409 si catégorie déjà existante', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1 });
    const res = await request(app).post('/api/budgets').set(auth).send({ category: 'Transport', limit: 150 });
    expect(res.status).toBe(409);
  });

  it('retourne 201 et le budget créé', async () => {
    db.oneOrNone.mockResolvedValue(null);
    db.one.mockResolvedValue({ id: 2, category: 'Transport', limit: 150 });
    const res = await request(app).post('/api/budgets').set(auth).send({ category: 'Transport', limit: 150 });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Transport');
  });
});

describe('PUT /api/budgets/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 403 si le budget n\'appartient pas à l\'utilisateur', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).put('/api/budgets/99').set(auth).send({ category: 'Loisirs', limit: 100 });
    expect(res.status).toBe(403);
  });

  it('retourne 200 et le budget modifié', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1 });
    db.one.mockResolvedValue({ id: 1, category: 'Loisirs', limit: 100 });
    const res = await request(app).put('/api/budgets/1').set(auth).send({ category: 'Loisirs', limit: 100 });
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(100);
  });
});

describe('DELETE /api/budgets/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 403 si le budget n\'appartient pas à l\'utilisateur', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).delete('/api/budgets/99').set(auth);
    expect(res.status).toBe(403);
  });

  it('retourne 200 si suppression réussie', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1 });
    db.none.mockResolvedValue();
    const res = await request(app).delete('/api/budgets/1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Budget supprimé');
  });
});
