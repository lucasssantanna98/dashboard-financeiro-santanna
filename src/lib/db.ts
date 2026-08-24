import { supabase } from './supabase';
import { Income, MonthlyBill, BillTemplate, DashboardSummary, IncomeSource, BillStatus } from '@/types';
import { INITIAL_INCOMES, INITIAL_BILLS, INITIAL_BILL_TEMPLATES } from './mockData';
import { SOURCES_MAP } from './utils';

// Funções de Fallback LocalStorage
const getLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(`fin_${key}`);
  return val ? JSON.parse(val) : fallback;
};

const setLocal = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`fin_${key}`, JSON.stringify(data));
};

export async function fetchDashboardData(monthYear: string) {
  let incomes: Income[] = [];
  let bills: MonthlyBill[] = [];

  try {
    const [incRes, billsRes] = await Promise.all([
      supabase.from('incomes').select('*').eq('month_year', monthYear).order('date', { ascending: true }),
      supabase.from('monthly_bills').select('*').eq('month_year', monthYear).order('due_date', { ascending: true })
    ]);

    if (incRes.data && incRes.data.length > 0) {
      // Map DB source -> Frontend source_code
      incomes = incRes.data.map(d => ({
        ...d,
        source_code: d.source as IncomeSource
      })) as Income[];
    }
    
    if (billsRes.data && billsRes.data.length > 0) {
      bills = billsRes.data as MonthlyBill[];
    }
  } catch (e) {
    console.warn('Supabase fetch error, using fallback:', e);
  }

  // Fallback se estiver vazio e for o mês inicial (mock)
  if (incomes.length === 0 && bills.length === 0) {
    const savedIncomes = getLocal<Income[]>(`incomes_${monthYear}`, INITIAL_INCOMES.filter(i => i.month_year === monthYear));
    const savedBills = getLocal<MonthlyBill[]>(`bills_${monthYear}`, INITIAL_BILLS.filter(b => b.month_year === monthYear));
    incomes = savedIncomes;
    bills = savedBills;
  }

  const summary = calculateSummary(incomes, bills);

  return { incomes, bills, summary };
}

