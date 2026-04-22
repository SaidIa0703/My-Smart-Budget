const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

// Mock PostgreSQL
jest.mock('../db', () => ({
  db: {
    one: jest.fn(),
    any: jest.fn(),
  },
}));

// Mock MongoDB Report model
jest.mock('../models/report', () => {
  const mockSave = jest.fn().mockResolvedValue({});
  const MockReport = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: 'mongo-id-123',
    createdAt: new Date().toISOString(),
    save: mockSave,
  }));
  MockReport.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
  MockReport.findOneAndDelete = jest.fn().mockResolvedValue({ _id: 'mongo-id-123' });
  MockReport._mockSave = mockSave;
  return MockReport;
});

const { db } = require('../db');
const Report = require('../models/report');
const reportsRoutes = require('../routes/reports');

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRoutes);

const token = jwt.sign({ userId: 1 }, 'test-secret');
const auth = { Authorization: `Bearer ${token}` };

describe('GET /api/reports/generate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/reports/generate');
    expect(res.status).toBe(401);
  });

  it('retourne les statistiques calculées depuis PostgreSQL', async () => {
    db.one.mockResolvedValue({ total_revenus: 2000, total_depenses: 1200, nb_transactions: 15 });
    db.any
      .mockResolvedValueOnce([{ name: 'Alimentation', montant: 400 }])
      .mockResolvedValueOnce([{ mois: '2026-04', revenus: 2000, depenses: 1200 }]);

    const res = await request(app).get('/api/reports/generate').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.totalRevenus).toBe(2000);
    expect(res.body.totalDepenses).toBe(1200);
    expect(res.body.solde).toBe(800);
    expect(res.body.parCategorie).toHaveLength(1);
    expect(res.body.evolution).toHaveLength(1);
  });

  it('accepte un paramètre month', async () => {
    db.one.mockResolvedValue({ total_revenus: 0, total_depenses: 0, nb_transactions: 0 });
    db.any.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/generate?month=2026-03').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.mois).toBe('2026-03');
  });
});

describe('GET /api/reports', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 401 sans token', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  it('retourne la liste des rapports MongoDB', async () => {
    const mockReport = { _id: 'abc', title: 'Rapport avril 2026', createdAt: new Date() };
    Report.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockReport]) });

    const res = await request(app).get('/api/reports').set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Rapport avril 2026');
  });
});

describe('POST /api/reports', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 400 si titre ou data manquants', async () => {
    const res = await request(app).post('/api/reports').set(auth).send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('retourne 201 et sauvegarde dans MongoDB', async () => {
    const res = await request(app).post('/api/reports').set(auth).send({
      title: 'Rapport avril 2026',
      data: { totalRevenus: 2000, totalDepenses: 1200 },
      type: 'monthly',
    });
    expect(res.status).toBe(201);
    expect(Report).toHaveBeenCalledWith(expect.objectContaining({ title: 'Rapport avril 2026' }));
  });
});

describe('DELETE /api/reports/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne 404 si rapport introuvable ou n\'appartient pas à l\'utilisateur', async () => {
    Report.findOneAndDelete.mockResolvedValue(null);
    const res = await request(app).delete('/api/reports/unknown-id').set(auth);
    expect(res.status).toBe(404);
  });

  it('retourne 200 si suppression réussie', async () => {
    Report.findOneAndDelete.mockResolvedValue({ _id: 'mongo-id-123' });
    const res = await request(app).delete('/api/reports/mongo-id-123').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Rapport supprimé');
  });
});
