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
  CalendarClock,
  Filter,
  Zap
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

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* CONTROLES SUPERIORES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Exibir:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Todas ({bills.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === 'pending' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/40' : 'text-slate-400 hover:text-amber-400'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === 'paid' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            Pagas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateFromTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/50 text-xs font-medium transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Gerar Contas do Mês</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('bill')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            + Nova Conta
          </button>
        </div>
      </div>

      {/* CONTAINER PRINCIPAL DAS CONTAS */}
      <div className="glass-card rounded-2xl border-slate-800 overflow-hidden">
        
        {/* Header da Tabela/Lista */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Checklist de Contas & Compromissos</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold">Pago: {formatCurrency(totalPaid)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">Pendente: {formatCurrency(totalPending)}</span>
          </div>
        </div>

        {/* LISTA DE CONTAS */}
        <div className="divide-y divide-slate-800/50">
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                className={`group flex items-center justify-between p-4 transition-all ${
                  bill.status === 'paid'
                    ? 'bg-slate-900/30 hover:bg-slate-900/50'
                    : 'bg-slate-900/60 hover:bg-slate-800/80'
                }`}
              >
                {/* Lado Esquerdo: Check, Info */}
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => onToggleStatus(bill.id, bill.status)}
                    className="shrink-0 p-1 -ml-1 text-slate-500 hover:scale-110 transition active:scale-95"
                    title={bill.status === 'paid' ? 'Desmarcar' : 'Marcar como Pago'}
                  >
                    {bill.status === 'paid' ? (
                      <CheckSquare className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    ) : (
                      <Circle className="w-6 h-6 hover:text-emerald-400" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-bold ${bill.status === 'paid' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {bill.title}
                      </h4>
                      {getStatusBadge(bill)}
                      {bill.is_fixed && <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-700">Fixo</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Receipt className="w-3 h-3" /> {bill.category}</span>
                      <span className="flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" />
                        Venc: <strong className={bill.status === 'pending' && bill.due_date <= today ? 'text-red-400' : 'text-slate-400'}>
                          {formatDate(bill.due_date)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Valor, Acoes */}
                <div className="flex items-center gap-4 pl-4 shrink-0">
                  {editingId === bill.id ? (
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      className="w-24 bg-slate-950 text-white text-sm font-bold px-2 py-1.5 rounded border border-emerald-500 focus:outline-none shadow-inner"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onBlur={() => handleSaveEdit(bill.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(bill.id)}
                    />
                  ) : (
                    <span
                      onClick={() => bill.status === 'pending' && handleStartEdit(bill)}
                      className={`text-base font-extrabold cursor-text ${
                        bill.status === 'paid' ? 'text-slate-600' : 'text-white hover:text-emerald-300 transition'
                      }`}
                      title={bill.status === 'pending' ? 'Clique para editar o valor' : ''}
                    >
                      {formatCurrency(bill.amount)}
                    </span>
                  )}

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
            <div className="p-8 text-center text-sm text-slate-400 space-y-2">
              <p>Nenhuma conta cadastrada para este mês.</p>
              {filter === 'all' && (
                <button
                  onClick={onGenerateFromTemplates}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  ⚡ Importar Modelos Recorrentes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};