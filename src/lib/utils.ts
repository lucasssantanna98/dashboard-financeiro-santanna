import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthName(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const name = MONTH_NAMES[monthIdx] || '';
  return `${name} de ${year}`;
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

const PERSON1_COLORS = [
  { color: '#38bdf8', bgLight: 'rgba(56, 189, 248, 0.15)', badgeBorder: 'rgba(56, 189, 248, 0.4)' },
  { color: '#60a5fa', bgLight: 'rgba(96, 165, 250, 0.15)', badgeBorder: 'rgba(96, 165, 250, 0.4)' },
  { color: '#818cf8', bgLight: 'rgba(129, 140, 248, 0.15)', badgeBorder: 'rgba(129, 140, 248, 0.4)' },
  { color: '#2dd4bf', bgLight: 'rgba(45, 212, 191, 0.15)', badgeBorder: 'rgba(45, 212, 191, 0.4)' },
];

const PERSON2_COLORS = [
  { color: '#f472b6', bgLight: 'rgba(244, 114, 182, 0.15)', badgeBorder: 'rgba(244, 114, 182, 0.4)' },
  { color: '#fb7185', bgLight: 'rgba(251, 113, 133, 0.15)', badgeBorder: 'rgba(251, 113, 133, 0.4)' },
  { color: '#e879f9', bgLight: 'rgba(232, 121, 249, 0.15)', badgeBorder: 'rgba(232, 121, 249, 0.4)' },
  { color: '#fbbf24', bgLight: 'rgba(251, 191, 36, 0.15)', badgeBorder: 'rgba(251, 191, 36, 0.4)' },
];

export function getSourceColorMeta(person: 'person1' | 'person2', index: number = 0) {
  const palette = person === 'person1' ? PERSON1_COLORS : PERSON2_COLORS;
  return palette[index % palette.length];
}