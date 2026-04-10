const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret';

// Mock pg-promise db
jest.mock('../db', () => ({
  db: {
    oneOrNone: jest.fn(),
    one: jest.fn(),
  },
}));

const { db } = require('../db');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 400 si champs manquants', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com' });
    expect(res.status).toBe(400);
  });

  it('retourne 400 si mot de passe trop court', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: '123', name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('retourne 400 si email déjà utilisé', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1, email: 'a@a.com' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: 'Password123', name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email déjà utilisé');
  });

  it('retourne 201 et un token si inscription réussie', async () => {
    db.oneOrNone.mockResolvedValue(null);
    db.one.mockResolvedValue({ id: 1, email: 'a@a.com', name: 'Test' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: 'Password123', name: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  const bcrypt = require('bcryptjs');

  beforeEach(() => jest.clearAllMocks());

  it('retourne 400 si champs manquants', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com' });
    expect(res.status).toBe(400);
  });

  it('retourne 401 si utilisateur introuvable', async () => {
    db.oneOrNone.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'Password123' });
    expect(res.status).toBe(401);
  });

  it('retourne 401 si mot de passe incorrect', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1, email: 'a@a.com', password: await bcrypt.hash('correct', 10) });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('retourne 200 et un token si connexion réussie', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1, email: 'a@a.com', name: 'Test', password: await bcrypt.hash('Password123', 10) });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@a.com', password: 'Password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('GET /api/auth/verify', () => {
  const jwt = require('jsonwebtoken');

  it('retourne 401 si token manquant', async () => {
    const res = await request(app).get('/api/auth/verify');
    expect(res.status).toBe(401);
  });

  it('retourne valid:true si token valide', async () => {
    const token = jwt.sign({ userId: 1 }, 'test-secret');
    const res = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it('retourne valid:false si token invalide', async () => {
    const res = await request(app).get('/api/auth/verify').set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
    expect(res.body.valid).toBe(false);
  });
});
