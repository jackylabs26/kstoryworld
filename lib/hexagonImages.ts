// Hexagon image path helpers — JAC-2050.
// Resolves local image paths for the static export and provides the
// _credits.json schema type for consumers.

import type { ImageSource, SeasonalTone, HexagonImageRole } from './hexagonCredits';

export interface ImageCreditEntry {
  filename: string;
  role: HexagonImageRole;
  source: ImageSource;
  asset_id: string;
  license: string;
  credit: string;
  seasonal_tone?: SeasonalTone;
  alt_text_ko: string;
  alt_text_en: string;
}

export function hexagonImageDir(hexagonId: string): string {
  return `/images/hexagons/${hexagonId}`;
}

export function hexagonImagePath(hexagonId: string, filename: string): string {
  return `/images/hexagons/${hexagonId}/${filename}`;
}

export function heroImageFilename(source: ImageSource, assetId: string): string {
  return `${source}-${assetId}.webp`;
}
