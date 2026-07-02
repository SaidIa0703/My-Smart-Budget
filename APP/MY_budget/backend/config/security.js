// config/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

module.exports = (app) => {
  // 1. Headers HTTP sécurisés (CSP, HSTS, NoSniff)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
      }
    }
  }));

  // 2. Protection contre les injections NoSQL
  app.use(mongoSanitize());

  // 3. Protection XSS (nettoyage des entrées)
  app.use(xss());

  // 4. Rate Limiting global (déni de service)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Trop de requêtes, veuillez patienter.'
  });
  app.use('/api', limiter);

  // 5. Rate Limiting strict sur l'auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Trop de tentatives de connexion.'
  });
  app.use('/api/auth', authLimiter);
};
