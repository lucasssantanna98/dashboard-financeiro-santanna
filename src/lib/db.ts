import { supabase } from './supabase';
import { Income, MonthlyBill, BillTemplate, DashboardSummary, IncomeSource, Person } from '@/types';
import { INITIAL_INCOMES, INITIAL_BILLS, INITIAL_BILL_TEMPLATES } from './mockData';

const isBrowser = typeof window !== 'undefined';

function getLocal<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(`santanna_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(`santanna_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

export async function fetchIncomes(monthYear: string): Promise<Income[]> {
  try {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('month_year', monthYear)
      .order('date', { ascending: false });

    if (!error && data && data.length > 0) {
      setLocal(`incomes_${monthYear}`, data);
      return data as Income[];
    }
  } catch (e) {
    console.warn('Supabase fetchIncomes fallback:', e);
  }
  return getLocal(`incomes_${monthYear}`, INITIAL_INCOMES.filter(i => i.month_year === monthYear));
}

export async function createIncome(income: Omit<Income, 'id' | 'created_at'>): Promise<Income> {
  const newIncome: Income = {
    ...income,
    id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('incomes').insert([income]).select();
    if (!error && data && data[0]) {
      return data[0] as Income;
    }
  } catch (e) {
    console.warn('Supabase createIncome fallback:', e);
  }

  const list = getLocal<Income[]>(`incomes_${income.month_year}`, []);
  const updated = [newIncome, ...list];
  setLocal(`incomes_${income.month_year}`, updated);
  return newIncome;
}

export async function deleteIncome(id: string, monthYear: string): Promise<void> {
  try {
    await supabase.from('incomes').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteIncome fallback:', e);
  }
  const list = getLocal<Income[]>(`incomes_${monthYear}`, []);
  setLocal(`incomes_${monthYear}`, list.filter(i => i.id !== id));
}

export async function saveWeeklyBatch(
  monthYear: string,
  weekNumber: number,
  entries: Array<{ source: IncomeSource; person: Person; amount: number; notes?: string }>
): Promise<Income[]> {
  const results: Income[] = [];
  const date = `${monthYear}-${String(Math.min(weekNumber * 7, 28)).padStart(2, '0')}`;

  for (const entry of entries) {
    if (entry.amount > 0) {
      const saved = await createIncome({
        date,
        month_year: monthYear,
        source: entry.source,
        person: entry.person,
        amount: entry.amount,
        period_type: 'weekly',
        week_number: weekNumber,
        notes: entry.notes || `Semana ${weekNumber}`,
      });
      results.push(saved);
    }
  }
  return results;
}

export async function fetchMonthlyBills(monthYear: string): Promise<MonthlyBill[]> {
  try {
    const { data, error } = await supabase
      .from('monthly_bills')
      .select('*')
      .eq('month_year', monthYear)
      .order('due_date', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal(`bills_${monthYear}`, data);
      return data as MonthlyBill[];
    }
  } catch (e) {
    console.warn('Supabase fetchMonthlyBills fallback:', e);
  }
  return getLocal(`bills_${monthYear}`, INITIAL_BILLS.filter(b => b.month_year === monthYear));
}

export async function toggleBillStatus(id: string, currentStatus: 'pending' | 'paid', monthYear: string): Promise<void> {
  const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
  const paidAt = newStatus === 'paid' ? new Date().toISOString() : null;

  try {
    await supabase
      .from('monthly_bills')
      .update({ status: newStatus, paid_at: paidAt })
      .eq('id', id);
  } catch (e) {
    console.warn('Supabase toggleBillStatus fallback:', e);
  }

  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  const updated = list.map(b => (b.id === id ? { ...b, status: newStatus as 'pending' | 'paid', paid_at: paidAt } : b));
  setLocal(`bills_${monthYear}`, updated);
}

export async function updateBillAmount(id: string, amount: number, monthYear: string): Promise<void> {
  try {
    await supabase.from('monthly_bills').update({ amount }).eq('id', id);
  } catch (e) {
    console.warn('Supabase updateBillAmount fallback:', e);
  }

  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  const updated = list.map(b => (b.id === id ? { ...b, amount } : b));
  setLocal(`bills_${monthYear}`, updated);
}

export async function createMonthlyBill(bill: Omit<MonthlyBill, 'id' | 'created_at'>): Promise<MonthlyBill> {
  const newBill: MonthlyBill = {
    ...bill,
    id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('monthly_bills').insert([bill]).select();
    if (!error && data && data[0]) {
      return data[0] as MonthlyBill;
    }
  } catch (e) {
    console.warn('Supabase createMonthlyBill fallback:', e);
  }

  const list = getLocal<MonthlyBill[]>(`bills_${bill.month_year}`, []);
  const updated = [...list, newBill];
  setLocal(`bills_${bill.month_year}`, updated);
  return newBill;
}

export async function deleteMonthlyBill(id: string, monthYear: string): Promise<void> {
  try {
    await supabase.from('monthly_bills').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteMonthlyBill fallback:', e);
  }
  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  setLocal(`bills_${monthYear}`, list.filter(b => b.id !== id));
}

export async function fetchBillTemplates(): Promise<BillTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('bill_templates')
      .select('*')
      .eq('active', true)
      .order('due_day', { ascending: true });

    if (!error && data && data.length > 0) {
      setLocal('templates', data);
      return data as BillTemplate[];
    }
  } catch (e) {
    console.warn('Supabase fetchBillTemplates fallback:', e);
  }
  return getLocal('templates', INITIAL_BILL_TEMPLATES);
}

