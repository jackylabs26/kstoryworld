import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
    set: (name, value, options) => response.cookies.set({ name, value, ...options }),
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const isLoginPage = pathname === '/login';
  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!login|auth/callback|_next|favicon).*)'],
};
