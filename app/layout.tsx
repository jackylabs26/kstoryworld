import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { KSWThemeProvider } from '@/components/ksw/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://kstoryworld.com'),
  title: {
    default: 'KStoryWorld — K-Drama Reviews & Guides',
    template: '%s | KStoryWorld',
  },
  description:
    'Discover the world of K-Drama. In-depth reviews, character analysis, and hidden gem recommendations in Korean and English.',
  keywords: [
    'K-Drama',
    'Korean Drama',
    'K-Drama Review',
    'K-Drama Guide',
    'K-Pop',
    'K-Food',
    'K-Beauty',
    'K-Literature',
    '한국 드라마',
    'K-드라마 리뷰',
  ],
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: 'KStoryWorld — K-Drama Reviews & Guides',
    description: 'Your ultimate destination for K-Drama reviews, guides, and recommendations.',
    url: 'https://kstoryworld.com',
    siteName: 'KStoryWorld',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KStoryWorld — K-Drama Reviews & Guides',
    description: 'Your ultimate destination for K-Drama reviews, guides, and recommendations.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-season="winter" className="h-full antialiased">
      <body className="min-h-full flex flex-col" data-dark="false">
        <KSWThemeProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </KSWThemeProvider>
      </body>
    </html>
  );
}
