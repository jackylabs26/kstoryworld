import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KStoryWorld Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
