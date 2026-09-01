import React from 'react';
import { getUsers, createUser, toggleUserStatus, deleteUser } from './actions';
import { ShieldCheck, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-cyan-400 w-8 h-8" />
              Painel de Administração
            </h1>
            <p className="text-slate-400 mt-2">Gerencie os usuários do sistema.</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form Novo Usuário */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="text-sky-400" />
              Novo Usuário
            </h2>
            <form action={async (formData) => {
              'use server';
              await createUser(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome de Usuário</label>
                <input required name="username" type="text" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Senha</label>
                <input required name="password" type="password" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Permissão</label>
                <select name="role" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none">
                  <option value="user">Usuário Padrão</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors mt-4">
                Criar Usuário
              </button>
            </form>
          </div>

          {/* Lista de Usuários */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Usuários Cadastrados ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Papel (Role)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Data de Criação</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-medium text-white">{user.username}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700/50 text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={async () => {
                            'use server';
                            await toggleUserStatus(user.id, user.is_active);
                          }}>
                            <button type="submit" className={`text-xs px-3 py-1 rounded border transition-colors ${user.is_active ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}>
                              {user.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                          </form>
                          
                          <form action={async () => {
                            'use server';
                            await deleteUser(user.id);
                          }}>
                            <button type="submit" className="text-xs px-3 py-1 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
                              Excluir
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
