import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — KStoryWorld',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
        관리자 페이지 — 게재 전 검토용. 외부 공유 금지.
      </div>
      {children}
    </div>
  );
}