function calculateSummary(incomes: Income[], bills: MonthlyBill[]): DashboardSummary {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalBills = bills.reduce((acc, curr) => acc + curr.amount, 0);
  const paidBills = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingBills = bills.filter(b => b.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  
  const netBalance = totalIncome - totalBills;

  let projectedIncome = 0;
  const fixedIncomes = incomes.filter(i => i.source_code === 'ARQDIGITAL').reduce((acc, curr) => acc + curr.amount, 0);
  const varIncomes = incomes.filter(i => i.source_code !== 'ARQDIGITAL');
  
  if (varIncomes.length > 0) {
    const currentWeek = Math.max(...varIncomes.map(i => i.week_number || 1));
    const varTotal = varIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    projectedIncome = fixedIncomes + (currentWeek > 0 ? (varTotal / currentWeek) * 4 : 0);
  } else {
    projectedIncome = totalIncome;
  }

  const sourcesBreakdown: Record<string, number> = {};
  const weeklyBreakdown: Record<number, { total: number; lucas: number; nicolly: number }> = {};

  incomes.forEach(inc => {
    // Sources
    sourcesBreakdown[inc.source_code] = (sourcesBreakdown[inc.source_code] || 0) + inc.amount;
    
    // Weekly
    const w = inc.week_number || 1;
    if (!weeklyBreakdown[w]) {
      weeklyBreakdown[w] = { total: 0, lucas: 0, nicolly: 0 };
    }
    weeklyBreakdown[w].total += inc.amount;
    
    if (inc.source_code === 'ARQDIGITAL' || inc.source_code === 'UBER_99') {
      weeklyBreakdown[w].lucas += inc.amount;
    } else {
      weeklyBreakdown[w].nicolly += inc.amount;
    }
  });

  return {
    totalIncome,
    lucasIncome: 0, // mock property required by interface but unused in dashboard
    nicollyIncome: 0,
    totalExpenses: totalBills,
    paidExpenses: paidBills,
    pendingExpenses: pendingBills,
    netBalance,
    projection: projectedIncome,
    sourcesBreakdown: sourcesBreakdown as Record<IncomeSource, number>,
    weeklyBreakdown
  };
}

// Incomes
export async function createIncome(income: Omit<Income, 'id' | 'created_at'>): Promise<Income> {
  const newIncome: Income = {
    ...income,
    id: Math.random().toString(36).substring(2, 9),
  };
  
  try {
    const meta = SOURCES_MAP[income.source_code];
    const dbPayload = {
      date: income.date,
      month_year: income.month_year,
      source: income.source_code,
      person: meta.person,
      amount: income.amount,
      period_type: meta.defaultPeriod,
      week_number: income.week_number,
      notes: income.notes
    };

    const { data, error } = await supabase.from('incomes').insert([dbPayload]).select();
    if (!error && data && data[0]) {
      return {
        ...data[0],
        source_code: data[0].source
      } as Income;
    }
  } catch (e) {
    console.warn('Supabase createIncome fallback:', e);
  }

  // Fallback
  const list = getLocal<Income[]>(`incomes_${income.month_year}`, []);
  list.push(newIncome);
  setLocal(`incomes_${income.month_year}`, list);
  
  return newIncome;
}

export async function deleteIncome(id: string, monthYear: string): Promise<void> {
  try {
    await supabase.from('incomes').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteIncome fallback:', e);
  }
  
  const list = getLocal<Income[]>(`incomes_${monthYear}`, []);
  const updated = list.filter((i) => i.id !== id);
  setLocal(`incomes_${monthYear}`, updated);
}

// Bills
export async function createMonthlyBill(bill: Omit<MonthlyBill, 'id' | 'created_at'>): Promise<MonthlyBill> {
  const newBill: MonthlyBill = {
    ...bill,
    id: Math.random().toString(36).substring(2, 9),
  };
  
  try {
    const { data, error } = await supabase.from('monthly_bills').insert([bill]).select();
    if (!error && data && data[0]) return data[0] as MonthlyBill;
  } catch (e) {
    console.warn('Supabase createMonthlyBill fallback:', e);
  }

  const list = getLocal<MonthlyBill[]>(`bills_${bill.month_year}`, []);
  list.push(newBill);
  setLocal(`bills_${bill.month_year}`, list);
  
  return newBill;
}

export async function updateMonthlyBillStatus(id: string, status: BillStatus, monthYear: string): Promise<void> {
  try {
    await supabase.from('monthly_bills').update({ status }).eq('id', id);
  } catch (e) {
    console.warn('Supabase updateMonthlyBillStatus fallback:', e);
  }
  
  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  const updated = list.map((b) => b.id === id ? { ...b, status } : b);
  setLocal(`bills_${monthYear}`, updated);
}

export async function updateMonthlyBillAmount(id: string, amount: number, monthYear: string): Promise<void> {
  try {
    await supabase.from('monthly_bills').update({ amount }).eq('id', id);
  } catch (e) {
    console.warn('Supabase updateMonthlyBillAmount fallback:', e);
  }
  
  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  const updated = list.map((b) => b.id === id ? { ...b, amount } : b);
  setLocal(`bills_${monthYear}`, updated);
}

export async function deleteMonthlyBill(id: string, monthYear: string): Promise<void> {
  try {
    await supabase.from('monthly_bills').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase deleteMonthlyBill fallback:', e);
  }
  
  const list = getLocal<MonthlyBill[]>(`bills_${monthYear}`, []);
  const updated = list.filter((b) => b.id !== id);
  setLocal(`bills_${monthYear}`, updated);
}

// Templates
export async function fetchBillTemplates(): Promise<BillTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('bill_templates')
      .select('*')
      .order('due_day', { ascending: true });
      
    if (!error && data) {
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
    id: Math.random().toString(36).substring(2, 9),
  };
  
  try {
    const { data, error } = await supabase.from('bill_templates').insert([tpl]).select();
    if (!error && data && data[0]) return data[0] as BillTemplate;
  } catch (e) {
    console.warn('Supabase saveBillTemplate fallback:', e);
  }
  
  const list = getLocal<BillTemplate[]>('templates', INITIAL_BILL_TEMPLATES);
  list.push(newTpl);
  setLocal('templates', list);
  
  return newTpl;
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

export async function generateBillsFromTemplates(monthYear: string): Promise<MonthlyBill[]> {
  const templates = await fetchBillTemplates();
  const newBills: MonthlyBill[] = [];

  for (const tpl of templates) {
    if (!tpl.active) continue;
    
    // Check se já existe conta pro template neste mes
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
    
    const created = await createMonthlyBill(billToCreate);
    newBills.push(created);
  }

  return newBills;
}