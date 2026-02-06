import pgPromise from 'pg-promise';
import { connect } from 'mongoose';

// Configuration PostgreSQL
const pgp = pgPromise();
const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smart_budget',
  user: process.env.DB_USER || 'smart_user',
  password: process.env.DB_PASSWORD || 'smart_password',
});

// Connexion MongoDB
const connectMongo = async () => {
  try {
    await connect(
      process.env.MONGO_URI || 'mongodb://smart_user:smart_password@localhost:27017/smart_budget?authSource=admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err);
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

export default { db, connectMongo, testPostgres };
