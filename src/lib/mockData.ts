import { Income, MonthlyBill, BillTemplate } from '@/types';
import { getCurrentMonthYear } from './utils';

const currentMonth = getCurrentMonthYear();

export const INITIAL_BILL_TEMPLATES: BillTemplate[] = [
  { id: 't1', name: 'Aluguel / CondomÃ­nio', category: 'Moradia', is_fixed: true, default_amount: 1500, due_day: 10, active: true },
  { id: 't2', name: 'Parcela do Carro', category: 'Transporte', is_fixed: true, default_amount: 850, due_day: 15, active: true },
  { id: 't3', name: 'Supermercado / Compras', category: 'AlimentaÃ§Ã£o', is_fixed: false, default_amount: 1200, due_day: 5, active: true },
  { id: 't4', name: 'Energia ElÃ©trica (Luz)', category: 'Moradia', is_fixed: false, default_amount: 180, due_day: 18, active: true },
  { id: 't5', name: 'Ãgua & Saneamento', category: 'Moradia', is_fixed: false, default_amount: 85, due_day: 20, active: true },
  { id: 't6', name: 'Internet Fibra', category: 'ServiÃ§os', is_fixed: true, default_amount: 119.90, due_day: 12, active: true },
  { id: 't7', name: 'Fatura de CartÃ£o', category: 'Financeiro', is_fixed: false, default_amount: 900, due_day: 10, active: true },
];

export const INITIAL_INCOMES: Income[] = [
  { id: 'inc-1', date: `${currentMonth}-05`, month_year: currentMonth, source: 'ARQDIGITAL', person: 'Lucas', amount: 4500, period_type: 'monthly', notes: 'SalÃ¡rio Fixo' },
  { id: 'inc-2', date: `${currentMonth}-07`, month_year: currentMonth, source: 'UBER_99', person: 'Lucas', amount: 620, period_type: 'weekly', week_number: 1, notes: 'Semana 1' },
  { id: 'inc-3', date: `${currentMonth}-07`, month_year: currentMonth, source: 'STUDIO_LASH', person: 'Nicolly', amount: 1150, period_type: 'weekly', week_number: 1, notes: 'Semana 1' },
  { id: 'inc-4', date: `${currentMonth}-07`, month_year: currentMonth, source: 'CM', person: 'Nicolly', amount: 350, period_type: 'weekly', week_number: 1 },
  { id: 'inc-5', date: `${currentMonth}-07`, month_year: currentMonth, source: 'SC', person: 'Nicolly', amount: 280, period_type: 'weekly', week_number: 1 },
  { id: 'inc-6', date: `${currentMonth}-14`, month_year: currentMonth, source: 'UBER_99', person: 'Lucas', amount: 740, period_type: 'weekly', week_number: 2 },
  { id: 'inc-7', date: `${currentMonth}-14`, month_year: currentMonth, source: 'STUDIO_LASH', person: 'Nicolly', amount: 1400, period_type: 'weekly', week_number: 2 },
  { id: 'inc-8', date: `${currentMonth}-14`, month_year: currentMonth, source: 'CM', person: 'Nicolly', amount: 420, period_type: 'weekly', week_number: 2 },
  { id: 'inc-9', date: `${currentMonth}-14`, month_year: currentMonth, source: 'SC', person: 'Nicolly', amount: 310, period_type: 'weekly', week_number: 2 },
];

export const INITIAL_BILLS: MonthlyBill[] = [
  { id: 'b1', template_id: 't1', month_year: currentMonth, title: 'Aluguel / CondomÃ­nio', category: 'Moradia', amount: 1500, due_date: `${currentMonth}-10`, is_fixed: true, status: 'paid', paid_at: `${currentMonth}-10T10:00:00Z` },
  { id: 'b2', template_id: 't2', month_year: currentMonth, title: 'Parcela do Carro', category: 'Transporte', amount: 850, due_date: `${currentMonth}-15`, is_fixed: true, status: 'paid', paid_at: `${currentMonth}-15T14:30:00Z` },
  { id: 'b3', template_id: 't3', month_year: currentMonth, title: 'Supermercado / Compras', category: 'AlimentaÃ§Ã£o', amount: 1250, due_date: `${currentMonth}-05`, is_fixed: false, status: 'paid', paid_at: `${currentMonth}-05T18:00:00Z` },
  { id: 'b4', template_id: 't4', month_year: currentMonth, title: 'Energia ElÃ©trica (Luz)', category: 'Moradia', amount: 195.40, due_date: `${currentMonth}-18`, is_fixed: false, status: 'pending' },
  { id: 'b5', template_id: 't5', month_year: currentMonth, title: 'Ãgua & Saneamento', category: 'Moradia', amount: 82.30, due_date: `${currentMonth}-20`, is_fixed: false, status: 'pending' },
  { id: 'b6', template_id: 't6', month_year: currentMonth, title: 'Internet Fibra', category: 'ServiÃ§os', amount: 119.90, due_date: `${currentMonth}-12`, is_fixed: true, status: 'paid', paid_at: `${currentMonth}-12T09:15:00Z` },
  { id: 'b7', template_id: 't7', month_year: currentMonth, title: 'Fatura de CartÃ£o', category: 'Financeiro', amount: 840, due_date: `${currentMonth}-10`, is_fixed: false, status: 'paid', paid_at: `${currentMonth}-10T11:00:00Z` },
];