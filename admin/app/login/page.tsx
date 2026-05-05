'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { sendMagicLink } from './actions';

const initialState = { error: null as string | null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Admin 로그인</h1>
      <p className="mt-2 text-sm text-stone-600">관리자 승인 이메일로 매직 링크를 전송합니다.</p>

      <form action={formAction} className="mt-6 space-y-3 rounded border border-stone-200 bg-white p-4">
        <label className="block text-sm text-stone-700" htmlFor="email">관리자 이메일</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900"
          placeholder="admin@kstoryworld.com"
        />

        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-stone-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? '전송 중...' : '매직 링크 보내기'}
        </button>
      </form>

      <p className="mt-5 text-xs text-stone-500">
        로그인 메일이 왔다면 링크를 열어 인증을 완료하세요. 인증 후 <Link href="/" className="underline">/</Link> 으로 이동합니다.
      </p>
    </main>
  );
}
