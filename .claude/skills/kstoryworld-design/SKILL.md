---
name: kstoryworld-design
description: KStoryWorld (케이스토리월드) design system skill. Use whenever generating interfaces, slides, marketing pages, reader-app screens, or any visual artifact for KStoryWorld — a Korean storytelling and content platform. Includes the four-seasons color system (봄 · 여름 · 가을 · 겨울), type tokens, brand assets (logo, hangul marks, cloud illustration), preview specimens, marketing + app UI kits, slide templates, and i18n rules for ko · en · ja · zh-Hans · zh-Hant · es · fr · vi.
user-invocable: true
---

# KStoryWorld design skill

## Step 0 — orient
Read `README.html` (or `README.md`) FIRST. It is the source of truth for voice, content, color, type, spacing, multilingual rules, and component recipes. Do not skip it.

Then `ls` the skill root to see what's available:

```
README.html / README.md     ← rules, tone, content fundamentals
colors_and_type.css         ← every design token, every CSS var, the @font-face stack
fonts/                      ← Space Grotesk + JetBrains Mono fallbacks (drop real TTFs here)
assets/                     ← logo, hangul marks (봄/여름/가을/겨울), cloud illustration
preview/                    ← per-card design-system specimens (colors, type, components, brand)
ui_kits/marketing/          ← homepage + responsive desktop/mobile preview
ui_kits/app/                ← reader app: discover, story reader
slides/                     ← 6 slide templates (1280×720)
```

## Step 1 — pick the seasonal mood
Every KStoryWorld surface lives under one of four seasons. Ask the user, or pick by content:

- **봄 Spring** — renewal, soft optimism. Pinks · peach · lavender. `var(--spring-grad)`
- **여름 Summer** — energy, late-night confessions. Sky · teal · mint. `var(--summer-grad)`
- **가을 Autumn** — warmth, harvest, family. Persimmon · maple · straw. `var(--autumn-grad)`
- **겨울 Winter** — quiet, repair, snowfall. Snow blue · ink indigo · bone. `var(--winter-grad)`

Use the season as a backdrop bloom on light surfaces. Do not invent off-palette colors.

## Step 2 — choose your output mode

**For decks, mocks, marketing pages, throwaway prototypes:**
- Copy `colors_and_type.css` into the new project (or link it relatively).
- Copy needed `assets/` files (logo, season hangul marks).
- Use the slide templates in `slides/` as starting points.
- Use the React components in `ui_kits/marketing/Components.jsx` as recipes (Header / Hero / Stats / SeasonRow / StoryCard / ResearchSection / Footer — all responsive via `useIsMobile`).
- Always wire `<html lang="…">` so `:lang(ko)`, `:lang(ja)`, etc. font overrides activate.

**For production code:**
- Lift the tokens from `colors_and_type.css`. The CSS variables are stable contracts.
- Lift the type stacks from the `:lang(...)` rules — they're the multilingual contract.
- Read README's **Multilingual support** section in full. Every layout must accommodate +30% string growth (Latin) and -20% (CJK).
- Match the radii (4px buttons, 8px cards, 0px full-bleed). No pills, no 16/24px radii.
- One shadow only: `rgba(1,1,32,0.10) 0 4px 10px`, midnight-blue tint, never gray.

## Step 3 — multilingual is non-negotiable
This is a multilingual platform. Eight locales minimum: `ko · en · ja · zh-Hans · zh-Hant · es · fr · vi`. When generating any text-bearing surface:

- Set `<html lang="ko">` (or whichever) so the right CJK font activates.
- Pair hangul with the local language on cultural concepts: `봄 — Spring`, `봄 — 春`, `봄 — Primavera`. Never strip hangul on `정 (jeong)`, `한 (han)`, p'ansori, etc.
- Negative tracking on Latin only. CJK display uses `letter-spacing: 0`.
- Mono labels are ALL CAPS only in Latin. CJK mono labels stay in their natural case.
- Locale switcher = mono-label dropdown, never flag icons.

## Step 4 — voice & tone
Editorial, atmospheric, quietly proud. Closer to *The Paris Review × Apple Newsroom* than *Duolingo*. Short, declarative, image-rich sentences. Verbs do the heavy lifting. First person plural ("we") for the platform, second person ("you") for the reader. Never "I". No emoji in product UI.

## Step 5 — verify
Before finishing, sanity-check:
- ✅ `<html lang="…">` set, CJK font activates, no tofu boxes.
- ✅ Section labels are mono + uppercase (Latin) or natural case (CJK).
- ✅ Headlines use sentence case, never Title Case or ALL CAPS.
- ✅ Radii: 4 / 8 / 0 only.
- ✅ Shadow: midnight-blue tint, single shadow per element.
- ✅ Seasonal palette respected — pastels for blooms, never as UI chrome.
- ✅ Mobile breakpoint at 768px; layouts collapse cleanly.

## When the user invokes this skill without specifics
Ask three questions, in order:
1. **What are we building?** (slide, page, app screen, full prototype)
2. **Which season's mood?** (봄 · 여름 · 가을 · 겨울 — or rotate)
3. **Which locales must ship?** (default: ko + en, often ja and one more)

Then act as an expert KStoryWorld designer and produce the artifact, citing which preview / UI-kit files you used as reference.
