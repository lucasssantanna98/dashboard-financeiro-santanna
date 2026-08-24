import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IncomeSource } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function getMonthName(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  const name = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getWeekNumber(dateStr?: string): number {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  const day = d.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
}

export interface SourceMeta {
  code: IncomeSource;
  name: string;
  person: 'Lucas' | 'Nicolly';
  color: string;
  bgLight: string;
  badgeBorder: string;
  icon: string;
  defaultPeriod: 'monthly' | 'weekly';
}

export const SOURCES_MAP: Record<IncomeSource, SourceMeta> = {
  ARQDIGITAL: {
    code: 'ARQDIGITAL',
    name: 'ArqDigital (SalÃ¡rio)',
    person: 'Lucas',
    color: '#38bdf8',
    bgLight: 'rgba(56, 189, 248, 0.15)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    icon: 'ðŸ’¼',
    defaultPeriod: 'monthly',
  },
  UBER_99: {
    code: 'UBER_99',
    name: 'Uber / 99',
    person: 'Lucas',
    color: '#60a5fa',
    bgLight: 'rgba(96, 165, 250, 0.15)',
    badgeBorder: 'rgba(96, 165, 250, 0.4)',
    icon: 'ðŸš—',
    defaultPeriod: 'weekly',
  },
  STUDIO_LASH: {
    code: 'STUDIO_LASH',
    name: 'Studio Lash',
    person: 'Nicolly',
    color: '#f472b6',
    bgLight: 'rgba(244, 114, 182, 0.15)',
    badgeBorder: 'rgba(244, 114, 182, 0.4)',
    icon: 'ðŸ‘ï¸',
    defaultPeriod: 'weekly',
  },
  CM: {
    code: 'CM',
    name: 'CM',
    person: 'Nicolly',
    color: '#ec4899',
    bgLight: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(236, 72, 153, 0.4)',
    icon: 'ðŸ’…',
    defaultPeriod: 'weekly',
  },
  SC: {
    code: 'SC',
    name: 'SC',
    person: 'Nicolly',
    color: '#db2777',
    bgLight: 'rgba(219, 39, 119, 0.15)',
    badgeBorder: 'rgba(219, 39, 119, 0.4)',
    icon: 'ðŸ’Ž',
    defaultPeriod: 'weekly',
  },
};