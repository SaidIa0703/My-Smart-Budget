const pgPromise = require('pg-promise');
const mongoose = require('mongoose');

// Vérification des variables d'environnement critiques
const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'MONGO_URI'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
}

// Configuration PostgreSQL
const pgp = pgPromise();
const db = pgp({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Connexion MongoDB
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err.message);
  }
};

// Test PostgreSQL
const testPostgres = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL connecté');
  } catch (err) {
    console.error('❌ Erreur PostgreSQL:', err);
  }
};

module.exports = { db, connectMongo, testPostgres };