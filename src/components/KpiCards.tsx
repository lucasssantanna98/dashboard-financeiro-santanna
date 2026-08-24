'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';
import { DashboardSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface KpiCardsProps {
  summary: DashboardSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      {/* TOTAL RECEBIDO */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-24 h-24 text-cyan-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
              Total Recebido (Mês)
            </h3>
            <div className="p-2 bg-cyan-950/50 text-cyan-400 rounded-xl border border-cyan-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
            {formatCurrency(summary.totalIncome)}
          </p>
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
            <span className="flex items-center gap-1.5 text-sky-400 bg-sky-950/30 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              {formatCurrency(summary.sourcesBreakdown['ARQDIGITAL'] || 0 + summary.sourcesBreakdown['UBER_99'] || 0)}
              <span className="text-[10px] text-sky-500/80">({summary.totalIncome > 0 ? Math.round(((summary.sourcesBreakdown['ARQDIGITAL'] || 0 + summary.sourcesBreakdown['UBER_99'] || 0) / summary.totalIncome) * 100) : 0}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-pink-400 bg-pink-950/30 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              Nicolly: {formatCurrency(summary.sourcesBreakdown['STUDIO_LASH'] || 0 + summary.sourcesBreakdown['CM'] || 0 + summary.sourcesBreakdown['SC'] || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* CONTAS & GASTOS */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-24 h-24 text-amber-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
              Contas & Gastos
            </h3>
            <div className="p-2 bg-amber-950/50 text-amber-400 rounded-xl border border-amber-900/50">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
            {formatCurrency(summary.totalBills)}
          </p>
          <div className="flex items-center gap-3 text-xs font-medium mt-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="p-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10">✓</span>
              Pago: {formatCurrency(summary.paidBills)}
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="p-0.5 rounded-full border border-amber-400/30 bg-amber-400/10">⏳</span>
              Pendente: {formatCurrency(summary.pendingBills)}
            </span>
          </div>
        </div>
      </div>

      {/* SALDO / SOBRA */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className={`w-24 h-24 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
                Saldo / Sobra Líquida
              </h3>
              <div className={`p-2 rounded-xl border ${isPositive ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-red-950/50 text-red-400 border-red-900/50'}`}>
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(summary.netBalance)}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400">Margem do Casal:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {summary.totalIncome > 0 ? Math.round((summary.netBalance / summary.totalIncome) * 100) : 0}% livre
            </span>
          </div>
        </div>
      </div>

      {/* PROJECAO MES (OPCIONAL, OCUPA LINHA INTEIRA OU ENCAIXA) */}
      <div className="md:col-span-3 glass-card p-4 sm:p-5 rounded-2xl border-purple-900/30 bg-purple-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-900/40 text-purple-400 rounded-xl border border-purple-800/50">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-purple-300/70 tracking-widest uppercase mb-0.5">
              Projeção Fim do Mês
            </h3>
            <p className="text-xl font-extrabold text-purple-100">
              {formatCurrency(summary.projectedIncome)}
            </p>
          </div>
        </div>
        <div className="text-xs font-medium text-purple-300/80 bg-purple-950/40 px-3 py-2 rounded-lg border border-purple-900/30">
          <span className="opacity-70">≈ Estimativa de entradas:</span> <strong className="text-purple-200">+ {formatCurrency(summary.projectedIncome - summary.totalIncome)} livre</strong>
        </div>
      </div>

    </div>
  );
};