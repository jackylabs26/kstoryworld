#!/usr/bin/env node
// Smoke test for n8n-workflows/_lib/hexagon-self-checks.js — JAC-1896.
//
// Loads the canonical JS source, wraps it in a stub n8n environment
// (`$input`, `$('Webhook Trigger')`, `this.helpers.httpRequest`), runs each
// fixture through it, and asserts the expected pass/fail outcome.
//
// Usage:  node scripts/hexagon/test-self-checks.mjs
// Exit 0  = all fixtures match expectations.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(
  path.join(__dirname, '..', '..', 'n8n-workflows', '_lib', 'hexagon-self-checks.js'),
  'utf-8',
);

// Wrap canonical source as `async function run(ctx)` so we can drive it.
const wrapped = `
return (async function run(ctx) {
  const $input = ctx.$input;
  const $ = ctx.$;
  const httpCalls = ctx.httpCalls;
  const helpers = {
    httpRequest: async (req) => { httpCalls.push(req); return { ok: true }; },
  };
  // Bind \`this.helpers\` for the canonical source.
  const self = { helpers };
  const exec = async function () {
    ${SRC}
  };
  return await exec.call(self);
})(arguments[0]);
`;
// eslint-disable-next-line no-new-func
const runner = new Function(wrapped);

function makeCtx({ upstream, body }) {
  const httpCalls = [];
  return {
    httpCalls,
    $input: { first: () => ({ json: upstream }) },
    $: (name) => {
      if (name === 'Webhook Trigger') return { first: () => ({ json: { body } }) };
      throw new Error(`unexpected node ref: ${name}`);
    },
  };
}

function makeImages(overrides = {}) {
  const base = [
    {
      role: 'hero',
      source: 'unsplash',
      asset_id: 'photo-hero-001',
      asset_url: 'https://example.com/h.jpg',
      license: 'unsplash-license',
      credit: 'Photo by A on Unsplash',
      seasonal_tone: 'spring',
      alt_text_ko: '봄 무드 히어로',
      alt_text_en: 'Spring mood hero',
    },
    {
      role: 'inline_1',
      source: 'pexels',
      asset_id: 'photo-inline-002',
      asset_url: 'https://example.com/i1.jpg',
      license: 'pexels-license',
      credit: 'Photo by B on Pexels',
      seasonal_tone: 'spring',
      alt_text_ko: '봄 인라인',
      alt_text_en: 'Spring inline',
    },
  ];
  return base.map((im, i) => ({ ...im, ...(overrides[i] || {}) }));
}

function makeUpstream({ images, ok = true, selfCheck }) {
  return {
    ok,
    self_check: selfCheck ?? {
      '01_category_is_k_drama': true,
      '13_source_body_overlap_min_15pct': true,
    },
    self_check_failures: [],
    draft: {
      category: 'k-food',
      ko: { meta_description: '별에서 온 그대 sister', sections: { intro: '치맥 한강 별에서 온 그대 my-love-from-the-star anchor', closing: 'fin' } },
      en: { meta_description: 'sister', sections: { intro: 'my-love-from-the-star anchor reference', closing: 'fin' } },
      tags: ['k-food'],
      images,
    },
    metadata: { keyword: 'test' },
  };
}

const baseBody = {
  hexagon_id: 'my-love-from-the-star',
  anchor_drama: '별에서 온 그대',
  anchor_url_ko: '/content/dramas/my-love-from-the-star-ko.html',
  anchor_url_en: '/content/dramas/my-love-from-the-star-en.html',
  publish_month: '2026-04', // spring
  category: 'k-food',
};

