"use server";

import { pool } from './postgres';
import { Income, MonthlyBill, BillTemplate, DashboardSummary, BillStatus, Person } from '@/types';
import { INITIAL_INCOMES, INITIAL_BILLS, INITIAL_BILL_TEMPLATES } from './mockData';
import { getSession } from './auth';
import { redirect } from 'next/navigation';

async function requireUser() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/login');
  }
  return session.userId;
}

export async function fetchDashboardData(monthYear: string) {
  const userId = await requireUser();
  let incomes: Income[] = [];
  let bills: MonthlyBill[] = [];
  let person1Name = 'Pessoa 1';
  let person2Name = 'Pessoa 2';
  let incomeSources: { id: string; name: string; person: Person }[] = [];

  try {
    const userRes = await pool.query('SELECT person1_name, person2_name FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0) {
      person1Name = userRes.rows[0].person1_name;
      person2Name = userRes.rows[0].person2_name;
    }

    const sourcesRes = await pool.query('SELECT id, name, person FROM income_sources WHERE user_id = $1 ORDER BY name ASC', [userId]);
    incomeSources = sourcesRes.rows.map(r => ({ ...r, person: r.person as Person }));

    const incRes = await pool.query('SELECT * FROM incomes WHERE user_id = $1 AND month_year = $2 ORDER BY date ASC', [userId, monthYear]);
    const billsRes = await pool.query('SELECT * FROM monthly_bills WHERE user_id = $1 AND month_year = $2 ORDER BY due_date ASC', [userId, monthYear]);

    incomes = incRes.rows.map((d: any) => ({
      ...d,
      source_code: d.source,
      amount: Number(d.amount)
    })) as Income[];

    bills = billsRes.rows.map((d: any) => ({
      ...d,
      amount: Number(d.amount)
    })) as MonthlyBill[];

  } catch (e) {
    console.warn('Postgres fetch error:', e);
  }

  // Removido o mock initial data, agora o sistema é multi-usuário de verdade
  const summary = calculateSummary(incomes, bills, person1Name, person2Name, incomeSources);

  return { incomes, bills, summary };
}

function calculateSummary(incomes: Income[], bills: MonthlyBill[], person1Name: string, person2Name: string, incomeSources: { id: string; name: string; person: Person }[]): DashboardSummary {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBills = bills.reduce((acc, curr) => acc + curr.amount, 0);
  const paidBills = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingBills = bills.filter(b => b.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalBills;

  let projectedIncome = 0;
  // This logic for fixed vs variable income calculation is simplified since we don't track is_fixed per source natively right now.
  // In a real scenario, incomeSources table should have is_fixed. 
  // For now, we will just use totalIncome as projected if we can't determine it.
  projectedIncome = totalIncome;

  const sourcesBreakdown: Record<string, number> = {};
  const weeklyBreakdown: Record<number, { total: number; person1: number; person2: number }> = {};

  incomes.forEach(inc => {
    sourcesBreakdown[inc.source_code] = (sourcesBreakdown[inc.source_code] || 0) + inc.amount;
    const w = inc.week_number || 1;
    if (!weeklyBreakdown[w]) {
      weeklyBreakdown[w] = { total: 0, person1: 0, person2: 0 };
    }
    weeklyBreakdown[w].total += inc.amount;
    
    // Check if it belongs to person1 or person2
    const sourceObj = incomeSources.find(s => s.name === inc.source_code);
    const incPerson = sourceObj?.person || (inc as any).person; // Fallback to raw DB column if possible
    
    if (incPerson === 'person1' || incPerson === 'Lucas') { // fallback for legacy data
      weeklyBreakdown[w].person1 += inc.amount;
    } else {
      weeklyBreakdown[w].person2 += inc.amount;
    }
  });

  return {
    totalIncome,
    totalBills,
    paidBills,
    pendingBills,
    netBalance,
    projectedIncome,
    sourcesBreakdown,
    weeklyBreakdown,
    person1Name,
    person2Name,
    incomeSources
  };
}

// Incomes
export async function createIncome(income: Omit<Income, 'id' | 'created_at'> & { person: Person }): Promise<Income> {
  const userId = await requireUser();
  const defaultPeriod = 'weekly';
  
  try {
    const res = await pool.query(`
      INSERT INTO incomes (user_id, date, month_year, source, person, amount, period_type, week_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [userId, income.date, income.month_year, income.source_code, income.person, income.amount, defaultPeriod, income.week_number, income.notes]);
    
    const data = res.rows[0];
    return {
      ...data,
      source_code: data.source,
      amount: Number(data.amount)
    } as Income;
  } catch (e) {
    console.error('Postgres createIncome error:', e);
    throw e;
  }
}

export async function deleteIncome(id: string, monthYear: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('DELETE FROM incomes WHERE id = $1 AND user_id = $2', [id, userId]);
  } catch (e) {
    console.error('Postgres deleteIncome error:', e);
    throw e;
  }
}

// Bills
export async function createMonthlyBill(bill: Omit<MonthlyBill, 'id' | 'created_at'>): Promise<MonthlyBill> {
  const userId = await requireUser();
  try {
    const res = await pool.query(`
      INSERT INTO monthly_bills (user_id, template_id, month_year, title, category, amount, due_date, is_fixed, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [userId, bill.template_id || null, bill.month_year, bill.title, bill.category || 'Geral', bill.amount, bill.due_date, bill.is_fixed, bill.status || 'pending', bill.notes || null]);
    
    return { ...res.rows[0], amount: Number(res.rows[0].amount) } as MonthlyBill;
  } catch (e) {
    console.error('Postgres createMonthlyBill error:', e);
    throw e;
  }
}

export async function updateMonthlyBillStatus(id: string, status: BillStatus, monthYear: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('UPDATE monthly_bills SET status = $1 WHERE id = $2 AND user_id = $3', [status, id, userId]);
  } catch (e) {
    console.error('Postgres updateMonthlyBillStatus error:', e);
    throw e;
  }
}

export async function updateMonthlyBillAmount(id: string, amount: number, monthYear: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('UPDATE monthly_bills SET amount = $1 WHERE id = $2 AND user_id = $3', [amount, id, userId]);
  } catch (e) {
    console.error('Postgres updateMonthlyBillAmount error:', e);
    throw e;
  }
}