export async function saveBillTemplate(tpl: Omit<BillTemplate, 'id' | 'created_at'>): Promise<BillTemplate> {
  const newTpl: BillTemplate = {
    ...tpl,
    id: `tpl-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('bill_templates').insert([tpl]).select();
    if (!error && data && data[0]) return data[0] as BillTemplate;
  } catch (e) {
    console.warn('Supabase saveBillTemplate fallback:', e);
  }

  const list = getLocal<BillTemplate[]>('templates', INITIAL_BILL_TEMPLATES);
  const updated = [...list, newTpl];
  setLocal('templates', updated);
  return newTpl;
}

export async function generateBillsFromTemplates(monthYear: string): Promise<MonthlyBill[]> {
  const templates = await fetchBillTemplates();
  const existingBills = await fetchMonthlyBills(monthYear);
  const existingTitles = new Set(existingBills.map(b => b.title.toLowerCase().trim()));

  const createdBills: MonthlyBill[] = [];

  for (const tpl of templates) {
    if (!existingTitles.has(tpl.name.toLowerCase().trim())) {
      const dueDay = String(Math.min(Math.max(tpl.due_day, 1), 28)).padStart(2, '0');
      const dueDate = `${monthYear}-${dueDay}`;

      const generated = await createMonthlyBill({
        template_id: tpl.id,
        month_year: monthYear,
        title: tpl.name,
        category: tpl.category,
        amount: tpl.default_amount,
        due_date: dueDate,
        is_fixed: tpl.is_fixed,
        status: 'pending',
      });
      createdBills.push(generated);
    }
  }

  return [...existingBills, ...createdBills];
}

export function calculateSummary(incomes: Income[], bills: MonthlyBill[]): DashboardSummary {
  let totalIncome = 0;
  let lucasIncome = 0;
  let nicollyIncome = 0;

  const sourcesBreakdown: Record<IncomeSource, number> = {
    ARQDIGITAL: 0,
    UBER_99: 0,
    STUDIO_LASH: 0,
    CM: 0,
    SC: 0,
  };

  const weeklyBreakdown: Record<number, { total: number; lucas: number; nicolly: number }> = {
    1: { total: 0, lucas: 0, nicolly: 0 },
    2: { total: 0, lucas: 0, nicolly: 0 },
    3: { total: 0, lucas: 0, nicolly: 0 },
    4: { total: 0, lucas: 0, nicolly: 0 },
    5: { total: 0, lucas: 0, nicolly: 0 },
  };

  incomes.forEach(i => {
    const amt = Number(i.amount) || 0;
    totalIncome += amt;

    if (i.person === 'Lucas') {
      lucasIncome += amt;
    } else {
      nicollyIncome += amt;
    }

    if (sourcesBreakdown[i.source] !== undefined) {
      sourcesBreakdown[i.source] += amt;
    }

    if (i.week_number && weeklyBreakdown[i.week_number]) {
      weeklyBreakdown[i.week_number].total += amt;
      if (i.person === 'Lucas') {
        weeklyBreakdown[i.week_number].lucas += amt;
      } else {
        weeklyBreakdown[i.week_number].nicolly += amt;
      }
    }
  });

  let totalExpenses = 0;
  let paidExpenses = 0;
  let pendingExpenses = 0;

  bills.forEach(b => {
    const amt = Number(b.amount) || 0;
    totalExpenses += amt;
    if (b.status === 'paid') {
      paidExpenses += amt;
    } else {
      pendingExpenses += amt;
    }
  });

  const netBalance = totalIncome - totalExpenses;

  // ProjeÃƒÂ§ÃƒÂ£o mensal
  const weeklyTotal = Object.values(weeklyBreakdown).reduce((acc, curr) => acc + curr.total, 0);
  const weeksWithData = Object.values(weeklyBreakdown).filter(w => w.total > 0).length || 1;
  const weeklyAverage = weeklyTotal / weeksWithData;
  const projection = sourcesBreakdown.ARQDIGITAL + (weeklyAverage * 4);

  return {
    totalIncome,
    lucasIncome,
    nicollyIncome,
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    netBalance,
    projection,
    sourcesBreakdown,
    weeklyBreakdown,
  };
}
export async function deleteBillTemplate(id: string): Promise<void> {
  try {
    await supabase.from('bill_templates').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteBillTemplate fallback:', e);
  }
  const list = getLocal<BillTemplate[]>('templates', INITIAL_BILL_TEMPLATES);
  const updated = list.filter((t) => t.id !== id);
  setLocal('templates', updated);
}