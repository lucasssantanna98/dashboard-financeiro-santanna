'use server';

import { pool } from '@/lib/postgres';
import { loginSession, logoutSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import * as bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Usuário e senha são obrigatórios.' };
  }

  try {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = res.rows[0];

    if (!user) {
      return { error: 'Credenciais inválidas.' };
    }

    if (user.is_active === false) {
      return { error: 'Sua conta foi desativada pelo administrador.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return { error: 'Credenciais inválidas.' };
    }

    // Criar sessão segura
    await loginSession(user.id, user.username, user.role);
    
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Ocorreu um erro no servidor.' };
  }

  // Redireciona para o painel principal após login bem sucedido
  redirect('/');
}

export async function logout() {
  await logoutSession();
  redirect('/login');
}

export async function getClientSession() {
  const session = await getSession();
  if (!session) return null;
  return { username: session.username, role: session.role };
}
