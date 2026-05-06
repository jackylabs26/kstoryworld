# Hexagon Images

Each hexagon gets a subdirectory: `public/images/hexagons/<hexagon_id>/`

## Naming convention

```
<source>-<asset_id>.webp
```

Examples:
- `unsplash-abc123xyz.webp`
- `pexels-12345678.webp`
- `pixabay-9876543.webp`

## Hero image spec

- Dimensions: 1200×630 (OG image compatible)
- Format: WebP (primary), PNG fallback acceptable
- Quality: 80–85% WebP compression

## Credits sidecar

Every directory with images must contain `_credits.json`:

```json
[
  {
    "filename": "unsplash-abc123xyz.webp",
    "role": "hero",
    "source": "unsplash",
    "asset_id": "abc123xyz",
    "license": "unsplash-license",
    "credit": "Photo by Jane Doe on Unsplash",
    "alt_text_ko": "서울 야경",
    "alt_text_en": "Seoul night skyline"
  }
]
```

Required fields: `filename`, `source`, `credit`, `license`.

## CI validation

`npm run check:image-credits` warns if any image file lacks a credit entry.
