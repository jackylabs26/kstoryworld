// Drip Publish Queue — shared helpers (JAC-1899)

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
export const REPO_ROOT = path.resolve(path.dirname(__filename), '..', '..');

export const QUEUE_PATH = path.join(REPO_ROOT, 'data', 'publish-queue.json');
export const STATE_PATH = path.join(REPO_ROOT, 'data', 'publish-queue.state.json');

export const DOMAIN_TO_FOLDER = {
  'k-drama': 'dramas',
  'k-food': 'foods',
  'k-pop': 'songs',
  'k-beauty': 'beauties',
  'k-travel': 'travels',
  'k-literature': 'literatures',
};

export const KNOWN_LOCALES = ['ko', 'en', 'ja', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'vi'];

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

export function readQueue() {
  return readJson(QUEUE_PATH);
}

export function writeQueue(queue) {
  writeJson(QUEUE_PATH, queue);
}

export function readState() {
  return readJson(STATE_PATH);
}

export function writeState(state) {
  writeJson(STATE_PATH, state);
}

// Minimal yaml -> object parser limited to the shape produced by
// content/hexagons/<slug>.yaml. Avoids adding js-yaml as a dep for one consumer.
export function parseHexagonManifest(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  const result = {};
  let currentList = null;
  let currentItem = null;
  let inBlock = null;

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const stripped = raw.replace(/\s*#.*$/, '');
    const m2 = stripped.match(/^(\s*)(.*)$/);
    const indent = m2[1].length;
    const body = m2[2];

    if (indent === 0) {
      const kv = body.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
      if (!kv) continue;
      const [, key, val] = kv;
      currentList = null;
      currentItem = null;
      inBlock = key;
      if (val === '') {
        result[key] = key === 'sisters' ? [] : {};
      } else {
        result[key] = parseScalar(val);
      }
    } else if (inBlock === 'sisters') {
      const dash = body.match(/^- (.*)$/);
      if (dash) {
        currentItem = {};
        result.sisters.push(currentItem);
        const inline = dash[1].match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
        if (inline) currentItem[inline[1]] = parseScalar(inline[2]);
        continue;
      }
      const kv = body.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
      if (kv && currentItem) currentItem[kv[1]] = parseScalar(kv[2]);
    } else if (typeof result[inBlock] === 'object' && result[inBlock] !== null) {
      const kv = body.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
      if (kv) result[inBlock][kv[1]] = parseScalar(kv[2]);
    }
  }
  return result;
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === 'null' || v === '~' || v === '') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^\[(.*)\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((s) => parseScalar(s));
  }
  return v.replace(/^['"]|['"]$/g, '');
}

export function discoverLocaleFiles(domain, slug) {
  const folder = DOMAIN_TO_FOLDER[domain];
  if (!folder) return [];
  const dir = path.join(REPO_ROOT, 'content', folder);
  if (!fs.existsSync(dir)) return [];
  const present = [];
  for (const locale of KNOWN_LOCALES) {
    for (const ext of ['html', 'md']) {
      const candidate = `${slug}-${locale}.${ext}`;
      if (fs.existsSync(path.join(dir, candidate))) {
        present.push({ locale, ext, file: path.join('content', folder, candidate) });
      }
    }
  }
  return present;
}

export function nowIso() {
  return new Date().toISOString();
}

export function todayKstDate() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}
