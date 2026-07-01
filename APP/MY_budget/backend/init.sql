CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profil_type VARCHAR(50),
  revenu_mensuel DECIMAL(10,2),
  situation_familiale VARCHAR(100),
  objectifs_epargne TEXT,
  categories_prioritaires TEXT,
  dettes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profil_type VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS revenu_mensuel DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS situation_familiale VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objectifs_epargne TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS categories_prioritaires TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dettes TEXT;

-- Table user_profiles pour compatibilité avec l'ancienne route /api/profile
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_type VARCHAR(50),
  revenus_mensuels DECIMAL(10,2),
  situation_familiale VARCHAR(100),
  objectifs_epargne TEXT,
  categories_prioritaires TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  "limit" DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  budget_id INT REFERENCES budgets(id) ON DELETE SET NULL,
  name VARCHAR(255),
  label VARCHAR(255),
  category VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS budget_id INT REFERENCES budgets(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS objectifs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) DEFAULT '🎯',
  target DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  budget_id INT REFERENCES budgets(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('70', '90', '100')),
  category VARCHAR(255),
  percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_objectifs_user_id ON objectifs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
