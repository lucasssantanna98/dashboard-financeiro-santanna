'use client';

import React, { useState } from 'react';
import { X, CalendarRange, Sparkles, CheckCircle } from 'lucide-react';
import { IncomeSource, Person } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface WeeklyBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthYear: string;
  onSaveBatch: (
    monthYear: string,
    weekNumber: number,
    entries: Array<{ source: IncomeSource; person: Person; amount: number; notes?: string }>
  ) => Promise<void>;
}

export const WeeklyBatchModal: React.FC<WeeklyBatchModalProps> = ({
  isOpen,
  onClose,
  currentMonthYear,
  onSaveBatch,
}) => {
  const [week, setWeek] = useState(1);
  const [uber, setUber] = useState('');
  const [studioLash, setStudioLash] = useState('');
  const [cm, setCm] = useState('');
  const [sc, setSc] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const parseVal = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const totalWeek = parseVal(uber) + parseVal(studioLash) + parseVal(cm) + parseVal(sc);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeek <= 0) return;

    setLoading(true);
    try {
      const entries: Array<{ source: IncomeSource; person: Person; amount: number; notes?: string }> = [
        { source: 'UBER_99', person: 'Lucas', amount: parseVal(uber), notes: `Semana ${week}` },
        { source: 'STUDIO_LASH', person: 'Esposa', amount: parseVal(studioLash), notes: `Semana ${week}` },
        { source: 'CM', person: 'Esposa', amount: parseVal(cm), notes: `Semana ${week}` },
        { source: 'SC', person: 'Esposa', amount: parseVal(sc), notes: `Semana ${week}` },
      ];

      await onSaveBatch(currentMonthYear, week, entries);

      setUber('');
      setStudioLash('');
      setCm('');
      setSc('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-950/80 border border-pink-800/40 text-pink-400">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Fechamento Semanal em Lote
              </h2>
              <p className="text-xs text-slate-400">
                Preencha todos os ganhos da semana de uma sÃ³ vez
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

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          
          {/* Seletor de Semana */}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              Escolha a Semana do MÃªs:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeek(w)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    week === w
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Semana {w}
                </button>
              ))}
            </div>
          </div>

          {/* Ganhos Lucas */}
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Lucas (Semana {week})
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 flex items-center gap-1.5">
                <span>ðŸš— Uber / 99:</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={uber}
                  onChange={(e) => setUber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Ganhos Esposa */}
          <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-900/40 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                Esposa (Semana {week})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">
                  ðŸ‘ï¸ Studio Lash:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={studioLash}
                    onChange={(e) => setStudioLash(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">
                  ðŸ’… CM:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={cm}
                    onChange={(e) => setCm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 mb-1 block">
                  ðŸ’Ž SC:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={sc}
                    onChange={(e) => setSc(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Totalizador em Tempo Real */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Total da Semana {week}:
            </span>
            <span className="text-base font-extrabold text-cyan-300">
              {formatCurrency(totalWeek)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || totalWeek <= 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition active:scale-[0.98]"
          >
            {loading ? 'Gravando...' : `Salvar Fechamento da Semana ${week}`}
          </button>
        </form>

      </div>
    </div>
  );
};