const fixtures = [
  {
    name: 'baseline pass — hero spring + inline spring + manifest spring',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'spring' },
    upstream: makeUpstream({ images: makeImages() }),
    expectPass: true,
  },
  {
    name: 'fail — image missing license',
    body: { ...baseBody },
    upstream: makeUpstream({ images: makeImages({ 0: { license: '' } }) }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
  },
  {
    name: 'fail — image missing alt_text_en',
    body: { ...baseBody },
    upstream: makeUpstream({ images: makeImages({ 1: { alt_text_en: '' } }) }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
  },
  {
    name: 'fail — non-whitelisted source',
    body: { ...baseBody },
    upstream: makeUpstream({ images: makeImages({ 0: { source: 'shutterstock' } }) }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
  },
  {
    name: 'fail — only hero, no inline',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'spring' },
    upstream: makeUpstream({ images: [makeImages()[0]] }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
  },
  {
    name: 'fail — two heroes',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'spring' },
    upstream: makeUpstream({
      images: [
        makeImages()[0],
        { ...makeImages()[0], asset_id: 'photo-hero-002' },
      ],
    }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
  },
  {
    name: 'fail — hero off-tone, no fidelity exception declared',
    body: { ...baseBody },
    upstream: makeUpstream({
      images: [
        { ...makeImages()[0], seasonal_tone: 'winter' },
        makeImages()[1],
      ],
    }),
    expectPass: false,
    expectFailureKey: '15a_seasonal_tone_quarter_policy',
  },
  {
    name: 'pass — hero off-tone with fidelity exception (manifest declares + inline covers)',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'winter' },
    upstream: makeUpstream({
      images: [
        { ...makeImages()[0], seasonal_tone: 'winter' },
        makeImages()[1], // spring inline covers expected
      ],
    }),
    expectPass: true,
  },
  {
    name: 'fail — hero off-tone, manifest declares but no inline covers expected tone',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'winter' },
    upstream: makeUpstream({
      images: [
        { ...makeImages()[0], seasonal_tone: 'winter' },
        { ...makeImages()[1], seasonal_tone: 'fall' },
      ],
    }),
    expectPass: false,
    expectFailureKey: '15a_seasonal_tone_quarter_policy',
  },
  {
    name: 'fail — anchor_backlink_present absent (no anchor mention in text)',
    body: { ...baseBody, manifest_hero_seasonal_tone: 'spring' },
    upstream: {
      ok: true,
      self_check: { '01_category_is_k_drama': true },
      self_check_failures: [],
      draft: {
        category: 'k-food',
        ko: { meta_description: 'unrelated', sections: { intro: '치맥 그냥 기사', closing: '' } },
        en: { meta_description: 'unrelated', sections: { intro: 'unrelated chimaek post', closing: '' } },
        tags: ['k-food'],
        images: makeImages(),
      },
    },
    expectPass: false,
    expectFailureKey: '14_anchor_backlink_present',
  },
  {
    name: 'pass-through — hexagon_id absent (legacy single-article mode)',
    body: { ...baseBody, hexagon_id: undefined },
    upstream: makeUpstream({ images: [] }), // would fail #15 in hexagon mode
    expectPass: true, // pass-through preserves upstream.ok=true
  },
  {
    name: 'telegram alert dispatched on failure when creds present',
    body: {
      ...baseBody,
      manifest_hero_seasonal_tone: 'spring',
      telegram_bot_token: 'test-token',
      telegram_chat_id: '12345',
    },
    upstream: makeUpstream({ images: makeImages({ 0: { credit: '' } }) }),
    expectPass: false,
    expectFailureKey: '15_images_present_with_license',
    expectTelegramCall: true,
  },
];

let passed = 0;
let failed = 0;
const failures = [];

for (const fx of fixtures) {
  const ctx = makeCtx({ upstream: fx.upstream, body: fx.body });
  let result;
  try {
    const arr = await runner(ctx);
    result = arr[0]?.json;
  } catch (e) {
    failures.push(`${fx.name}: threw ${e.message}`);
    failed++;
    continue;
  }
  const ok = !!result.ok;
  const matches = ok === fx.expectPass;
  let detail = '';
  if (fx.expectFailureKey && fx.expectPass === false) {
    if (!result.self_check_failures?.includes(fx.expectFailureKey)) {
      failures.push(`${fx.name}: expected failure key '${fx.expectFailureKey}' missing from ${JSON.stringify(result.self_check_failures)}`);
      failed++;
      continue;
    }
    detail = ` (failures: ${result.self_check_failures.join(',')})`;
  }
  if (fx.expectTelegramCall) {
    if (ctx.httpCalls.length === 0) {
      failures.push(`${fx.name}: expected telegram POST but none captured`);
      failed++;
      continue;
    }
    if (!ctx.httpCalls[0].url?.includes('api.telegram.org')) {
      failures.push(`${fx.name}: telegram URL mismatch: ${ctx.httpCalls[0].url}`);
      failed++;
      continue;
    }
    detail += ' (+telegram)';
  }
  if (!matches) {
    failures.push(`${fx.name}: expected ok=${fx.expectPass} got ok=${ok}, summary='${result.self_check_summary}'`);
    failed++;
    continue;
  }
  passed++;
  console.log(`  ✓ ${fx.name}${detail}`);
}

console.log(`\n${passed}/${passed + failed} fixtures passed`);
if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
process.exit(0);
