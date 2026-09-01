'use server';

import { pool } from '@/lib/postgres';
import { getSession } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Não autorizado');
  }
}

export async function getUsers() {
  await requireAdmin();
  try {
    const res = await pool.query('SELECT id, username, role, is_active, created_at FROM users ORDER BY created_at DESC');
    return res.rows;
  } catch (error) {
    console.error('getUsers error', error);
    return [];
  }
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || 'user';

  if (!username || !password) {
    return { error: 'Usuário e senha são obrigatórios.' };
  }

  try {
    // Verifica se já existe
    const exist = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (exist.rows.length > 0) {
      return { error: 'Usuário já existe.' };
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', [username, hash, role]);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('createUser error', error);
    return { error: 'Erro ao criar usuário no banco.' };
  }
}

export async function toggleUserStatus(id: string, currentStatus: boolean) {
  await requireAdmin();
  try {
    const session = await getSession();
    const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userRes.rows.length > 0 && userRes.rows[0].username === session?.username) {
      return { error: 'Não é possível desativar o próprio usuário administrador.' };
    }

    await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [!currentStatus, id]);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('toggleUserStatus error', error);
    return { error: 'Erro ao alterar status do usuário.' };
  }
}

export async function deleteUser(id: string) {
  await requireAdmin();
  try {
    const session = await getSession();
    const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userRes.rows.length > 0 && userRes.rows[0].username === session?.username) {
      return { error: 'Não é possível excluir o próprio usuário administrador.' };
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('deleteUser error', error);
    return { error: 'Erro ao excluir usuário.' };
  }
}
