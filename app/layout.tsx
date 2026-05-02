import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { KSWThemeProvider } from '@/components/ksw/theme-provider';

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_SITE_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

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
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION
      ? { other: { 'naver-site-verification': NAVER_SITE_VERIFICATION } }
      : {}),
  },
};

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? 'pub-7668661264696899';
const ADSENSE_CLIENT = ADSENSE_PUB_ID.startsWith('pub-') ? `ca-${ADSENSE_PUB_ID}` : null;

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KStoryWorld',
  alternateName: '케이스토리월드',
  url: 'https://kstoryworld.com',
  logo: 'https://kstoryworld.com/design-assets/logo.png',
  sameAs: ['https://kstoryworld.com'],
};

const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'KStoryWorld',
  url: 'https://kstoryworld.com',
  inLanguage: ['ko', 'en'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-season="winter" className="h-full antialiased">
      <body className="min-h-full flex flex-col" data-dark="false">
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        {ADSENSE_CLIENT ? (
          <Script
            id="adsense-auto-ads"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="beforeInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
        <KSWThemeProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </KSWThemeProvider>
      </body>
    </html>
  );
}
