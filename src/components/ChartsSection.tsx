'use client';

import React from 'react';
import { BarChart3, PieChart, Briefcase, Car, Eye, Sparkles, Gem } from 'lucide-react';
import { DashboardSummary } from '@/types';
import { formatCurrency, getSourceColorMeta } from '@/lib/utils';

interface ChartsSectionProps {
  summary: DashboardSummary;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ summary }) => {
  const { weeklyBreakdown, sourcesBreakdown, totalIncome, person1Name, person2Name, incomeSources } = summary;

  const maxWeekly = Math.max(...Object.values(weeklyBreakdown).map(w => w.total), 1000);

  const getSourceIcon = (person: string) => {
    return person === 'person1' ? <Briefcase className="w-3.5 h-3.5 text-sky-400" /> : <Sparkles className="w-3.5 h-3.5 text-pink-400" />;
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
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> {person1Name}
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span> {person2Name}
            </span>
          </div>
        </div>

        <div className="pt-4 pb-2 space-y-4">
          {[1, 2, 3, 4, 5].map((w) => {
            const data = weeklyBreakdown[w] || { total: 0, person1: 0, person2: 0 };
            const person1Width = maxWeekly > 0 ? (data.person1 / maxWeekly) * 100 : 0;
            const person2Width = maxWeekly > 0 ? (data.person2 / maxWeekly) * 100 : 0;

            return (
              <div key={w} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Semana {w}</span>
                  <span className="font-bold text-slate-200">{formatCurrency(data.total)}</span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${person1Width}%` }}
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-500"
                    title={`${person1Name}: ${formatCurrency(data.person1)}`}
                  ></div>
                  <div
                    style={{ width: `${person2Width}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                    title={`${person2Name}: ${formatCurrency(data.person2)}`}
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
          {Object.entries(sourcesBreakdown).map(([key, val], index) => {
            const src = incomeSources.find(s => s.name === key);
            const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
            const personStr = src?.person === 'person2' ? 'person2' : 'person1';
            const colorMeta = getSourceColorMeta(personStr, index);

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <span>{getSourceIcon(personStr)}</span>
                    <span>{key}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{formatCurrency(val)}</span>
                    <span className="text-slate-500 text-[11px]">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: colorMeta.color }}
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