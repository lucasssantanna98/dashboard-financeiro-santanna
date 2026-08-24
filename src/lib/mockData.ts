import { Income, MonthlyBill, BillTemplate } from '@/types';
import { getCurrentMonthYear } from './utils';

const currentMonth = getCurrentMonthYear();

export const INITIAL_INCOMES: Income[] = [
  { id: '1', source_code: 'ARQDIGITAL', amount: 4500, date: `${currentMonth}-05`, week_number: 1, month_year: currentMonth, notes: 'Salário Fixo' },
  { id: '2', source_code: 'UBER_99', amount: 620, date: `${currentMonth}-07`, week_number: 1, month_year: currentMonth },
  { id: '3', source_code: 'STUDIO_LASH', amount: 1150, date: `${currentMonth}-07`, week_number: 1, month_year: currentMonth },
  { id: '4', source_code: 'CM', amount: 350, date: `${currentMonth}-07`, week_number: 1, month_year: currentMonth },
  { id: '5', source_code: 'UBER_99', amount: 740, date: `${currentMonth}-14`, week_number: 2, month_year: currentMonth },
  { id: '6', source_code: 'STUDIO_LASH', amount: 1400, date: `${currentMonth}-14`, week_number: 2, month_year: currentMonth },
  { id: '7', source_code: 'CM', amount: 420, date: `${currentMonth}-14`, week_number: 2, month_year: currentMonth },
];

export const INITIAL_BILLS: MonthlyBill[] = [
  { id: 'b1', title: 'Aluguel / Condomínio', category: 'Moradia', amount: 2150, due_date: `${currentMonth}-10`, status: 'paid', is_fixed: true, month_year: currentMonth },
  { id: 'b2', title: 'Financiamento Carro', category: 'Transporte', amount: 980, due_date: `${currentMonth}-15`, status: 'paid', is_fixed: true, month_year: currentMonth },
  { id: 'b3', title: 'Supermercado Mensal', category: 'Alimentação', amount: 1250, due_date: `${currentMonth}-05`, status: 'paid', is_fixed: false, month_year: currentMonth },
  { id: 'b4', title: 'Energia Elétrica (Luz)', category: 'Moradia', amount: 180.5, due_date: `${currentMonth}-20`, status: 'pending', is_fixed: false, month_year: currentMonth },
  { id: 'b5', title: 'Água & Saneamento', category: 'Moradia', amount: 97.2, due_date: `${currentMonth}-20`, status: 'pending', is_fixed: false, month_year: currentMonth },
  { id: 'b6', title: 'Internet Fibra', category: 'Serviços', amount: 119.9, due_date: `${currentMonth}-10`, status: 'paid', is_fixed: true, month_year: currentMonth },
  { id: 'b7', title: 'Plano de Saúde', category: 'Saúde', amount: 450, due_date: `${currentMonth}-25`, status: 'pending', is_fixed: true, month_year: currentMonth },
  { id: 'b8', title: 'Fatura de Cartão', category: 'Financeiro', amount: 850, due_date: `${currentMonth}-12`, status: 'paid', is_fixed: false, month_year: currentMonth },
];

export const INITIAL_BILL_TEMPLATES: BillTemplate[] = [
  { id: 't1', name: 'Aluguel / Condomínio', category: 'Moradia', default_amount: 2150, due_day: 10, is_fixed: true, active: true },
  { id: 't2', name: 'Financiamento Carro', category: 'Transporte', default_amount: 980, due_day: 15, is_fixed: true, active: true },
  { id: 't3', name: 'Supermercado', category: 'Alimentação', default_amount: 1200, due_day: 5, is_fixed: false, active: true },
  { id: 't4', name: 'Energia Elétrica (Luz)', category: 'Moradia', default_amount: 150, due_day: 20, is_fixed: false, active: true },
  { id: 't5', name: 'Água & Saneamento', category: 'Moradia', default_amount: 90, due_day: 20, is_fixed: false, active: true },
  { id: 't6', name: 'Internet Fibra', category: 'Serviços', default_amount: 119.9, due_day: 10, is_fixed: true, active: true },
];