'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Copy, 
  CheckSquare, 
  Receipt,
  ListTodo,
  CalendarClock
} from 'lucide-react';
import { MonthlyBill, BillStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BillsSectionProps {
  bills: MonthlyBill[];
  currentMonthYear: string;
  onToggleStatus: (id: string, currentStatus: BillStatus) => Promise<void>;
  onUpdateAmount: (id: string, amount: number) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onGenerateFromTemplates: () => Promise<void>;
  onOpenQuickAdd: (tab?: 'income' | 'bill') => void;
}

export const BillsSection: React.FC<BillsSectionProps> = ({
  bills,
  onToggleStatus,
  onUpdateAmount,
  onDeleteBill,
  onGenerateFromTemplates,
  onOpenQuickAdd,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const sortedBills = [...bills].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return a.due_date.localeCompare(b.due_date);
  });

  const filteredBills = sortedBills.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleStartEdit = (bill: MonthlyBill) => {
    setEditingId(bill.id);
    setEditAmount(bill.amount.toString());
  };

  const handleSaveEdit = async (id: string) => {
    const num = parseFloat(editAmount.replace(',', '.'));
    if (!isNaN(num) && num >= 0) {
      await onUpdateAmount(id, num);
    }
    setEditingId(null);
  };

  const getStatusBadge = (bill: MonthlyBill) => {
    if (bill.status === 'paid') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Pago
        </span>
      );
    }
    
    if (bill.due_date < today) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
          Vencido
        </span>
      );
    }

    if (bill.due_date === today) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          Vence Hoje
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
        A vencer
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DE ACOES E FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-900/30 text-amber-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Checklist de Contas & Compromissos</h3>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setFilter('all')}
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md transition ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md transition ${filter === 'pending' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/40' : 'text-slate-400 hover:text-amber-400'}`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md transition ${filter === 'paid' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' : 'text-slate-400 hover:text-emerald-400'}`}
              >
                Pagas
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateFromTemplates}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/30 text-xs font-medium transition whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            Gerar Contas do MÃªs
          </button>
          <button
            onClick={() => onOpenQuickAdd('bill')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition whitespace-nowrap"
          >
            + Nova Conta
          </button>
        </div>
      </div>

      {/* LISTA DE CONTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.length > 0 ? (
          filteredBills.map((bill) => (
            <div
              key={bill.id}
              className={`group flex flex-col p-4 rounded-2xl border transition-all ${
                bill.status === 'paid'
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : 'bg-slate-900/80 border-slate-700 shadow-sm hover:border-slate-600'
              }`}
            >
              {/* Header do Card (Titulo e Badge) */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(bill)}
                  </div>
                  <h4 className={`text-sm font-bold truncate ${bill.status === 'paid' ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {bill.title}
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Receipt className="w-3 h-3" /> {bill.category}
                    {bill.is_fixed && <span className="ml-1 px-1 bg-slate-800 rounded text-[9px] uppercase">Fixa</span>}
                  </div>
                </div>

                {/* Botao de Checkmark */}
                <button
                  onClick={() => onToggleStatus(bill.id, bill.status)}
                  className="p-1 -mr-1 -mt-1 text-slate-500 hover:scale-110 transition active:scale-95"
                  title={bill.status === 'paid' ? 'Desmarcar' : 'Marcar como Pago'}
                >
                  {bill.status === 'paid' ? (
                    <CheckSquare className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  ) : (
                    <Circle className="w-6 h-6 hover:text-emerald-400" />
                  )}
                </button>
              </div>

              {/* Informacoes Inferiores (Valor, Data, Acoes) */}
              <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
                
                <div className="flex flex-col">
                  {editingId === bill.id ? (
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      className="w-24 bg-slate-800 text-white text-sm font-bold px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onBlur={() => handleSaveEdit(bill.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(bill.id)}
                    />
                  ) : (
                    <span
                      onClick={() => bill.status === 'pending' && handleStartEdit(bill)}
                      className={`text-lg font-extrabold cursor-text ${
                        bill.status === 'paid' ? 'text-slate-500' : 'text-white hover:text-emerald-300 transition'
                      }`}
                      title={bill.status === 'pending' ? 'Clique para editar o valor' : ''}
                    >
                      {formatCurrency(bill.amount)}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    Venc: <strong className={bill.status === 'pending' && bill.due_date <= today ? 'text-red-400' : 'text-slate-300'}>
                      {formatDate(bill.due_date)}
                    </strong>
                  </span>
                </div>

                {/* Excluir Botao */}
                <button
                  onClick={() => onDeleteBill(bill.id)}
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-500 hover:text-red-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <Receipt className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="text-sm">Nenhuma conta cadastrada para este mÃªs.</p>
          </div>
        )}
      </div>

    </div>
  );
};