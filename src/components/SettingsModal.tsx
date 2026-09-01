'use client';

import React, { useState } from 'react';
import { X, Settings2, Plus, Trash2, Save } from 'lucide-react';
import { Person } from '@/types';
import { updateUserNames, addIncomeSource, deleteIncomeSource } from '@/lib/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  person1Name: string;
  person2Name: string;
  incomeSources: { id: string; name: string; person: Person }[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  person1Name: initialP1,
  person2Name: initialP2,
  incomeSources
}) => {
  const [person1Name, setPerson1Name] = useState(initialP1);
  const [person2Name, setPerson2Name] = useState(initialP2);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourcePerson, setNewSourcePerson] = useState<Person>('person1');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveNames = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateUserNames(person1Name, person2Name);
    setLoading(false);
    onSuccess();
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    setLoading(true);
    await addIncomeSource(newSourceName, newSourcePerson);
    setNewSourceName('');
    setLoading(false);
    onSuccess();
  };

  const handleDeleteSource = async (id: string) => {
    setLoading(true);
    await deleteIncomeSource(id);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-cyan-400" />
              Configurações
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Personalize o painel para você.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition bg-slate-900 rounded-full border border-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          
          {/* Sessão de Nomes */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Nomes do Casal</h3>
            <form onSubmit={handleSaveNames} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pessoa 1 (Principal)</label>
                  <input
                    type="text"
                    required
                    value={person1Name}
                    onChange={(e) => setPerson1Name(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pessoa 2 (Cônjuge)</label>
                  <input
                    type="text"
                    required
                    value={person2Name}
                    onChange={(e) => setPerson2Name(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-medium text-xs rounded-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Nomes
              </button>
            </form>
          </section>

          {/* Sessão de Fontes de Renda */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Fontes de Renda</h3>
            
            <form onSubmit={handleAddSource} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                placeholder="Ex: Salário Empresa X"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newSourcePerson}
                onChange={(e) => setNewSourcePerson(e.target.value as Person)}
                className="w-32 px-2 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="person1">{person1Name}</option>
                <option value="person2">{person2Name}</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {incomeSources.length === 0 ? (
                <p className="text-xs text-slate-500 text-center italic py-4">Nenhuma fonte cadastrada.</p>
              ) : (
                incomeSources.map(src => {
                  const pDisplay = src.person === 'person1' ? person1Name : person2Name;
                  return (
                    <div key={src.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg group">
                      <div>
                        <p className="text-sm font-bold text-slate-200 leading-none">{src.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase">{pDisplay}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSource(src.id)}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
