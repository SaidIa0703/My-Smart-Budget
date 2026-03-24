const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

process.env.JWT_SECRET = 'unit-test-jwt-key';

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('retourne 401 si aucun token', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'token manquant' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si token invalide', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token invalide' });
    expect(next).not.toHaveBeenCalled();
  });

  it('appelle next() si token valide', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ userId: 1 });
  });

  it('retourne 401 si token expiré', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