export async function deleteMonthlyBill(id: string, monthYear: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('DELETE FROM monthly_bills WHERE id = $1 AND user_id = $2', [id, userId]);
  } catch (e) {
    console.error('Postgres deleteMonthlyBill error:', e);
    throw e;
  }
}

// Templates
export async function fetchBillTemplates(): Promise<BillTemplate[]> {
  const userId = await requireUser();
  try {
    const res = await pool.query('SELECT * FROM bill_templates WHERE user_id = $1 ORDER BY due_day ASC', [userId]);
    return res.rows.map((d: any) => ({ ...d, default_amount: Number(d.default_amount) })) as BillTemplate[];
  } catch (e) {
    console.error('Postgres fetchBillTemplates error:', e);
    return [];
  }
}

export async function saveBillTemplate(tpl: Omit<BillTemplate, 'id' | 'created_at'>): Promise<BillTemplate> {
  const userId = await requireUser();
  try {
    const res = await pool.query(`
      INSERT INTO bill_templates (user_id, name, category, is_fixed, default_amount, due_day, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, tpl.name, tpl.category, tpl.is_fixed, tpl.default_amount, tpl.due_day, tpl.active]);
    return { ...res.rows[0], default_amount: Number(res.rows[0].default_amount) } as BillTemplate;
  } catch (e) {
    console.error('Postgres saveBillTemplate error:', e);
    throw e;
  }
}

export async function deleteBillTemplate(id: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('DELETE FROM bill_templates WHERE id = $1 AND user_id = $2', [id, userId]);
  } catch (e) {
    console.error('Postgres deleteBillTemplate error:', e);
    throw e;
  }
}

export async function generateBillsFromTemplates(monthYear: string): Promise<MonthlyBill[]> {
  const templates = await fetchBillTemplates(); // Já pega os templates do usuário logado
  const newBills: MonthlyBill[] = [];

  for (const tpl of templates) {
    if (!tpl.active) continue;
    
    const paddedDay = String(tpl.due_day).padStart(2, '0');
    
    const billToCreate: Omit<MonthlyBill, 'id' | 'created_at'> = {
      title: tpl.name,
      category: tpl.category,
      amount: tpl.default_amount,
      due_date: `${monthYear}-${paddedDay}`,
      status: 'pending',
      is_fixed: tpl.is_fixed,
      month_year: monthYear,
    };
    
    const created = await createMonthlyBill(billToCreate); // Já cria pro user logado
    newBills.push(created);
  }

  return newBills;
}

// User Settings
export async function updateUserNames(person1Name: string, person2Name: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('UPDATE users SET person1_name = $1, person2_name = $2 WHERE id = $3', [person1Name, person2Name, userId]);
  } catch (e) {
    console.error('Postgres updateUserNames error:', e);
    throw e;
  }
}

export async function addIncomeSource(name: string, person: Person): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('INSERT INTO income_sources (user_id, name, person) VALUES ($1, $2, $3)', [userId, name, person]);
  } catch (e) {
    console.error('Postgres addIncomeSource error:', e);
    throw e;
  }
}

export async function deleteIncomeSource(id: string): Promise<void> {
  const userId = await requireUser();
  try {
    await pool.query('DELETE FROM income_sources WHERE id = $1 AND user_id = $2', [id, userId]);
  } catch (e) {
    console.error('Postgres deleteIncomeSource error:', e);
    throw e;
  }
}