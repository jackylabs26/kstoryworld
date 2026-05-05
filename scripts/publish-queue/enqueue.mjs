#!/usr/bin/env node
// Enqueue an approved hexagon into the drip-publish queue (JAC-1899).
//
// Usage:
//   node scripts/publish-queue/enqueue.mjs <hexagon-slug>
//   node scripts/publish-queue/enqueue.mjs my-love-from-the-star
//
// Reads content/hexagons/<slug>.yaml. Refuses unless review.status=approved
// and publish.policy=drip. Expands one hexagon into 6 publish units (anchor
// + 5 sisters) ordered by publish.recommended_order. Idempotent: skips units
// whose unit_id already exists in the queue.

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  parseHexagonManifest,
  readQueue,
  writeQueue,
  nowIso,
} from './lib.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('-')) {
  console.error('Usage: node scripts/publish-queue/enqueue.mjs <hexagon-slug>');
  process.exit(2);
}
const slug = args[0];
const manifestPath = path.join(REPO_ROOT, 'content', 'hexagons', `${slug}.yaml`);
if (!fs.existsSync(manifestPath)) {
  console.error(`hexagon manifest not found: ${manifestPath}`);
  process.exit(1);
}

const hex = parseHexagonManifest(manifestPath);
const review = hex.review || {};
const publish = hex.publish || {};

if (review.status !== 'approved') {
  console.error(`refuse: review.status=${review.status} (need 'approved')`);
  process.exit(1);
}
if (publish.policy !== 'drip') {
  console.error(`refuse: publish.policy=${publish.policy} (need 'drip')`);
  process.exit(1);
}

const order = Array.isArray(publish.recommended_order) ? publish.recommended_order : [];
if (order.length !== 6) {
  console.error(`refuse: publish.recommended_order must have exactly 6 entries, got ${order.length}`);
  process.exit(1);
}

const slugByDomain = {};
const anchorDomain = (hex.anchor && hex.anchor.domain) || 'k-drama';
slugByDomain[anchorDomain] = slug;
for (const sister of hex.sisters || []) {
  if (sister.domain && sister.seed) slugByDomain[sister.domain] = sister.seed;
}

const queue = readQueue();
const existing = new Set(queue.map((u) => u.unit_id));
const enqueueAt = nowIso();
const added = [];
for (let i = 0; i < order.length; i += 1) {
  const domain = order[i];
  const articleSlug = slugByDomain[domain];
  if (!articleSlug) {
    console.error(`refuse: no slug found for domain ${domain} in manifest`);
    process.exit(1);
  }
  const unit_id = `${slug}:${domain}`;
  if (existing.has(unit_id)) {
    console.log(`skip already-queued unit: ${unit_id}`);
    continue;
  }
  const unit = {
    unit_id,
    hexagon_id: slug,
    domain,
    slug: articleSlug,
    priority: i,
    enqueued_at: enqueueAt,
    state: 'pending',
    attempts: 0,
    last_attempt_at: null,
    last_error: null,
    published_at: null,
  };
  queue.push(unit);
  added.push(unit);
}

writeQueue(queue);
console.log(`enqueued ${added.length} unit(s) for hexagon ${slug}:`);
for (const u of added) console.log(`  ${u.priority} ${u.unit_id} → ${u.slug}`);
