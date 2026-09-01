'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarRange, 
  ReceiptText, 
  SlidersHorizontal,
  Settings,
  RefreshCw
} from 'lucide-react';
import { getMonthName, getCurrentMonthYear } from '@/lib/utils';

interface HeaderProps {
  currentMonthYear: string;
  onMonthChange: (newMonth: string) => void;
  onOpenQuickAdd: (defaultTab?: 'income' | 'bill') => void;
  onOpenWeeklyBatch: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isAdmin?: boolean;
  person1Name?: string;
  person2Name?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthYear,
  onMonthChange,
  onOpenQuickAdd,
  onOpenWeeklyBatch,
  onOpenTemplates,
  onOpenSettings,
  onRefresh,
  isRefreshing,
  isAdmin,
  person1Name = 'Pessoa 1',
  person2Name = 'Pessoa 2',
  onLogout,
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
                  Sant&apos;Anna Finanças
                </h1>
                <span className="text-[10px] uppercase font-semibold tracking-widest bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/40">
                  Casal
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-sky-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> {person1Name}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1 text-pink-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> {person2Name}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            title="Atualizar dados"
            className="md:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Month Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4">
          
          {/* Month Selector */}
          <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={handleCurrentMonth}
              className="w-32 sm:w-40 text-center text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition"
              title="Ir para o mês atual"
            >
              {getMonthName(currentMonthYear)}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQuickAdd('income')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Entrada Rápida</span>
              <span className="sm:hidden">Entrada</span>
            </button>

            <button
              onClick={onOpenWeeklyBatch}
              title="Fechamento Semanal (Múltiplas Fontes)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/30 text-xs font-medium transition active:scale-95"
            >
              <CalendarRange className="w-4 h-4" />
              <span className="hidden sm:inline">Fechamento Semanal</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('bill')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-medium transition active:scale-95"
            >
              <ReceiptText className="w-4 h-4" />
              <span className="hidden sm:inline">+ Conta</span>
            </button>

            <button
              onClick={onOpenTemplates}
              title="Configurar Modelos de Contas"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Configurações do Usuário"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onRefresh}
              title="Atualizar dados"
              className="hidden md:flex p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent transition active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {isAdmin && (
              <a href="/admin"
                title="Painel Admin"
                className="p-2 ml-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition active:scale-95"
              >
                Admin
              </a>
            )}
            
            <button
              onClick={onLogout}
              title="Sair"
              className="p-2 ml-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition active:scale-95"
            >
              Sair
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};