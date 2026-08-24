'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Check, 
  Zap, 
  AlertCircle, 
  Clock, 
  Plus, 
  Filter
} from 'lucide-react';
import { MonthlyBill, BillStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BillsSectionProps {
  bills: MonthlyBill[];
  currentMonthYear: string;
  onToggleStatus: (id: string, currentStatus: BillStatus) => Promise<void>;
  onUpdateAmount: (id: string, newAmount: number) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onGenerateFromTemplates: () => Promise<void>;
  onOpenQuickAdd: (tab?: 'income' | 'bill') => void;
}

export const BillsSection: React.FC<BillsSectionProps> = ({
  bills,
  currentMonthYear,
  onToggleStatus,
  onUpdateAmount,
  onDeleteBill,
  onGenerateFromTemplates,
  onOpenQuickAdd,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'paid'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [generating, setGenerating] = useState(false);

  const filteredBills = bills.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  const total = bills.reduce((sum, b) => sum + Number(b.amount), 0);
  const paidTotal = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
  const pendingTotal = total - paidTotal;

  const handleStartEdit = (b: MonthlyBill) => {
    setEditingId(b.id);
    setEditValue(String(b.amount));
  };

  const handleSaveEdit = async (id: string) => {
    const val = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      await onUpdateAmount(id, val);
    }
    setEditingId(null);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateFromTemplates();
    } finally {
      setGenerating(false);
    }
  };

  const getDueStatus = (dueDate: string, status: BillStatus) => {
    if (status === 'paid') return { label: 'Pago', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' };
    
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      return { label: 'Vencido', color: 'text-rose-400 bg-rose-950/60 border-rose-800/40 font-bold' };
    }
    if (dueDate === today) {
      return { label: 'Vence Hoje', color: 'text-amber-400 bg-amber-950/60 border-amber-800/40 font-bold' };
    }
    return { label: 'A vencer', color: 'text-slate-400 bg-slate-900 border-slate-800' };
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros e AÃ§Ãµes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Exibir:
          </span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({bills.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'paid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Pagas
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/50 text-xs font-medium transition"
          >
            <Zap className={`w-3.5 h-3.5 ${generating ? 'animate-bounce' : ''}`} />
            <span>Gerar Contas do MÃªs</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('bill')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
          >
            + Nova Conta
          </button>
        </div>

      </div>

      {/* Lista de Contas (Checklist Inteligente) */}
      <div className="glass-card rounded-2xl border-slate-800 overflow-hidden">
        
        {/* Top Summary Bar */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">
            Checklist de Contas & Compromissos
          </span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold">
              Pago: {formatCurrency(paidTotal)}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-amber-400 font-semibold">
              Pendente: {formatCurrency(pendingTotal)}
            </span>
          </div>
        </div>

        {filteredBills.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {filteredBills.map((bill) => {
              const dueInfo = getDueStatus(bill.due_date, bill.status);
              const isEditing = editingId === bill.id;

              return (
                <div
                  key={bill.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    bill.status === 'paid' ? 'bg-slate-950/30' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Checkbox e TÃ­tulo */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleStatus(bill.id, bill.status)}
                      className="text-slate-500 hover:text-emerald-400 transition"
                      title={bill.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                    >
                      {bill.status === 'paid' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${bill.status === 'paid' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {bill.title}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          {bill.category}
                        </span>
                        {bill.is_fixed ? (
                          <span className="text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800/30 px-1.5 py-0.2 rounded">
                            Fixo
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/30 px-1.5 py-0.2 rounded">
                            VariÃ¡vel
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>Vencimento: {formatDate(bill.due_date)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dueInfo.color}`}>
                          {dueInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Valor e EdiÃ§Ã£o RÃ¡pida */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(bill.id)}
                          className="w-24 px-2 py-1 bg-slate-900 border border-emerald-500 rounded-lg text-white font-bold text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(bill.id)}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-extrabold ${bill.status === 'paid' ? 'text-slate-400' : 'text-white'}`}>
                          {formatCurrency(bill.amount)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(bill)}
                          title="Editar valor rÃ¡pido (Luz, Ãgua, CartÃ£o...)"
                          className="p-1 text-slate-500 hover:text-cyan-400 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      title="Excluir conta do mÃªs"
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400 space-y-2">
            <p>Nenhuma conta cadastrada para este mÃªs.</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
            >
              âš¡ Importar Modelos Recorrentes
            </button>
          </div>
        )}

      </div>

    </div>
  );
};