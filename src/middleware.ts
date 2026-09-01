import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Ignora arquivos estáticos e _next
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/manifest.json')
  ) {
    return NextResponse.next();
  }

  const isLoginPage = request.nextUrl.pathname === '/login';
  const sessionCookie = request.cookies.get('session')?.value;
  let payload = null;

  if (sessionCookie) {
    try {
      payload = await decrypt(sessionCookie);
    } catch (e) {
      // Token inválido
    }
  }

  // Se não estiver logado e tentar acessar rota protegida
  if (!payload && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver logado e tentar acessar o login, redireciona para a home
  if (payload && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Proteção da rota de Admin
  if (request.nextUrl.pathname.startsWith('/admin') && payload?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return await updateSession(request) || NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
