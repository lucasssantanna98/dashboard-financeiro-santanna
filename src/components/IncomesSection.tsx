'use client';

import React from 'react';
import { Briefcase, Building2, Trash2 } from 'lucide-react';
import { Income } from '@/types';
import { formatCurrency, SOURCES_MAP } from '@/lib/utils';

interface IncomesSectionProps {
  incomes: Income[];
  onDeleteIncome: (id: string) => Promise<void>;
  onOpenQuickAdd: (tab?: 'income' | 'bill') => void;
  onOpenWeeklyBatch: () => void;
}

export const IncomesSection: React.FC<IncomesSectionProps> = ({ 
  incomes, 
  onDeleteIncome,
  onOpenQuickAdd,
  onOpenWeeklyBatch
}) => {
  // ArqDigital é renda fixa
  const fixedIncomes = incomes.filter(i => SOURCES_MAP[i.source_code as IncomeSource]?.defaultPeriod === 'monthly');
  // O resto é semanal
  const weeklyIncomes = incomes.filter(i => SOURCES_MAP[i.source_code as IncomeSource]?.defaultPeriod === 'weekly');

  return (
    <div className="space-y-6">
      
      {/* 1. RENDA FIXA MENSAL */}
      <div className="glass-card rounded-2xl border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-950/50 text-sky-400 border border-sky-900/50">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">Renda Fixa Mensal</h3>
              <p className="text-[10px] text-slate-400">Salário / Contratos Mensais</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenQuickAdd('income')}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
          >
            Fixo
          </button>
        </div>
        
        <div className="divide-y divide-slate-800/50">
          {fixedIncomes.length > 0 ? (
            fixedIncomes.map(inc => {
              const src = SOURCES_MAP[inc.source_code as IncomeSource];
              return (
                <div key={inc.id} className="p-4 flex items-center justify-between hover:bg-slate-900/30 transition group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-200">{src?.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>{inc.date.split('-').reverse().join('/')}</span>
                      <span>&bull;</span>
                      <span className="text-sky-400 font-semibold">{src?.person}</span>
                      <span className="text-slate-600">(Salário Fixo)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-emerald-400">{formatCurrency(inc.amount)}</span>
                    <button 
                      onClick={() => onDeleteIncome(inc.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              Nenhuma renda fixa registrada neste mês.
            </div>
          )}
        </div>
      </div>

      {/* 2. RENDAS SEMANAIS (GRID DE SEMANAS) */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <TrendingIcon />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Entradas Semanais <span className="text-[10px] text-slate-500 font-medium normal-case tracking-normal">(UBER/99, STUDIO LASH, CM, SC)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((w) => {
            const weekIncomes = weeklyIncomes.filter(i => i.week_number === w);
            const weekTotal = weekIncomes.reduce((acc, curr) => acc + curr.amount, 0);

            // Calcular datas aprox para a label
            const startDay = (w - 1) * 7 + 1;
            const endDay = w === 5 ? 'fim' : w * 7;

            return (
              <div key={w} className={`glass-card p-4 rounded-2xl border transition-all ${weekIncomes.length > 0 ? 'border-slate-700 bg-slate-900/60' : 'border-slate-800/40 bg-slate-950/40 opacity-70'}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div>
                    <span className="text-xs font-bold text-white">Semana {w}</span>
                    <p className="text-[10px] text-slate-400">{startDay} a {endDay}</p>
                  </div>
                  <span className={`text-sm font-extrabold ${weekTotal > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formatCurrency(weekTotal)}
                  </span>
                </div>
                
                {weekIncomes.length > 0 ? (
                  <div className="space-y-3">
                    {weekIncomes.map(inc => {
                      const src = SOURCES_MAP[inc.source_code];
                      return (
                        <div key={inc.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition">
                              <Building2 className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-300 leading-tight">{src?.name}</p>
                              <p className="text-[9px] font-semibold text-slate-500 uppercase">{src?.person} &bull; Semana {inc.week_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{formatCurrency(inc.amount)}</span>
                            <button 
                              onClick={() => onDeleteIncome(inc.id)}
                              className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-slate-800 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    Nenhum lançamento nesta semana.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);