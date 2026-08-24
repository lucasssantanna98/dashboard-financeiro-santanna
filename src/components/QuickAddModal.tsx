'use client';

import React, { useState } from 'react';
import { X, Sparkles, PlusCircle } from 'lucide-react';
import { IncomeSource, Person, PeriodType } from '@/types';
import { SOURCES_MAP, getWeekNumber } from '@/lib/utils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthYear: string;
  defaultTab?: 'income' | 'bill';
  onAddIncome: (data: {
    source: IncomeSource;
    person: Person;
    amount: number;
    date: string;
    month_year: string;
    period_type: PeriodType;
    week_number: number;
    notes?: string;
  }) => Promise<void>;
  onAddBill: (data: {
    title: string;
    category: string;
    amount: number;
    due_date: string;
    month_year: string;
    is_fixed: boolean;
    status: 'pending' | 'paid';
    notes?: string;
  }) => Promise<void>;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  currentMonthYear,
  defaultTab = 'income',
  onAddIncome,
  onAddBill,
}) => {
  const [tab, setTab] = useState<'income' | 'bill'>(defaultTab);

  // Income State
  const [selectedSource, setSelectedSource] = useState<IncomeSource>('UBER_99');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Bill State
  const [billTitle, setBillTitle] = useState('');
  const [billCategory, setBillCategory] = useState('Geral');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [billIsFixed, setBillIsFixed] = useState(false);
  const [billStatus, setBillStatus] = useState<'pending' | 'paid'>('pending');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (src: IncomeSource) => {
    setSelectedSource(src);
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!numAmount || numAmount <= 0) return;

    setLoading(true);
    try {
      const meta = SOURCES_MAP[selectedSource];
      const week = getWeekNumber(date);
      const mYear = date.substring(0, 7);

      await onAddIncome({
        source: selectedSource,
        person: meta.person,
        amount: numAmount,
        date,
        month_year: mYear || currentMonthYear,
        period_type: meta.defaultPeriod,
        week_number: week,
        notes: notes.trim() || undefined,
      });

      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(billAmount.replace(',', '.'));
    if (!billTitle.trim() || !numAmount || numAmount <= 0) return;

    setLoading(true);
    try {
      const mYear = billDueDate.substring(0, 7);
      await onAddBill({
        title: billTitle.trim(),
        category: billCategory,
        amount: numAmount,
        due_date: billDueDate,
        month_year: mYear || currentMonthYear,
        is_fixed: billIsFixed,
        status: billStatus,
      });

      setBillTitle('');
      setBillAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Header com Abas */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTab('income')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === 'income'
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Entrada (Receita)
            </button>
            <button
              onClick={() => setTab('bill')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === 'bill'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Conta / Despesa
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEÃšDO: ENTRADA RÃPIDA */}
        {tab === 'income' ? (
          <form onSubmit={handleSubmitIncome} className="mt-5 space-y-4">
            
            {/* Presets de 1-Clique */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Selecione a Fonte (1-Clique):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SOURCES_MAP).map((src) => {
                  const isSelected = selectedSource === src.code;
                  return (
                    <button
                      key={src.code}
                      type="button"
                      onClick={() => handleSelectPreset(src.code)}
                      style={{
                        borderColor: isSelected ? src.color : 'rgba(51, 65, 85, 0.6)',
                        backgroundColor: isSelected ? src.bgLight : 'rgba(15, 23, 42, 0.6)',
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                        isSelected ? 'ring-1 ring-offset-0' : 'hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{src.icon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {src.name}
                        </div>
                        <div className={`text-[10px] ${src.person === 'Lucas' ? 'text-sky-400' : 'text-pink-400'}`}>
                          {src.person}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input de Valor R$ */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Valor Recebido (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-lg font-bold placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Data e Semana */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  Data:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  Semana Calculada:
                </label>
                <div className="px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-cyan-400 font-semibold text-xs flex items-center justify-between">
                  <span>Semana {getWeekNumber(date)}</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* ObservaÃ§Ãµes */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                ObservaÃ§Ã£o (opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Atendimento noiva, Gorjetas Uber..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* BotÃ£o de Envio */}
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-[0.98]"
            >
              {loading ? 'Salvando...' : 'Salvar Entrada'}
            </button>
          </form>
        ) : (
          /* CONTEÃšDO: CONTA / DESPESA */
          <form onSubmit={handleSubmitBill} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                Nome da Conta / Compromisso:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: FarmÃ¡cia, ManutenÃ§Ã£o Carro, Supermercado..."
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Valor (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Categoria:
                </label>
                <select
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Transporte">Transporte</option>
                  <option value="AlimentaÃ§Ã£o">AlimentaÃ§Ã£o</option>
                  <option value="ServiÃ§os">ServiÃ§os</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="SaÃºde">SaÃºde</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Vencimento:
                </label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Status Inicial:
                </label>
                <select
                  value={billStatus}
                  onChange={(e) => setBillStatus(e.target.value as 'pending' | 'paid')}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="pending">â³ Pendente</option>
                  <option value="paid">âœ… JÃ¡ Pago</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="billIsFixed"
                checked={billIsFixed}
                onChange={(e) => setBillIsFixed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="billIsFixed" className="text-xs text-slate-300">
                Ã‰ uma conta fixa mensal (recorrente)?
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !billAmount || !billTitle}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]"
            >
              {loading ? 'Salvando...' : 'Salvar Conta'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};