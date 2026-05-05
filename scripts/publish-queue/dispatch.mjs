#!/usr/bin/env node
// Drip Publish Dispatcher (JAC-1899).
//
// Daily 09:00 KST cron entry point. Picks the next 1~2 publish units from
// data/publish-queue.json (FIFO with priority tiebreak) and emits a
// dispatch artifact to artifacts/publish-dispatch/<date>.json. The actual
// PR-create + Cloudflare-deploy hand-off is performed by the GH Actions
// workflow that consumes this artifact (.github/workflows/drip-publish.yml).
//
// Usage:
//   node scripts/publish-queue/dispatch.mjs              # dry-run (default)
//   node scripts/publish-queue/dispatch.mjs --apply      # mutate state files
//   node scripts/publish-queue/dispatch.mjs --apply --daily-cap 2
//
// Exit codes:
//   0  ok (published, dry_out, or paused — all are normal)
//   1  unexpected error
//   2  invalid arguments

import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  readQueue,
  writeQueue,
  readState,
  writeState,
  discoverLocaleFiles,
  nowIso,
  todayKstDate,
} from './lib.mjs';

const args = process.argv.slice(2);
let apply = false;
let dailyCap = 2;
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '--apply') apply = true;
  else if (a === '--dry-run') apply = false;
  else if (a === '--daily-cap') {
    dailyCap = parseInt(args[++i], 10);
    if (!Number.isInteger(dailyCap) || dailyCap < 1 || dailyCap > 2) {
      console.error('--daily-cap must be 1 or 2');
      process.exit(2);
    }
  } else {
    console.error(`unknown arg: ${a}`);
    process.exit(2);
  }
}

const state = readState();
const queue = readQueue();
const dispatchDate = todayKstDate();
const summary = {
  dispatched_at: nowIso(),
  dispatch_date_kst: dispatchDate,
  apply_mode: apply,
  daily_cap: dailyCap,
  outcome: null,
  picked: [],
  paused: state.paused === true,
  paused_reason: state.paused_reason || null,
  queue_depth_before: queue.length,
  queue_depth_after: null,
  notes: [],
};

if (state.paused === true) {
  summary.outcome = 'paused';
  summary.notes.push(`board hold active: ${state.paused_reason || '(no reason)'}`);
  finalize(summary, state);
  process.exit(0);
}

const pending = queue.filter((u) => u.state === 'pending').sort(byPriority);
if (pending.length === 0) {
  summary.outcome = 'dry_out';
  summary.notes.push('queue contains no pending units; trigger next hexagon seed work');
  if (apply) {
    state.consecutive_dry_outs = (state.consecutive_dry_outs || 0) + 1;
  }
  finalize(summary, state);
  process.exit(0);
}

const picks = pending.slice(0, dailyCap);
for (const unit of picks) {
  const localeFiles = discoverLocaleFiles(unit.domain, unit.slug);
  const pickRecord = {
    unit_id: unit.unit_id,
    hexagon_id: unit.hexagon_id,
    domain: unit.domain,
    slug: unit.slug,
    priority: unit.priority,
    locale_files: localeFiles,
    locales_found: localeFiles.map((l) => l.locale),
  };

  if (localeFiles.length === 0) {
    pickRecord.error = `no locale files found under content/${unit.domain}/${unit.slug}-*.{html,md}`;
    if (apply) {
      unit.attempts = (unit.attempts || 0) + 1;
      unit.last_attempt_at = summary.dispatched_at;
      unit.last_error = pickRecord.error;
      unit.state = unit.attempts >= 3 ? 'failed' : 'pending';
    }
    summary.notes.push(`fail: ${unit.unit_id} — ${pickRecord.error}`);
  } else if (apply) {
    unit.state = 'publishing';
    unit.attempts = (unit.attempts || 0) + 1;
    unit.last_attempt_at = summary.dispatched_at;
    unit.last_error = null;
  }
  summary.picked.push(pickRecord);
}

if (apply) {
  state.consecutive_dry_outs = 0;
  state.last_run = summary.dispatched_at;
  state.last_run_outcome = summary.picked.some((p) => p.error) ? 'failed' : 'published';
  if (state.weekly_window_start === null) state.weekly_window_start = dispatchDate;
  state.weekly_publish_count = (state.weekly_publish_count || 0) + summary.picked.filter((p) => !p.error).length;
  writeQueue(queue);
}

summary.outcome = summary.picked.every((p) => p.error)
  ? 'failed'
  : 'published';
summary.queue_depth_after = queue.filter((u) => u.state === 'pending').length;
finalize(summary, state);
process.exit(0);

function byPriority(a, b) {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.enqueued_at < b.enqueued_at ? -1 : 1;
}

function finalize(s, st) {
  if (s.queue_depth_after === null) s.queue_depth_after = readQueue().filter((u) => u.state === 'pending').length;
  const dir = path.join(REPO_ROOT, 'artifacts', 'publish-dispatch');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${s.dispatch_date_kst}.json`);
  fs.writeFileSync(out, JSON.stringify(s, null, 2) + '\n');
  if (apply) writeState(st);
  process.stdout.write(JSON.stringify(s, null, 2) + '\n');
}
