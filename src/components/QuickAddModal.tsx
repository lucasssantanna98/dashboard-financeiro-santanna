'use client';

import React, { useState } from 'react';
import { X, Plus, Receipt } from 'lucide-react';
import { IncomeSource } from '@/types';
import { SOURCES_MAP } from '@/lib/utils';
import { createIncome, createMonthlyBill } from '@/lib/db';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'income' | 'bill';
  onSuccess: () => void;
  currentMonthYear: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'income',
  onSuccess,
  currentMonthYear
}) => {
  const [tab, setTab] = useState<'income' | 'bill'>(defaultTab);
  const [loading, setLoading] = useState(false);

  // Form states - Income
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('UBER_99');
  const [incomeWeek, setIncomeWeek] = useState(1);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states - Bill
  const [billTitle, setBillTitle] = useState('');
  const [billCategory, setBillCategory] = useState('Moradia');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [billStatus, setBillStatus] = useState<'pending' | 'paid'>('pending');
  const [billFixed, setBillFixed] = useState(true);

  if (!isOpen) return null;

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(incomeAmount.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    await createIncome({
      source_code: incomeSource,
      amount: num,
      date: incomeDate,
      week_number: incomeWeek,
      month_year: currentMonthYear,
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(billAmount.replace(',', '.'));
    if (isNaN(num) || num <= 0 || !billTitle) return;

    setLoading(true);
    await createMonthlyBill({
      title: billTitle,
      category: billCategory,
      amount: num,
      due_date: billDueDate,
      status: billStatus,
      is_fixed: billFixed,
      month_year: currentMonthYear,
    });
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800/80">
            <button
              onClick={() => setTab('income')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'income' 
                  ? 'bg-cyan-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Nova Entrada
            </button>
            <button
              onClick={() => setTab('bill')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'bill' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Nova Conta
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition bg-slate-900 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {tab === 'income' ? (
          <form onSubmit={handleIncomeSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Fonte de Renda
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SOURCES_MAP).map((src) => (
                  <label
                    key={src.code}
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                      incomeSource === src.code
                        ? 'border-cyan-500 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="source"
                      value={src.code}
                      checked={incomeSource === src.code}
                      onChange={() => setIncomeSource(src.code as IncomeSource)}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-200 mb-0.5">{src.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{src.person}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Data</label>
                <input
                  type="date"
                  required
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Semana do Mês</label>
                <select
                  value={incomeWeek}
                  onChange={(e) => setIncomeWeek(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value={1}>Semana 1</option>
                  <option value={2}>Semana 2</option>
                  <option value={3}>Semana 3</option>
                  <option value={4}>Semana 4</option>
                  <option value={5}>Semana 5+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-cyan-500 transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Salvando...' : <><Plus className="w-5 h-5" /> Registrar Entrada</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBillSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Título da Conta
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Aluguel, Internet..."
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Categoria</label>
                <select
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Data Vencimento</label>
                <input
                  type="date"
                  required
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={billFixed}
                  onChange={(e) => setBillFixed(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-800"
                />
                <span className="text-xs font-semibold text-slate-300">É uma conta fixa</span>
              </label>

              <select
                value={billStatus}
                onChange={(e) => setBillStatus(e.target.value as 'pending' | 'paid')}
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Já Pago</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-amber-900/50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Salvando...' : <><Receipt className="w-5 h-5" /> Adicionar Conta</>}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};