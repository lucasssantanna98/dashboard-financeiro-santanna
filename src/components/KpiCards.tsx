'use client';

import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Wallet, 
  Target, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { DashboardSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface KpiCardsProps {
  summary: DashboardSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const {
    totalIncome,
    lucasIncome,
    nicollyIncome,
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    netBalance,
    projection,
  } = summary;

  const lucasPct = totalIncome > 0 ? Math.round((lucasIncome / totalIncome) * 100) : 50;
  const nicollyPct = totalIncome > 0 ? Math.round((nicollyIncome / totalIncome) * 100) : 50;
  const savingsPct = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. TOTAL ENTRADAS */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-slate-800">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Recebido (MÃªs)
          </span>
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalIncome)}
        </div>

        {/* DivisÃ£o Lucas vs Nicolly */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="text-slate-400">Lucas:</span>
            <span className="font-semibold text-sky-300">{formatCurrency(lucasIncome)}</span>
            <span className="text-[10px] text-slate-500">({lucasPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            <span className="text-slate-400">Nicolly:</span>
            <span className="font-semibold text-pink-300">{formatCurrency(nicollyIncome)}</span>
            <span className="text-[10px] text-slate-500">({nicollyPct}%)</span>
          </div>
        </div>
      </div>

      {/* 2. TOTAL CONTAS & GASTOS */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-slate-800">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Contas & Gastos
          </span>
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalExpenses)}
        </div>

        {/* Status Pago vs Pendente */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pago: {formatCurrency(paidExpenses)}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendente: {formatCurrency(pendingExpenses)}</span>
          </div>
        </div>
      </div>

      {/* 3. SALDO LÃQUIDO / SOBRA */}
      <div className={`glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-slate-800 ${netBalance >= 0 ? 'glow-emerald' : ''}`}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-all ${netBalance >= 0 ? 'bg-emerald-500/15 group-hover:bg-emerald-500/25' : 'bg-red-500/15'}`}></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Saldo / Sobra LÃ­quida
          </span>
          <div className={`p-2 rounded-xl border ${netBalance >= 0 ? 'bg-emerald-950/80 border-emerald-800/40 text-emerald-400' : 'bg-red-950/80 border-red-800/40 text-red-400'}`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCurrency(netBalance)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Margem do Casal:</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${netBalance >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-red-950 text-red-300 border border-red-800/40'}`}>
            {savingsPct}% livre
          </span>
        </div>
      </div>

      {/* 4. PROJEÃ‡ÃƒO DE FECHAMENTO */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group border-slate-800">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ProjeÃ§Ã£o Fim do MÃªs
          </span>
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-tight">
          {formatCurrency(projection)}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Estimativa de entradas:
          </span>
          <span className="font-semibold text-purple-300">
            + {formatCurrency(Math.max(0, projection - totalExpenses))} livre
          </span>
        </div>
      </div>

    </div>
  );
};