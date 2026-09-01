-- Habilitar pgcrypto para criptografar senhas diretamente pelo banco (opcional, mas util pro admin inicial)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Limpar as tabelas existentes
DROP TABLE IF EXISTS monthly_bills CASCADE;
DROP TABLE IF EXISTS bill_templates CASCADE;
DROP TABLE IF EXISTS incomes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabela de Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'admin' ou 'user'
  is_active BOOLEAN DEFAULT TRUE,
  person1_name VARCHAR(50) DEFAULT 'Pessoa 1',
  person2_name VARCHAR(50) DEFAULT 'Pessoa 2',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir usuário Admin
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', crypt('S34vic3s@123', gen_salt('bf', 10)), 'admin');

-- 1. TABELA DE RECEITAS / ENTRADAS
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_year VARCHAR(7) NOT NULL, 
  source VARCHAR(50) NOT NULL,
  person VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period_type VARCHAR(20) NOT NULL DEFAULT 'weekly',
  week_number INT DEFAULT 1,
  notes TEXT
);

CREATE INDEX idx_incomes_month_year ON incomes(user_id, month_year);

-- 2. TABELA DE FONTES DE RENDA CUSTOMIZADAS
CREATE TABLE income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  person VARCHAR(20) NOT NULL
);

-- 3. TABELA DE MODELOS DE CONTAS MENSAIS
CREATE TABLE bill_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Geral',
  is_fixed BOOLEAN DEFAULT TRUE,
  default_amount DECIMAL(10,2) DEFAULT 0,
  due_day INT DEFAULT 10,
  active BOOLEAN DEFAULT TRUE
);

-- 4. TABELA DE CONTAS MENSAIS EFETIVAS
CREATE TABLE monthly_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  template_id UUID REFERENCES bill_templates(id) ON DELETE SET NULL,
  month_year VARCHAR(7) NOT NULL,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Geral',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  is_fixed BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'pending', 
  paid_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_monthly_bills_month_year ON monthly_bills(user_id, month_year);
