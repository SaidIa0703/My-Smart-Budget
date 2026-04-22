const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../db', () => ({
  db: {
    any: jest.fn(),
    one: jest.fn(),
    oneOrNone: jest.fn(),
    none: jest.fn(),
  },
}));

const { db } = require('../db');
const goalsRoutes = require('../routes/goals');

const app = express();
app.use(express.json());
app.use('/api/goals', goalsRoutes);

const token = jwt.sign({ userId: 1 }, 'test-secret');
const auth = { Authorization: `Bearer ${token}` };

describe('GET /api/goals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(401);
  });

  it('retourne la liste des objectifs', async () => {
    db.any.mockResolvedValue([
      { id: 1, name: 'Vacances', icon: '✈️', target_amount: 2000, current_amount: 500 },
    ]);
    const res = await request(app).get('/api/goals').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Vacances');
  });
});

describe('POST /api/goals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 400 si champs manquants', async () => {
    const res = await request(app).post('/api/goals').set(auth).send({ name: 'Vacances' });
    expect(res.status).toBe(400);
  });

  it('retourne 400 si target_amount <= 0', async () => {
    const res = await request(app).post('/api/goals').set(auth).send({ name: 'Vacances', target_amount: 0 });
    expect(res.status).toBe(400);
  });

  it('retourne 201 et l\'objectif créé', async () => {
    db.one.mockResolvedValue({ id: 1, name: 'Vacances', icon: '✈️', target_amount: 2000, current_amount: 0 });
    const res = await request(app).post('/api/goals').set(auth).send({ name: 'Vacances', target_amount: 2000 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Vacances');
  });
});

describe('PUT /api/goals/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 403 si l\'objectif n\'appartient pas à l\'utilisateur', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).put('/api/goals/99').set(auth).send({ name: 'Vacances', target_amount: 2000 });
    expect(res.status).toBe(403);
  });

  it('retourne 200 et l\'objectif modifié', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1 });
    db.one.mockResolvedValue({ id: 1, name: 'Vacances', target_amount: 3000, current_amount: 800 });
    const res = await request(app).put('/api/goals/1').set(auth).send({ name: 'Vacances', target_amount: 3000, current_amount: 800 });
    expect(res.status).toBe(200);
    expect(res.body.target_amount).toBe(3000);
  });
});

describe('DELETE /api/goals/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 403 si l\'objectif n\'appartient pas à l\'utilisateur', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).delete('/api/goals/99').set(auth);
    expect(res.status).toBe(403);
  });

  it('retourne 200 si suppression réussie', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1 });
    db.none.mockResolvedValue();
    const res = await request(app).delete('/api/goals/1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Objectif supprimé');
  });
});
