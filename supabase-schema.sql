-- =========================================================================
-- DASHBOARD FINANCEIRO SANT'ANNA - ESQUEMA SUPABASE
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- =========================================================================

-- 1. TABELA DE RECEITAS / ENTRADAS
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_year VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM' (Ex: '2026-08')
  source VARCHAR(50) NOT NULL,    -- 'ARQDIGITAL', 'UBER_99', 'STUDIO_LASH', 'CM', 'SC'
  person VARCHAR(20) NOT NULL,    -- 'Lucas' ou 'Esposa'
  amount DECIMAL(10,2) NOT NULL,
  period_type VARCHAR(20) NOT NULL DEFAULT 'weekly', -- 'monthly' ou 'weekly'
  week_number INT DEFAULT 1,      -- 1, 2, 3, 4, 5
  notes TEXT
);

-- Ãndices para consultas rÃ¡pidas por mÃªs
CREATE INDEX IF NOT EXISTS idx_incomes_month_year ON incomes(month_year);
CREATE INDEX IF NOT EXISTS idx_incomes_person ON incomes(person);

-- 2. TABELA DE MODELOS DE CONTAS MENSAIS (Templates Recorrentes)
CREATE TABLE IF NOT EXISTS bill_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Geral',
  is_fixed BOOLEAN DEFAULT TRUE,
  default_amount DECIMAL(10,2) DEFAULT 0,
  due_day INT DEFAULT 10,
  active BOOLEAN DEFAULT TRUE
);

-- 3. TABELA DE CONTAS MENSAIS EFETIVAS
CREATE TABLE IF NOT EXISTS monthly_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  template_id UUID REFERENCES bill_templates(id) ON DELETE SET NULL,
  month_year VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Geral',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  is_fixed BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' ou 'paid'
  paid_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_monthly_bills_month_year ON monthly_bills(month_year);

-- SEED INICIAL DE MODELOS DE CONTAS
INSERT INTO bill_templates (name, category, is_fixed, default_amount, due_day, active)
VALUES 
  ('Aluguel / CondomÃ­nio', 'Moradia', true, 1500, 10, true),
  ('Parcela do Carro', 'Transporte', true, 850, 15, true),
  ('Supermercado / Compras', 'AlimentaÃ§Ã£o', false, 1200, 5, true),
  ('Energia ElÃ©trica (Luz)', 'Moradia', false, 180, 18, true),
  ('Ãgua & Saneamento', 'Moradia', false, 85, 20, true),
  ('Internet Fibra', 'ServiÃ§os', true, 119.90, 12, true),
  ('Fatura de CartÃ£o', 'Financeiro', false, 900, 10, true)
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS) permissivo para o app
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all incomes" ON incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all bill_templates" ON bill_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all monthly_bills" ON monthly_bills FOR ALL USING (true) WITH CHECK (true);