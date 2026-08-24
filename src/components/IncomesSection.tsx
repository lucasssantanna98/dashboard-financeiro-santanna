'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  Filter, 
  TrendingUp,
  Briefcase,
  Car,
  Eye,
  Sparkles,
  Gem
} from 'lucide-react';
import { Income, Person, IncomeSource } from '@/types';
import { SOURCES_MAP, formatCurrency, formatDate } from '@/lib/utils';

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
  onOpenWeeklyBatch,
}) => {
  const [filterPerson, setFilterPerson] = useState<'ALL' | Person>('ALL');

  const filteredIncomes = incomes.filter((i) => {
    if (filterPerson === 'ALL') return true;
    return i.person === filterPerson;
  });

  const fixedIncomes = filteredIncomes.filter((i) => i.period_type === 'monthly');
  const weeklyIncomes = filteredIncomes.filter((i) => i.period_type === 'weekly');

  const weeks = [1, 2, 3, 4, 5];

  const getSourceIcon = (code: IncomeSource) => {
    switch (code) {
      case 'ARQDIGITAL': return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'UBER_99': return <Car className="w-4 h-4 text-blue-400" />;
      case 'STUDIO_LASH': return <Eye className="w-4 h-4 text-pink-400" />;
      case 'CM': return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'SC': return <Gem className="w-4 h-4 text-fuchsia-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros e Acoes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        
        {/* Filtro de Pessoa */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setFilterPerson('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPerson === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterPerson('Lucas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterPerson === 'Lucas'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Lucas
          </button>
          <button
            onClick={() => setFilterPerson('Nicolly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterPerson === 'Nicolly'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-slate-400 hover:text-pink-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
            Nicolly
          </button>
        </div>

        {/* Botoes Rapidos */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWeeklyBatch}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-900/50 text-xs font-medium transition"
          >
            Fechamento Semanal
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            + Adicionar Entrada
          </button>
        </div>

      </div>

      {/* 1. SECAO FIXA MENSAL (ARQDIGITAL) */}
      {fixedIncomes.length > 0 && (
        <div className="glass-card p-5 rounded-2xl border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Renda Fixa Mensal</h3>
                <p className="text-xs text-slate-400">Sal{'\u00e1'}rio / Contratos Mensais</p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2.5 py-1 rounded-full">
              Fixo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {fixedIncomes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 group hover:border-slate-700 transition"
              >
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    {SOURCES_MAP[item.source]?.name || item.source}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(item.date)}</span>
                    <span>&bull;</span>
                    <span className="text-sky-400">{item.person}</span>
                    {item.notes && <span className="italic text-slate-500">({item.notes})</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteIncome(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GANHOS SEMANAIS (SEMANAS 1 A 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Entradas Semanais (Uber/99, Studio Lash, CM, SC)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((w) => {
            const itemsInWeek = weeklyIncomes.filter((i) => i.week_number === w);
            const totalInWeek = itemsInWeek.reduce((sum, curr) => sum + Number(curr.amount), 0);

            return (
              <div
                key={w}
                className={`glass-card p-4 rounded-2xl border transition-all ${
                  itemsInWeek.length > 0
                    ? 'border-slate-800 bg-slate-900/60'
                    : 'border-slate-800/40 bg-slate-950/40 opacity-70'
                }`}
              >
                {/* Cabecalho da Semana */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div>
                    <span className="text-xs font-bold text-white">Semana {w}</span>
                    <p className="text-[10px] text-slate-400">
                      {w === 1 && '01 a 07'}
                      {w === 2 && '08 a 14'}
                      {w === 3 && '15 a 21'}
                      {w === 4 && '22 a 28'}
                      {w === 5 && '29 ao fim'}
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold ${totalInWeek > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {formatCurrency(totalInWeek)}
                  </span>
                </div>

                {/* Itens da Semana */}
                {itemsInWeek.length > 0 ? (
                  <div className="space-y-2">
                    {itemsInWeek.map((item) => {
                      const meta = SOURCES_MAP[item.source];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 group hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {getSourceIcon(item.source)}
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-200 truncate">
                                {meta?.name || item.source}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className={item.person === 'Lucas' ? 'text-sky-400' : 'text-pink-400'}>
                                  {item.person}
                                </span>
                                {item.notes && <span>&bull; {item.notes}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-slate-100">
                              {formatCurrency(item.amount)}
                            </span>
                            <button
                              onClick={() => onDeleteIncome(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    Nenhum lan{'\u00e7'}amento nesta semana.
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