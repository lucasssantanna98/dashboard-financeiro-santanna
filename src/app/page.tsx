'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
import { IncomesSection } from '@/components/IncomesSection';
import { BillsSection } from '@/components/BillsSection';
import { ChartsSection } from '@/components/ChartsSection';
import { QuickAddModal } from '@/components/QuickAddModal';
import { WeeklyBatchModal } from '@/components/WeeklyBatchModal';
import { TemplatesModal } from '@/components/TemplatesModal';
import { LayoutDashboard, Wallet, LineChart } from 'lucide-react';

import { 
  fetchDashboardData, 
  deleteIncome, 
  deleteMonthlyBill, 
  updateMonthlyBillStatus, 
  updateMonthlyBillAmount,
  generateBillsFromTemplates 
} from '@/lib/db';
import { getCurrentMonthYear } from '@/lib/utils';
import { Income, MonthlyBill, DashboardSummary, BillStatus } from '@/types';

export default function Home() {
  const [currentMonthYear, setCurrentMonthYear] = useState(getCurrentMonthYear());
  
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'income'|'bill'>('income');
  
  const [isWeeklyBatchOpen, setIsWeeklyBatchOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'incomes' | 'bills' | 'charts'>('overview');

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchDashboardData(currentMonthYear);
      setIncomes(data.incomes);
      setBills(data.bills);
      setSummary(data.summary);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonthYear]);

  const handleOpenQuickAdd = (tab: 'income' | 'bill' = 'income') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const handleGenerateTemplates = async () => {
    if(confirm('Gerar contas baseadas nos seus modelos para este mês?')) {
      await generateBillsFromTemplates(currentMonthYear);
      await loadData(true);
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold animate-pulse">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER PRINCIPAL */}
      <Header 
        currentMonthYear={currentMonthYear}
        onMonthChange={setCurrentMonthYear}
        onOpenQuickAdd={handleOpenQuickAdd}
        onOpenWeeklyBatch={() => setIsWeeklyBatchOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-8">
        
        {/* KPI CARDS (RESUMO) */}
        {summary && <KpiCards summary={summary} />}

        {/* NAVEGACAO EM ABAS (MOBILE & DESKTOP) */}
        <div className="border-b border-slate-800 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 min-w-max pb-px">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('incomes')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'incomes' ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              <TrendingIcon /> Receitas & Entradas ({incomes.length})
            </button>
            <button 
              onClick={() => setActiveTab('bills')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'bills' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              <Wallet className="w-4 h-4" /> Contas & Gastos ({bills.length})
            </button>
            <button 
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'charts' ? 'border-pink-400 text-pink-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
            >
              <LineChart className="w-4 h-4" /> Relatórios & Gráficos
            </button>
          </div>
        </div>

        {/* CONTEUDO DAS ABAS */}
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
          
          {(activeTab === 'overview' || activeTab === 'incomes') && (
            <div className="mb-8">
              <IncomesSection 
                incomes={incomes}
                onDeleteIncome={async (id) => {
                  if(confirm('Tem certeza que deseja excluir esta entrada?')) {
                    await deleteIncome(id, currentMonthYear);
                    await loadData(true);
                  }
                }}
                onOpenQuickAdd={handleOpenQuickAdd}
                onOpenWeeklyBatch={() => setIsWeeklyBatchOpen(true)}
              />
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'bills') && (
            <div className="mb-8">
              <BillsSection
                bills={bills}
                currentMonthYear={currentMonthYear}
                onToggleStatus={async (id, status) => {
                  await updateMonthlyBillStatus(id, status === 'pending' ? 'paid' : 'pending', currentMonthYear);
                  await loadData(true);
                }}
                onUpdateAmount={async (id, amount) => {
                  await updateMonthlyBillAmount(id, amount, currentMonthYear);
                  await loadData(true);
                }}
                onDeleteBill={async (id) => {
                  if(confirm('Tem certeza que deseja excluir esta conta?')) {
                    await deleteMonthlyBill(id, currentMonthYear);
                    await loadData(true);
                  }
                }}
                onGenerateFromTemplates={handleGenerateTemplates}
                onOpenQuickAdd={handleOpenQuickAdd}
              />
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'charts') && summary && (
            <div className="mb-8">
              <ChartsSection summary={summary} />
            </div>
          )}

        </div>

      </main>

      {/* MODALS */}
      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultTab={quickAddTab}
        onSuccess={() => loadData(true)}
        currentMonthYear={currentMonthYear}
      />

      <WeeklyBatchModal
        isOpen={isWeeklyBatchOpen}
        onClose={() => setIsWeeklyBatchOpen(false)}
        onSuccess={() => loadData(true)}
        currentMonthYear={currentMonthYear}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

    </div>
  );
}

const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
);