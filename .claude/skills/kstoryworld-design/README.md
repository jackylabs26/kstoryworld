# KStoryWorld Design System

> **K-스토리월드** — A Korean storytelling and content platform. The design system blends Together AI's pastel-gradient + sharp-typography aesthetic with the color rhythms of Korea's four seasons (봄·여름·가을·겨울).

---

## Brand Snapshot

KStoryWorld is a storytelling-led brand: Korean folk tales, K-drama narratives, K-pop documentaries, K-culture explorers, and modern Korean voices, all under one roof. The platform sits between **enterprise-clean infrastructure** (think: hosted catalog, partner network, data dashboards) and **emotional, human storytelling** (think: literary, cinematic, atmospheric).

The visual language is built on three pillars:

1. **Together AI's geometry & type discipline** — sharp 4px corners, "The Future" display, PP Neue Montreal Mono labels, midnight-blue dark mode (`#010120`).
2. **Korean four-seasons (사계, 사계절) palette** — soft seasonal pastels (cherry-blossom pink for 봄, ocean teal for 여름, persimmon ochre for 가을, deep-snow indigo for 겨울) layered over white canvas.
3. **Editorial restraint** — generous whitespace, mono labels as signposts, oversized stats and oversized hangul wordmarks as closing brand moments.

## Sources & inputs

