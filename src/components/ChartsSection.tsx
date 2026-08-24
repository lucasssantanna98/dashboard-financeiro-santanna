'use client';

import React from 'react';
import { BarChart3, PieChart, Briefcase, Car, Eye, Sparkles, Gem } from 'lucide-react';
import { DashboardSummary } from '@/types';
import { SOURCES_MAP, formatCurrency } from '@/lib/utils';

interface ChartsSectionProps {
  summary: DashboardSummary;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ summary }) => {
  const { weeklyBreakdown, sourcesBreakdown, totalIncome } = summary;

  const maxWeekly = Math.max(...Object.values(weeklyBreakdown).map(w => w.total), 1000);

  const getSourceIcon = (code: string) => {
    switch (code) {
      case 'ARQDIGITAL': return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      case 'UBER_99': return <Car className="w-3.5 h-3.5 text-blue-400" />;
      case 'STUDIO_LASH': return <Eye className="w-3.5 h-3.5 text-pink-400" />;
      case 'CM': return <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
      case 'SC': return <Gem className="w-3.5 h-3.5 text-fuchsia-400" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. EVOLUÇÃO SEMANAL (BARRAS COMPARATIVAS) */}
      <div className="glass-card p-5 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Evolução por Semana</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Lucas
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span> Nicolly
            </span>
          </div>
        </div>

        <div className="pt-4 pb-2 space-y-4">
          {[1, 2, 3, 4, 5].map((w) => {
            const data = weeklyBreakdown[w] || { total: 0, lucas: 0, nicolly: 0 };
            const lucasWidth = maxWeekly > 0 ? (data.lucas / maxWeekly) * 100 : 0;
            const nicollyWidth = maxWeekly > 0 ? (data.nicolly / maxWeekly) * 100 : 0;

            return (
              <div key={w} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Semana {w}</span>
                  <span className="font-bold text-slate-200">{formatCurrency(data.total)}</span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${lucasWidth}%` }}
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-500"
                    title={`Lucas: ${formatCurrency(data.lucas)}`}
                  ></div>
                  <div
                    style={{ width: `${nicollyWidth}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                    title={`Nicolly: ${formatCurrency(data.nicolly)}`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO POR FONTE DE RENDA */}
      <div className="glass-card p-5 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-pink-400" />
          <h3 className="text-sm font-bold text-white">Fontes de Renda do Casal</h3>
        </div>

        <div className="space-y-3 pt-2">
          {Object.entries(sourcesBreakdown).map(([key, val]) => {
            const src = SOURCES_MAP[key as keyof typeof SOURCES_MAP];
            const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <span>{getSourceIcon(key)}</span>
                    <span>{src?.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{formatCurrency(val)}</span>
                    <span className="text-slate-500 text-[11px]">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: src?.color }}
                    className="h-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};