'use client';

import React, { useState } from 'react';
import { X, CalendarRange, Save } from 'lucide-react';
import { Person } from '@/types';
import { createIncome } from '@/lib/db';

interface WeeklyBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMonthYear: string;
  incomeSources: { id: string; name: string; person: Person }[];
  person1Name: string;
  person2Name: string;
}

export const WeeklyBatchModal: React.FC<WeeklyBatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentMonthYear,
  incomeSources,
  person1Name,
  person2Name
}) => {
  const [week, setWeek] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Valores dinâmicos
  const [values, setValues] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    for (const [sourceName, valStr] of Object.entries(values)) {
      const val = parseFloat(valStr.replace(',', '.'));
      if (!isNaN(val) && val > 0) {
        const srcObj = incomeSources.find(s => s.name === sourceName);
        await createIncome({
          source_code: sourceName,
          person: srcObj?.person || 'person1',
          amount: val,
          date,
          week_number: week,
          month_year: currentMonthYear,
        });
      }
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarRange className="w-6 h-6 text-cyan-400" />
              Fechamento Semanal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Registre a renda de todas as fontes semanais de uma só vez.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition bg-slate-900 rounded-full border border-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Data do Fechamento</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Semana do Mês</label>
              <select
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
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

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">Entradas da Semana</h3>
            
            {incomeSources.map(src => {
              const personDisplay = src.person === 'person1' ? person1Name : person2Name;
              const colorClass = src.person === 'person1' ? 'text-sky-400' : 'text-pink-400';
              const inputFocusClass = src.person === 'person1' ? 'focus:border-sky-500' : 'focus:border-pink-500';

              return (
                <div key={src.id} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-slate-200">{src.name}</span>
                    <span className={`text-[10px] font-semibold uppercase ${colorClass}`}>{personDisplay}</span>
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-semibold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={values[src.name] || ''}
                      onChange={e => setValues({ ...values, [src.name]: e.target.value })}
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:outline-none ${inputFocusClass}`}
                    />
                  </div>
                </div>
              );
            })}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/50 transition-all flex justify-center items-center gap-2"
          >
            {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Fechamento da Semana {week}</>}
          </button>
        </form>
      </div>
    </div>
  );
};