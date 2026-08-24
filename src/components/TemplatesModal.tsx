'use client';

import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Plus, Trash2, Check } from 'lucide-react';
import { BillTemplate } from '@/types';
import { fetchBillTemplates, saveBillTemplate } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Moradia');
  const [defaultAmount, setDefaultAmount] = useState('');
  const [dueDay, setDueDay] = useState('10');
  const [isFixed, setIsFixed] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBillTemplates().then(setTemplates);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const created = await saveBillTemplate({
        name: name.trim(),
        category,
        default_amount: parseFloat(defaultAmount.replace(',', '.')) || 0,
        due_day: parseInt(dueDay, 10) || 10,
        is_fixed: isFixed,
        active: true,
      });

      setTemplates((prev) => [...prev, created]);
      setName('');
      setDefaultAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Modelos de Contas Recorrentes
              </h2>
              <p className="text-xs text-slate-400">
                Contas que se repetem todo mÃªs (Aluguel, Luz, Internet, etc.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Lista de Modelos Existentes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Modelos Ativos:
            </label>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-100">{tpl.name}</span>
                    <div className="text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{tpl.category}</span>
                      <span>&bull;</span>
                      <span>Vence dia {tpl.due_day}</span>
                      <span>&bull;</span>
                      <span className={tpl.is_fixed ? 'text-sky-400' : 'text-amber-400'}>
                        {tpl.is_fixed ? 'Fixo' : 'VariÃ¡vel'}
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-slate-200">
                    {formatCurrency(tpl.default_amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Novo Modelo */}
          <form onSubmit={handleAddTemplate} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              + Cadastrar Novo Modelo
            </span>

            <div>
              <input
                type="text"
                required
                placeholder="Nome da conta (ex: Academia, Seguro Carro)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Transporte">Transporte</option>
                  <option value="AlimentaÃ§Ã£o">AlimentaÃ§Ã£o</option>
                  <option value="ServiÃ§os">ServiÃ§os</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="SaÃºde">SaÃºde</option>
                </select>
              </div>

              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor padrÃ£o"
                  value={defaultAmount}
                  onChange={(e) => setDefaultAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Dia venc."
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700"
                />
                Valor Fixo todo mÃªs
              </label>

              <button
                type="submit"
                disabled={loading || !name}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition"
              >
                {loading ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};