-- ============================================================
-- My Smart Budget -- Schéma PostgreSQL complet
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          VARCHAR(255),
  role          VARCHAR(20) DEFAULT 'USER',
  currency      VARCHAR(10) DEFAULT 'EUR',
  is_deleted    BOOLEAN DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  icon       VARCHAR(100),
  color      VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  label       VARCHAR(255) NOT NULL,
  amount      DECIMAL(12, 2) NOT NULL,
  type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     INTEGER REFERENCES categories(id),
  category        VARCHAR(255),
  name            VARCHAR(255),
  amount          DECIMAL(12, 2) NOT NULL,
  alert_threshold INTEGER DEFAULT 80,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  target      DECIMAL(12, 2) NOT NULL,
  current     DECIMAL(12, 2) DEFAULT 0,
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_id  INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
  type       VARCHAR(50) DEFAULT 'BUDGET_WARNING',
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date   ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_cat    ON transactions(user_id, category_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id          ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id           ON alerts(user_id);

-- Données de démo
INSERT INTO categories (name, icon, color) VALUES
  ('Alimentation',  'shopping-cart', '#4CAF50'),
  ('Transport',     'car',           '#2196F3'),
  ('Loisirs',       'music',         '#9C27B0'),
  ('Santé',         'heart',         '#F44336'),
  ('Logement',      'home',          '#FF9800')
ON CONFLICT DO NOTHING;
