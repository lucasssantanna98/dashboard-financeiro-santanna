export type IncomeSource = 'ARQDIGITAL' | 'UBER_99' | 'STUDIO_LASH' | 'CM' | 'SC';
export type Person = 'Lucas' | 'Nicolly';
export type PeriodType = 'monthly' | 'weekly';
export type BillStatus = 'pending' | 'paid';

export interface Income {
  id: string;
  created_at?: string;
  date: string;
  month_year: string;
  source_code: IncomeSource;
  amount: number;
  week_number?: number;
  notes?: string;
}

export interface BillTemplate {
  id: string;
  created_at?: string;
  name: string;
  category: string;
  is_fixed: boolean;
  default_amount: number;
  due_day: number;
  active: boolean;
}

export interface MonthlyBill {
  id: string;
  created_at?: string;
  template_id?: string | null;
  month_year: string;
  title: string;
  category: string;
  amount: number;
  due_date: string;
  is_fixed: boolean;
  status: BillStatus;
  paid_at?: string | null;
  notes?: string;
}

export interface DashboardSummary {
  totalIncome: number;
  lucasIncome: number;
  nicollyIncome: number;
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  netBalance: number;
  projection: number;
  sourcesBreakdown: Record<IncomeSource, number>;
  weeklyBreakdown: Record<number, { total: number; lucas: number; nicolly: number }>;
}