'use client';

import { useSearchParams } from 'next/navigation';
import { HeroBold } from './hero-bold';
import { HeroConservative } from './hero-conservative';
import { HeroStandard } from './hero-standard';

export type HeroVariant = 'bold' | 'conservative' | 'standard';

export function HeroSwitch({ fallback = 'bold' }: { fallback?: HeroVariant }) {
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as HeroVariant) || fallback;

  switch (variant) {
    case 'conservative':
      return <HeroConservative />;
    case 'standard':
      return <HeroStandard />;
    default:
      return <HeroBold />;
  }
}
