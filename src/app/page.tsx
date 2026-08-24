'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchIncomes, 
  createIncome, 
  deleteIncome, 
  saveWeeklyBatch,
  fetchMonthlyBills, 
  toggleBillStatus, 
  updateBillAmount, 
  createMonthlyBill, 
  deleteMonthlyBill,
  generateBillsFromTemplates,
  calculateSummary 
} from '@/lib/db';
import { Income, MonthlyBill, DashboardSummary, BillStatus, IncomeSource, Person, PeriodType } from '@/types';
import { getCurrentMonthYear } from '@/lib/utils';
import { Header } from '@/components/Header';
import { KpiCards } from '@/components/KpiCards';
import { IncomesSection } from '@/components/IncomesSection';
import { BillsSection } from '@/components/BillsSection';
import { ChartsSection } from '@/components/ChartsSection';
import { QuickAddModal } from '@/components/QuickAddModal';
import { WeeklyBatchModal } from '@/components/WeeklyBatchModal';
import { TemplatesModal } from '@/components/TemplatesModal';
import { LayoutDashboard, TrendingUp, ReceiptText, BarChart3, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [currentMonthYear, setCurrentMonthYear] = useState(getCurrentMonthYear());
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalIncome: 0,
    lucasIncome: 0,
    esposaIncome: 0,
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0,
    netBalance: 0,
    projection: 0,
    sourcesBreakdown: { ARQDIGITAL: 0, UBER_99: 0, STUDIO_LASH: 0, CM: 0, SC: 0 },
    weeklyBreakdown: { 1: { total: 0, lucas: 0, esposa: 0 }, 2: { total: 0, lucas: 0, esposa: 0 }, 3: { total: 0, lucas: 0, esposa: 0 }, 4: { total: 0, lucas: 0, esposa: 0 }, 5: { total: 0, lucas: 0, esposa: 0 } },
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'incomes' | 'bills' | 'charts'>('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'income' | 'bill'>('income');
  const [isWeeklyBatchOpen, setIsWeeklyBatchOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fetchedIncomes, fetchedBills] = await Promise.all([
        fetchIncomes(currentMonthYear),
        fetchMonthlyBills(currentMonthYear),
      ]);
      setIncomes(fetchedIncomes);
      setBills(fetchedBills);
      setSummary(calculateSummary(fetchedIncomes, fetchedBills));
    } finally {
      setIsRefreshing(false);
    }
  }, [currentMonthYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers para Receitas
  const handleAddIncome = async (data: {
    source: IncomeSource;
    person: Person;
    amount: number;
    date: string;
    month_year: string;
    period_type: PeriodType;
    week_number: number;
    notes?: string;
  }) => {
    await createIncome(data);
    await loadData();
    showToast('Entrada adicionada com sucesso! ðŸ’°');
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id, currentMonthYear);
    await loadData();
    showToast('LanÃ§amento removido.');
  };

  const handleSaveWeeklyBatch = async (
    monthYear: string,
    weekNumber: number,
    entries: Array<{ source: IncomeSource; person: Person; amount: number; notes?: string }>
  ) => {
    await saveWeeklyBatch(monthYear, weekNumber, entries);
    await loadData();
    showToast(`Fechamento da Semana ${weekNumber} salvo com sucesso! ðŸš€`);
  };

  // Handlers para Contas
  const handleAddBill = async (data: {
    title: string;
    category: string;
    amount: number;
    due_date: string;
    month_year: string;
    is_fixed: boolean;
    status: 'pending' | 'paid';
    notes?: string;
  }) => {
    await createMonthlyBill(data);
    await loadData();
    showToast('Conta adicionada com sucesso! ðŸ§¾');
  };

  const handleToggleBillStatus = async (id: string, currentStatus: BillStatus) => {
    await toggleBillStatus(id, currentStatus, currentMonthYear);
    await loadData();
  };

  const handleUpdateBillAmount = async (id: string, newAmount: number) => {
    await updateBillAmount(id, newAmount, currentMonthYear);
    await loadData();
    showToast('Valor da conta atualizado!');
  };

  const handleDeleteBill = async (id: string) => {
    await deleteMonthlyBill(id, currentMonthYear);
    await loadData();
    showToast('Conta removida do mÃªs.');
  };

  const handleGenerateBills = async () => {
    await generateBillsFromTemplates(currentMonthYear);
    await loadData();
    showToast('Contas recorrentes importadas com sucesso! âš¡');
  };

  return (
    <div className="min-h-screen bg-[#080c14] pb-20">
      
      {/* Header Sticky */}
      <Header
        currentMonthYear={currentMonthYear}
        onMonthChange={setCurrentMonthYear}
        onOpenQuickAdd={(tab = 'income') => {
          setQuickAddTab(tab);
          setIsQuickAddOpen(true);
        }}
        onOpenWeeklyBatch={() => setIsWeeklyBatchOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI Top Cards */}
        <KpiCards summary={summary} />

        {/* NavegaÃ§Ã£o por Abas Principais */}
        <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>VisÃ£o Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('incomes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'incomes'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Receitas & Entradas ({incomes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'bills'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ReceiptText className="w-4 h-4 text-emerald-400" />
            <span>Contas & Gastos ({bills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'charts'
                ? 'border-pink-400 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-pink-400" />
            <span>RelatÃ³rios & GrÃ¡ficos</span>
          </button>
        </div>

        {/* ConteÃºdo DinÃ¢mico por Aba */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <IncomesSection
              incomes={incomes}
              onDeleteIncome={handleDeleteIncome}
              onOpenQuickAdd={(tab) => {
                setQuickAddTab(tab || 'income');
                setIsQuickAddOpen(true);
              }}
              onOpenWeeklyBatch={() => setIsWeeklyBatchOpen(true)}
            />
            <BillsSection
              bills={bills}
              currentMonthYear={currentMonthYear}
              onToggleStatus={handleToggleBillStatus}
              onUpdateAmount={handleUpdateBillAmount}
              onDeleteBill={handleDeleteBill}
              onGenerateFromTemplates={handleGenerateBills}
              onOpenQuickAdd={(tab) => {
                setQuickAddTab(tab || 'bill');
                setIsQuickAddOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'incomes' && (
          <IncomesSection
            incomes={incomes}
            onDeleteIncome={handleDeleteIncome}
            onOpenQuickAdd={(tab) => {
              setQuickAddTab(tab || 'income');
              setIsQuickAddOpen(true);
            }}
            onOpenWeeklyBatch={() => setIsWeeklyBatchOpen(true)}
          />
        )}

        {activeTab === 'bills' && (
          <BillsSection
            bills={bills}
            currentMonthYear={currentMonthYear}
            onToggleStatus={handleToggleBillStatus}
            onUpdateAmount={handleUpdateBillAmount}
            onDeleteBill={handleDeleteBill}
            onGenerateFromTemplates={handleGenerateBills}
            onOpenQuickAdd={(tab) => {
              setQuickAddTab(tab || 'bill');
              setIsQuickAddOpen(true);
            }}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsSection summary={summary} />
        )}

      </main>

      {/* Modais */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        currentMonthYear={currentMonthYear}
        defaultTab={quickAddTab}
        onAddIncome={handleAddIncome}
        onAddBill={handleAddBill}
      />

      <WeeklyBatchModal
        isOpen={isWeeklyBatchOpen}
        onClose={() => setIsWeeklyBatchOpen(false)}
        currentMonthYear={currentMonthYear}
        onSaveBatch={handleSaveWeeklyBatch}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}