'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

type LoginResult = { error: string | null };

export async function sendMagicLink(_: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { error: '이메일을 입력해 주세요.' };

  const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? 'jackylabs26@gmail.com')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    return { error: '허용되지 않은 관리자 이메일입니다.' };
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient({
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    set: (name, value, options) => cookieStore.set(name, value, options),
  });

  const hdrs = await headers();
  const origin = hdrs.get('origin') ?? process.env.NEXT_PUBLIC_ADMIN_SITE_URL ?? 'http://localhost:3000';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error) return { error: error.message };

  redirect('/login?sent=1');
}