- **Brand brief**: provided by user, paraphrased from a Together AI–inspired spec.
- **Cultural research**: K-storytelling tradition (p'ansori, K-drama emotional grammar), Korean color symbolism around the seasons.
- **No codebase, no Figma**: design is generated from spec only. Imagery uses pastel-cloud illustrations + Korean-season gradients (no real photography sourced).

> ⚠ **Caveat**: We did not have access to a real KStoryWorld codebase or Figma file. The system below is a fresh interpretation. Replace logos, illustrations, and copy with the real ones when available.

---

## MULTILINGUAL SUPPORT (i18n · 다국어)

KStoryWorld is a **multilingual-first platform**. Every screen must support at minimum these eight languages, and copy/typography must be designed so any of them can be the primary surface:

| Code | Language     | Native        | Notes |
|------|--------------|---------------|-------|
| `ko` | Korean       | 한국어         | Source language. Hangul-first display. |
| `en` | English      | English       | Default international. |
| `ja` | Japanese     | 日本語         | Mixed kanji/kana; vertical mode optional. |
| `zh-Hans` | Chinese (Simplified) | 简体中文 | Mainland market. |
| `zh-Hant` | Chinese (Traditional) | 繁體中文 | Taiwan / HK. |
| `es` | Spanish      | Español       | Latin script, longer strings (~+25%). |
| `fr` | French       | Français      | Latin script, longer strings (~+15%). |
| `vi` | Vietnamese   | Tiếng Việt    | Latin + diacritics, watch line-height. |

### Type stack per locale
Every text style in `colors_and_type.css` falls back through a CJK-aware stack. The `--font-display` variable already chains Latin → Hangul → CJK fallbacks. Recommended additions per locale:

- **`ko`** Pretendard → Apple SD Gothic Neo → system Hangul
- **`ja`** Inter → Noto Sans JP → Hiragino Sans → system JP
- **`zh-Hans`** Inter → Noto Sans SC → PingFang SC → system SC
- **`zh-Hant`** Inter → Noto Sans TC → PingFang TC → system TC
- **`es` / `fr` / `vi`** Space Grotesk → Inter → system sans

> Set `<html lang="...">` and add `:lang(ko)`, `:lang(ja)`, etc. font-family overrides in `colors_and_type.css` so each locale picks the correct stack automatically.

### Layout rules for i18n
- **String budget**: design every layout assuming text can grow up to **+30%** (German/French) or **−20%** (CJK). Never hard-cap headline width to its English length.
- **Line-height**: bump to **1.45** for `vi` (diacritics), **1.30** for CJK display, **1.40** for Latin body.
- **Letter-spacing**: the negative tracking on "The Future" applies to Latin only. CJK display uses `letter-spacing: 0` — never apply negative tracking to Hangul, kana, or hanzi.
- **Mono labels**: ALL CAPS only applies to Latin. For CJK, render mono labels in their natural case but at the same size and color.
- **Bilingual pairings** (e.g. `봄 · spring`) become **trilingual or single** depending on locale. The `·` separator stays.
- **RTL**: not currently in scope, but layouts use `padding-inline` / `margin-inline` / logical properties so adding Arabic/Hebrew later requires no rework.

### Locale switcher
A locale switcher lives top-right in the header (`EN · 한국어 · 日本語 · 中文 · ES · FR · VI`). Renders as a mono-label dropdown, never a flag-icon row (flags ≠ languages).

### Translation workflow
- Source strings are **Korean (ko)**; English is the working pivot.
- Each story carries a translator credit (`Translated by …`). The same convention applies to UI strings — translators are credited in the colophon page.
- Keys live in `i18n/<locale>.json` (suggested layout, not yet built).

---

## CONTENT FUNDAMENTALS

### Voice
- **Multilingual-first**, with Korean (한글) as the source language and visual anchor (section labels, big display moments, proper nouns). On any locale, pair the local language with hangul where it adds meaning: `봄 — Spring`, `봄 — 春`, `봄 — Primavera`. Never replace hangul entirely on cultural concepts (jeong, han, p'ansori).
- **Warm, literary, slightly cinematic**. Not corporate. Not playful in a startup-mascot way.
- **First person plural ("we") for the platform**, second person ("you") for the reader. Never "I."
- Sentences are short, declarative, image-rich. Verbs do the heavy lifting.

### Casing
- **Display headlines**: sentence case. Never ALL CAPS in display.
- **Mono labels**: ALL CAPS, with positive letter-spacing — these are the only uppercase moments.
- **Buttons**: sentence case ("Read the story", "Listen now"). Never Title Case.
- **Korean text**: rendered as-is; never forced uppercase (hangul has no case).

### Tone examples
- Hero headline: *"Every Korean story, told with care."*
- Section opener: *"From p'ansori to K-drama, the thread of 정 (jeong) runs through everything."*
- CTA: *"Start with a tale →"*  /  *"이야기 시작하기 →"*
- Stat caption: *"Stories told this season"* / *"3,200+"*
- Section label (mono): `봄 / SPRING COLLECTION`

### Emoji
- **No emoji in product UI**. Hangul characters and small mono labels do the symbolic work emoji would.
- Acceptable in casual marketing email or social only.

### Vibe
Editorial, atmospheric, quietly proud. The closer cousin is *The Paris Review × Apple Newsroom × Together AI*, not *Duolingo × Memrise*.

---

## VISUAL FOUNDATIONS

### Color system

The palette has **four layers**, in this priority:

1. **Canvas** — Pure White (`#ffffff`) and Midnight Blue (`#010120`). White for business/discovery, Midnight for stories/research/footer. The light/dark duality is core.
2. **Seasonal accents (사계절)** — four pastel-led palettes, used as decorative gradients, section-mood backgrounds, and tag colors. Never UI chrome.
   - 봄 Spring: cherry-blossom pink (`#ffd6e0`) → soft peach (`#ffb7a0`) → lavender (`#bdbbff`).
   - 여름 Summer: pale sky (`#cfe9ff`) → ocean teal (`#7fd1c7`) → soft mint (`#d8f3dc`).
   - 가을 Autumn: persimmon ochre (`#f4a261`) → maple (`#e76f51`) → straw (`#f6e0b5`).
   - 겨울 Winter: snow blue (`#dbe7ff`) → ink indigo (`#3a4a7d`) → bone white (`#f4f4f7`).
3. **Brand accents** — Magenta (`#ef2cc1`) and Hanji-orange (`#fc4c02`) appear in illustrations and gradient endpoints only. **Never** as button fill or text color.
4. **Neutrals** — Pure black, pure white, `rgba(0,0,0,0.08)` borders on light, `rgba(255,255,255,0.12)` borders on dark.

### Typography
- **Display & body**: "The Future" (TTF). Sub: Inter / system Sans. **Hangul fallback**: Pretendard.
- **Mono labels**: "PP Neue Montreal Mono". Sub: JetBrains Mono. **Hangul mono fallback**: D2 Coding.
- **Negative tracking everywhere** on The Future (-1.92 → -0.16px scaled by size).
- **Mono is always uppercase** with positive tracking (+0.05–0.08px).
- **Weights**: 400 and 500 only. Never 600+.
- **Line-height tight**: 1.00 (display) → 1.30 (body).

> ⚠ **Font substitution**: We do not have "The Future" or "PP Neue Montreal Mono" license files. We've fallen back to **Space Grotesk** (display, similar geometric modernism) and **JetBrains Mono** (mono labels). Please drop the real TTFs into `fonts/` and update `colors_and_type.css` to switch back.

### Spacing
- 8px base unit. Scale: `1, 2, 4, 8, 12, 16, 20, 24, 32, 44, 48, 80, 100, 120`.
- Section vertical rhythm: 80–120px (this is non-negotiable; the open feeling is the brand).
- Card internal padding: 24–32px.
- Button/badge padding: 2px 8px (compact).

### Backgrounds
- **Light canvas + soft seasonal gradient blooms**. Gradients are abstract painterly forms (cloud, feather, brush stroke), not literal flowers or mountains.
- **Dark canvas (#010120)** is *flat* — no gradients on dark, ever. Density comes from content, not background.
- **No repeating patterns** in production UI. Hangul wordmarks at giant scale are the only "texture."

### Animation
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` (gentle ease-out). Default duration: **240ms**.
- **Fades over slides**: hover/focus is opacity + subtle Y translate (2px), never a hard color flip.
- **No bounces, no springs**. The brand feels composed, not cute.
- Page transitions: 320ms cross-fade. Image lazy-loads use 400ms blur-up.

### Hover
- Buttons: background opacity steps darker by ~12% (light) or lighter by ~8% (dark). No color hue change.
- Links: underline appears on hover (1px, 2px offset). No color change.
- Cards: shadow deepens (`rgba(1,1,32,0.16)` from `0.10`) and 2px Y lift. No scale.

### Press
- Buttons: background opacity drops one more step; **no scale-down** (keeps the sharp geometry stable). 80ms press, then 240ms release.
- Cards: lift removed; shadow returns to flat — feels like settling.

### Borders
- Light surfaces: `1px solid rgba(0, 0, 0, 0.08)`.
- Dark surfaces: `1px solid rgba(255, 255, 255, 0.12)`.
- No double borders, no inner border + shadow combos.

### Shadow / elevation
- One shadow only: `rgba(1, 1, 32, 0.10) 0px 4px 10px`. Tinted **midnight blue**, never gray.
- Hover deepens to `0.16` opacity at same offsets/blur.
- No inner shadows. No glow shadows.

### Protection gradients vs capsules
- Over photography we use a **protection gradient** (top-down `rgba(1,1,32, 0.0)` → `0.6`) for legibility on hero imagery. Not a colored overlay.
- Tag-style "capsules" are sharp 4px rectangles, not pills. We deliberately don't use pill capsules.

### Layout rules
- Max content width: **1240px**, centered, 32px gutters.
- Sticky header: 64px tall, becomes glass-blurred on scroll (`backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.72)`).
- Footer: full-bleed dark blue (`#010120`), with the giant `kstoryworld` wordmark at scale.

### Transparency & blur
- **Glass blur** is reserved for: sticky header, modal scrim, and Tweaks panel. Not in cards.
- Dark glass: `rgba(255, 255, 255, 0.12)` + 12px blur. Light glass: `rgba(255, 255, 255, 0.72)` + 12px blur.

### Imagery vibe
- **Warm, slightly desaturated, slight grain**. Korean-cinema palette: amber lamps at night, hanji-paper textures by day.
- **No B&W**. No oversaturated tourism postcards. Editorial-photo energy.
- Pastel illustrations (gradient clouds, brush strokes) for hero / decorative slots, never as iconography.

### Corner radii
- 4px — buttons, badges, tags, inputs.
- 8px — cards, modals.
- 0px — full-bleed sections, dividers.
- That's it. **No pills, no 16px, no 24px.**

### Cards
- Background: white (light) or `#010120` (dark).
- Border: `rgba(0,0,0,0.08)` (light) / `rgba(255,255,255,0.12)` (dark).
- Radius: 8px.
- Shadow: `rgba(1, 1, 32, 0.10) 0px 4px 10px`.
- Padding: 24–32px.
- Hover: shadow deepens; 2px Y lift.

---

## ICONOGRAPHY

KStoryWorld's iconography is **lean and editorial**. We do not use illustrative or filled-color icon sets.

- **Primary set**: [Lucide](https://lucide.dev) via CDN. Stroke 1.5px, 24px box. Their humanist, slightly literary stroke matches "The Future."
- **Mono symbol labels**: We often substitute icons entirely with PP Neue Montreal Mono characters (`★`, `→`, `↗`, `·`) — these read as typography, not chrome.
- **Hangul as glyph**: Section markers like `봄` `여름` `가을` `겨울` ARE the icons for season-themed surfaces. They're rendered in The Future at the size of an icon.
- **No emoji** in product UI (see CONTENT FUNDAMENTALS).
- **Brand marks**: a custom KStoryWorld wordmark (see `assets/logo-kstoryworld.svg`) and a square `K·` lockup for favicon / app icon.

> Substitution flag: Lucide is a chosen fit, not a forced one — replace with KStoryWorld's own icon library when available.

---

## INDEX / Manifest

```
README.md                  ← you are here
SKILL.md                   ← skill metadata for Claude Code / Skills
colors_and_type.css        ← design tokens + semantic CSS vars
fonts/                     ← webfont files (substituted; see flag)
assets/                    ← logos, illustrations, brand imagery
preview/                   ← per-card design-system specimens (registered)
ui_kits/
  marketing/               ← marketing site UI kit (homepage, story page)
  app/                     ← reader/app UI kit (browse, story reader)
slides/                    ← deck templates (title, comparison, big quote, etc.)
```

### UI kits
- **`ui_kits/marketing/`** — Homepage, Story Index, Story Detail. Public-facing, light canvas + seasonal gradient blooms.
- **`ui_kits/app/`** — Reader app: Discover, Story Reader, Library. Mixes light browse + dark story-reader mode.

### Slides
- `slides/01-title.html` — Title with pastel blooms
- `slides/02-section.html` — Dark section divider with giant hangul
- `slides/03-big-stat.html` — Oversized seasonal stat
- `slides/04-big-quote.html` — Editorial pull-quote
- `slides/05-comparison.html` — Four-season grid
- `slides/06-closing.html` — Multilingual thanks
All 1280×720 (16:9).

---
