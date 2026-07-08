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

jest.mock('../models/Report', () => {
  const MockReport = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  MockReport.find = jest.fn();
  MockReport.findByIdAndDelete = jest.fn();
  return MockReport;
});

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const Report = require('../models/Report');
const reportsRouter = require('../routes/reports');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/reports', reportsRouter);

describe('Reports', () => {
  test('GET /:userId - liste des rapports', async () => {
    Report.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: '1', userId: '1', title: 'Janvier 2025', type: 'monthly' },
        { _id: '2', userId: '1', title: 'Février 2025', type: 'monthly' },
      ]),
    });

    const res = await request(app).get('/api/reports/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /:userId - liste vide', async () => {
    Report.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get('/api/reports/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /:userId - erreur serveur', async () => {
    Report.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('Mongo error')),
    });

    const res = await request(app).get('/api/reports/1');

    expect(res.status).toBe(500);
  });

  test('POST / - création réussie', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ userId: '1', title: 'Mars 2025', description: 'Bilan mensuel', type: 'monthly' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Mars 2025');
  });

  test('POST / - type par défaut monthly', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ userId: '1', title: 'Bilan sans type' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('monthly');
  });

  test('POST / - erreur serveur', async () => {
    Report.mockImplementationOnce(function () {
      this.save = jest.fn().mockRejectedValue(new Error('Mongo error'));
    });

    const res = await request(app)
      .post('/api/reports')
      .send({ userId: '1', title: 'Erreur' });

    expect(res.status).toBe(500);
  });

  test('DELETE /:id - suppression réussie', async () => {
    Report.findByIdAndDelete.mockResolvedValue({ _id: '1' });

    const res = await request(app).delete('/api/reports/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimé/);
  });

  test('DELETE /:id - erreur serveur', async () => {
    Report.findByIdAndDelete.mockRejectedValue(new Error('Mongo error'));

    const res = await request(app).delete('/api/reports/1');

    expect(res.status).toBe(500);
  });
});
