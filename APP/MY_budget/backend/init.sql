CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ajoute la colonne si la table existe déjà sans elle
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  label VARCHAR(255),
  category VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  limit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

INSERT INTO users (name, email) 
VALUES ('Test User', 'test@example.com')
ON CONFLICT DO NOTHING;
