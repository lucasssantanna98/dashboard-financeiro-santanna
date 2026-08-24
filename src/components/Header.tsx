'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarRange, 
  ReceiptText, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { getMonthName, getCurrentMonthYear } from '@/lib/utils';

interface HeaderProps {
  currentMonthYear: string;
  onMonthChange: (newMonth: string) => void;
  onOpenQuickAdd: (defaultTab?: 'income' | 'bill') => void;
  onOpenWeeklyBatch: () => void;
  onOpenTemplates: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthYear,
  onMonthChange,
  onOpenQuickAdd,
  onOpenWeeklyBatch,
  onOpenTemplates,
  onRefresh,
  isRefreshing,
}) => {
  const currentActualMonth = getCurrentMonthYear();

  const handlePrevMonth = () => {
    const [year, month] = currentMonthYear.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthYear.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleCurrentMonth = () => {
    onMonthChange(currentActualMonth);
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0b101d]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo & Casal Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Sant&apos;Anna FinanÃ§as
                </h1>
                <span className="text-[10px] uppercase font-semibold tracking-widest bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  Casal
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-sky-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Lucas
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1 text-pink-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Nicolly
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            title="Atualizar dados"
            className="md:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Seletor de MÃªs Central */}
        <div className="flex items-center justify-center gap-2 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-xl shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="MÃªs Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-semibold text-slate-100 min-w-[130px] text-center">
              {getMonthName(currentMonthYear)}
            </span>
            {currentMonthYear !== currentActualMonth && (
              <button
                onClick={handleCurrentMonth}
                className="text-[11px] bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800/50 px-2 py-0.5 rounded-md font-medium transition"
              >
                Hoje
              </button>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="PrÃ³ximo MÃªs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* AÃ§Ãµes RÃ¡pidas (Zero FricÃ§Ã£o) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Entrada RÃ¡pida</span>
          </button>

          <button
            onClick={onOpenWeeklyBatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-medium transition active:scale-95 whitespace-nowrap"
          >
            <CalendarRange className="w-3.5 h-3.5 text-pink-400" />
            <span>Fechamento Semanal</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('bill')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-medium transition active:scale-95 whitespace-nowrap"
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Conta</span>
          </button>

          <button
            onClick={onOpenTemplates}
            title="Modelos Recorrentes"
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-400 hover:text-white border border-slate-700/80 text-xs transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            title="Sincronizar"
            className="hidden md:flex p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-400 hover:text-white border border-slate-700/80 text-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
};