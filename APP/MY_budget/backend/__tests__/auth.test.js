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
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const authRouter = require('../routes/auth');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRouter);

let hashedPassword;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash('Password1', 10);
});

describe('Auth', () => {
  test('POST /register - inscription réussie', async () => {
    db.oneOrNone.mockResolvedValue(null);
    db.one.mockResolvedValue({ id: 1, email: 'test@test.com', name: 'Test' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Password1', name: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@test.com');
  });

  test('POST /register - champs manquants', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/requis/);
  });

  test('POST /register - mot de passe trop faible', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'weak', name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 caractères/);
  });

  test('POST /register - email déjà utilisé', async () => {
    db.oneOrNone.mockResolvedValue({ id: 1, email: 'test@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Password1', name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/déjà utilisé/);
  });

  test('POST /login - connexion réussie', async () => {
    db.oneOrNone.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
      password: hashedPassword,
      role: 'user',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@test.com');
  });

  test('POST /login - utilisateur introuvable', async () => {
    db.oneOrNone.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'Password1' });

    expect(res.status).toBe(404);
  });

  test('POST /login - mot de passe incorrect', async () => {
    db.oneOrNone.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
      password: hashedPassword,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  test('POST /logout - déconnexion réussie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Déconnecté/);
  });
});
