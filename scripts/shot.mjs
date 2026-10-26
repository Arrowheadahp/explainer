#!/usr/bin/env node
/**
 * shot.mjs — capture a capped number of screenshots of an explainer page.
 *
 *   node shot.mjs page.html --n 4 [--width 1440] [--out DIR] [--section '#fig-1']
 *
 * Why this exists separately from verify.mjs: images are the most expensive
 * thing you can put in a context window. A session that took 31 screenshots hit
 * a hard provider limit and died mid-task. This tool refuses to take more than
 * six in one run, and it takes them the way that actually works:
 *
 *   - In a viewport clip after scrolling to a position, never an element clip.
 *     Element screenshots reuse a stale scroll offset when the target sits
 *     below the fold, which produces an image of the WRONG part of the page;
 *     three separate diagnosis rounds were wasted on that.
 *   - From a unique temp copy per run. Reusing a file:// URL serves the cached
 *     document, so the "fix" you just made appears not to have applied.
 *   - With collapsible figures expanded first, or a hidden diagram photographs
 *     as a 16px stub.
 *
 * Always prefer numbers over pixels: verify.mjs prints viewBox, node counts and
 * overflow widths. Ask for a screenshot only when the question is "does this
 * look right", never "did this take effect".
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';

/* Resolve dependencies from the *working directory* first, then from beside the
   script. The documented workflow runs this file by path from a tools directory
   that holds node_modules, so createRequire(import.meta.url) alone is wrong. */
function loadDep(name) {
  for (const base of [path.join(process.cwd(), 'noop.js'), import.meta.url]) {
    try { return createRequire(base)(name); } catch { /* try next */ }
  }
  throw new Error(`cannot find "${name}" — install it where you run this script: npm i puppeteer --no-save`);
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('-'));
if (!file) {
  console.error('usage: node shot.mjs <page.html> [--n 4] [--width 1440] [--out DIR] [--section SELECTOR] [--full]');
  process.exit(2);
}
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const MAX = 6;
const asked = Number(flag('--n', 3));
const N = Math.min(asked, MAX);
if (asked > MAX) console.warn(`capped --n ${asked} to ${MAX}: more images than that hits provider limits`);
const WIDTH = Number(flag('--width', 1440));
const OUT = flag('--out', path.join(os.tmpdir(), 'explainer-shots'));
const SECTION = flag('--section', null);
const FULL = args.includes('--full');

function nativePath(p) {
  if (process.platform !== 'win32') return path.resolve(p);
  if (/^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\')) return p;
  const m = p.match(/^\/mnt\/([a-zA-Z])\/(.*)$/);
  if (m) return `${m[1].toUpperCase()}:\\${m[2].split('/').join('\\')}`;
  return p;
}

let puppeteer;
try {
  puppeteer = loadDep('puppeteer');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const chromePath = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean).find((p) => { try { return fs.existsSync(p); } catch { return false; } });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'explainer-shot-'));
const tmpFile = path.join(tmpDir, `shot-${Date.now()}.html`);
fs.copyFileSync(nativePath(file), tmpFile);
const url = 'file://' + tmpFile.split(path.sep).join('/');

const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: 1000 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

// Expand every collapsed figure so its diagram actually paints.
await page.evaluate(() => {
  document.querySelectorAll('[data-fig-action]').forEach((b) => {
    const body = b.closest('figure')?.querySelector('.fig-body');
    if (body && body.hidden) b.click();
  });
});
await new Promise((r) => setTimeout(r, 1500));

fs.mkdirSync(OUT, { recursive: true });
const written = [];

if (SECTION) {
  // One image of one element, scrolled into view first.
  const el = await page.$(SECTION);
  if (!el) { console.error(`selector not found: ${SECTION}`); process.exit(1); }
  await el.evaluate((n) => n.scrollIntoView({ block: 'start' }));
  await new Promise((r) => setTimeout(r, 500));
  const box = await el.boundingBox();
  const p = path.join(OUT, `section-${Date.now()}.png`);
  await page.screenshot({ path: p, clip: { x: box.x, y: Math.max(0, box.y), width: Math.min(box.width, WIDTH), height: Math.min(box.height, 4000) } });
  written.push(p);
} else if (FULL && N === 1) {
  const p = path.join(OUT, `full-${Date.now()}.png`);
  await page.screenshot({ path: p, fullPage: true });
  written.push(p);
} else {
  // N evenly spaced viewport clips: each captures what a reader would see.
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < N; i++) {
    const y = Math.floor(((total - 1000) / Math.max(1, N - 1)) * i);
    await page.evaluate((top) => window.scrollTo(0, top), Math.max(0, y));
    await new Promise((r) => setTimeout(r, 400));
    const p = path.join(OUT, `shot-${i + 1}-${Date.now()}.png`);
    await page.screenshot({ path: p });
    written.push(p);
  }
}

await browser.close();
fs.rmSync(tmpDir, { recursive: true, force: true });

written.forEach((p) => console.log(p));
if (errors.length) console.log(`console errors: ${errors.slice(0, 3).join(' | ')}`);
console.log(`${written.length} image(s), cap ${MAX}. Prefer verify.mjs numbers before asking for more.`);
