'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { BillTemplate } from '@/types';
import { fetchBillTemplates, createBillTemplate, deleteBillTemplate, updateBillTemplate } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Moradia');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [isFixed, setIsFixed] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const data = await fetchBillTemplates();
    setTemplates(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!name || isNaN(numAmount) || numAmount < 0) return;

    setLoading(true);
    await createBillTemplate({
      name,
      category,
      default_amount: numAmount,
      due_day: parseInt(dueDay, 10),
      is_fixed: isFixed,
      active: true,
    });
    
    setAdding(false);
    setName('');
    setAmount('');
    await loadTemplates();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover este modelo recorrente?')) {
      await deleteBillTemplate(id);
      await loadTemplates();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Modelos de Contas Recorrentes
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie as contas que se repetem todos os meses.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Modelos (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3 min-h-[300px]">
          {templates.map((tpl) => (
            <div key={tpl.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {tpl.name}
                  {tpl.is_fixed ? (
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 uppercase tracking-widest">Valor Fixo</span>
                  ) : (
                    <span className="text-[9px] bg-amber-950/60 text-amber-500 border border-amber-900/40 px-1.5 py-0.5 rounded uppercase tracking-widest">Valor VariÃ¡vel</span>
                  )}
                </h4>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                  <span>{tpl.category}</span>
                  <span>&bull; Vence dia {tpl.due_day}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-emerald-400">
                  {tpl.is_fixed ? formatCurrency(tpl.default_amount) : `MÃ©dia: ${formatCurrency(tpl.default_amount)}`}
                </span>
                <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {templates.length === 0 && !adding && (
            <div className="text-center py-10 text-slate-500 text-sm italic">
              Nenhum modelo cadastrado. Adicione um novo para automatizar.
            </div>
          )}
        </div>

        {/* Footer Actions (Novo Modelo) */}
        <div className="pt-4 border-t border-slate-800 shrink-0">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
            >
              <PlusCircle className="w-4 h-4" /> Cadastrar Novo Modelo
            </button>
          ) : (
            <form onSubmit={handleSave} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Nome</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white">
                    <option>Moradia</option>
                    <option>Transporte</option>
                    <option>AlimentaÃ§Ã£o</option>
                    <option>ServiÃ§os</option>
                    <option>Financeiro</option>
                    <option>SaÃºde</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dia do Vencimento</label>
                  <input type="number" min="1" max="31" required value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor Base (R$)</label>
                  <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} id="tFixed" className="rounded" />
                  <label htmlFor="tFixed" className="text-xs text-slate-300">Valor Fixo</label>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 font-semibold">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 rounded-lg text-sm text-white font-semibold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Modelo
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};