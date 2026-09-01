export type Person = 'person1' | 'person2';
export type PeriodType = 'monthly' | 'weekly';
export type BillStatus = 'pending' | 'paid';

export interface Income {
  id: string;
  created_at?: string;
  date: string;
  month_year: string;
  source_code: string;
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
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  netBalance: number;
  projectedIncome: number;
  sourcesBreakdown: Record<string, number>;
  weeklyBreakdown: Record<number, { total: number; person1: number; person2: number }>;
  person1Name: string;
  person2Name: string;
  incomeSources: { id: string; name: string; person: Person }[];
}