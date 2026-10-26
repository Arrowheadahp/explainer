#!/usr/bin/env node
/**
 * verify.mjs — automated self-check for an explainer page.
 *
 *   node verify.mjs page.html [--screenshots N] [--out DIR]
 *
 * Checks, in the order things actually break:
 *   1. HTML structure      tag balance, internal anchors, <sup> refs vs sources
 *   2. Mermaid             every <pre class="mermaid"> renders to a real SVG in Chrome
 *   3. KaTeX               every \( \) and \[ \] compiles; no raw TeX left on the page
 *   4. Layout              desktop + mobile overflow, console errors, TOC drawer
 *   5. Content             figure/caption counts, prose word count, placeholder scan
 *
 * Exit code 0 = all checks pass, 1 = at least one failure.
 *
 * Requirements: Node >= 18, a local Chrome/Chromium, and node_modules containing
 * puppeteer, mermaid and katex (see scripts/README.md for the one-line install).
 *
 * Design notes, learned the hard way:
 *   - Mermaid is judged in real Chrome only. A jsdom renderer returns a
 *     degenerate `-8 -8 16 16` viewBox even for a two-node graph, because jsdom
 *     has no layout engine and cannot measure text. Node is used for syntax
 *     only, never for layout.
 *   - The page is copied to a unique temp filename per run. Loading the same
 *     file:// URL twice returns a cached document, which has produced phantom
 *     "stale render" diagnoses.
 *   - Hidden diagrams report width 0. That is not errant output; it is what a
 *     collapsible figure does. Sizes are read after each figure is expanded.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

/* Resolve dependencies from the *working directory* first, then from beside the
   script. The documented workflow runs this file by path from a tools directory
   that holds node_modules, so createRequire(import.meta.url) alone is wrong. */
function loadDep(name) {
  for (const base of [path.join(process.cwd(), 'noop.js'), import.meta.url]) {
    try { return createRequire(base)(name); } catch { /* try next */ }
  }
  throw new Error(`cannot find "${name}" — install it where you run this script: npm i puppeteer mermaid katex --no-save`);
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('-'));
if (!file) {
  console.error('usage: node verify.mjs <page.html> [--screenshots N] [--out DIR]');
  process.exit(2);
}
const numFlag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : dflt;
};
const SHOTS = numFlag('--screenshots', 0);
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : path.join(os.tmpdir(), 'explainer-shots');

const fail = [];
const warn = [];
const ok = (label, detail = '') => console.log(`  PASS  ${label}${detail ? '  ' + detail : ''}`);
const bad = (label, detail = '') => {
  fail.push(`${label}${detail ? ': ' + detail : ''}`);
  console.log(`  FAIL  ${label}${detail ? '  ' + detail : ''}`);
};
const note = (label, detail = '') => {
  warn.push(`${label}${detail ? ': ' + detail : ''}`);
  console.log(`  WARN  ${label}${detail ? '  ' + detail : ''}`);
};

/**
 * WSL interop: a Windows node.exe cannot open "/mnt/d/..." paths. When we are
 * running under Windows against a WSL path, translate it to the UNC form
 * (\\wsl.localhost\<distro>\...) or the drive form (D:\...) that it can read.
 */
function nativePath(p) {
  if (process.platform !== 'win32') return path.resolve(p);
  // Order matters: check the already-translated forms first so a path that has
  // been through this function is not translated twice.
  if (/^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\')) return p;
  const m = p.match(/^\/mnt\/([a-zA-Z])\/(.*)$/);
  if (m) return `${m[1].toUpperCase()}:\\${m[2].split('/').join('\\')}`;
  const u = p.match(/^\/home\/([^/]+)\/(.*)$/);
  if (u) return `\\\\wsl.localhost\\${process.env.WSL_DISTRO_NAME || 'Ubuntu'}\\home\\${u[1]}\\${u[2].split('/').join('\\')}`;
  if (p.startsWith('/')) return `\\\\wsl.localhost\\${process.env.WSL_DISTRO_NAME || 'Ubuntu'}${p.split('/').join('\\')}`;
  return path.resolve(p);
}

const srcPath = nativePath(file);
const src = fs.readFileSync(srcPath, 'utf8');

// ---------------------------------------------------------------- 1. structure
console.log('\n[1] HTML structure');
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const stack = [];
const tagErrors = [];
const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
// Ignore comments, CDATA-ish script/style bodies for tag balance purposes.
const stripped = src
  .replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))
  // Collapse script/style/pre bodies, keeping balanced open/close tags so the
  // stack stays honest. A bare `<script></script>` stub keeps the tag count
  // right for the opening tag that we are about to push and pop.
  .replace(/<(script|style|pre)\b([^>]*)>[\s\S]*?<\/\1>/gi, (m, tag, attrs) => `<${tag}${attrs}></${tag}>`);
let m;
while ((m = re.exec(stripped))) {
  const [, closing, rawName, attrs, selfClose] = m;
  const name = rawName.toLowerCase();
  if (VOID.has(name) || selfClose === '/') continue;
  if (closing) {
    if (stack.length === 0) tagErrors.push(`stray </${name}>`);
    else if (stack[stack.length - 1] !== name) tagErrors.push(`</${name}> closes <${stack[stack.length - 1]}>`);
    else stack.pop();
  } else {
    stack.push(name);
  }
}
if (tagErrors.length) bad('tag balance', tagErrors.slice(0, 6).join('; '));
else if (stack.length) bad('unclosed tags', stack.join(' > '));
else ok('tag balance');

// Internal anchors: every href="#id" must resolve.
const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
const hrefs = [...src.matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
const broken = [...new Set(hrefs)].filter((h) => !ids.has(h));
if (broken.length) bad('broken internal links', broken.join(', '));
else ok('internal links', `${hrefs.length} refs`);

// Source integrity: every <sup> citation points at an existing source entry.
const cited = [...src.matchAll(/<sup>(?:\s*<a href="#(src-\d+)">)/g)].map((x) => x[1]);
const defined = [...src.matchAll(/id="(src-\d+)"/g)].map((x) => x[1]);
const missing = [...new Set(cited)].filter((c) => !defined.includes(c));
const uncited = defined.filter((d) => !cited.includes(d));
if (missing.length) bad('citations without a source entry', missing.join(', '));
else ok('citations resolve', `${defined.length} sources, ${new Set(cited).size} cited`);
if (uncited.length) note('sources never cited', uncited.join(', '));

// ---------------------------------------------------------------- load chrome
let puppeteer;
try {
  puppeteer = loadDep('puppeteer');
} catch (e) {
  bad('puppeteer missing', e.message);
  report();
  process.exit(1);
}
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch { return false; } });

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});

// Unique temp copy per run: a reused file:// URL serves the cached document.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'explainer-verify-'));
const tmpFile = path.join(tmpDir, `page-${Date.now()}.html`);
fs.copyFileSync(srcPath, tmpFile);
const url = 'file://' + tmpFile.split(path.sep).join('/');

// ---------------------------------------------------------------- 2-4. browser
console.log('\n[2] Mermaid diagrams');
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(String(err)));

// Expand any collapsible figures so hidden diagrams get a real layout pass.
const expandAll = async () => {
  await page.evaluate(() => {
    document.querySelectorAll('[data-fig-action]').forEach((b) => {
      const body = b.closest('figure')?.querySelector('.fig-body');
      if (body && body.hidden) b.click();
    });
  });
  // Hidden diagrams render on first expansion; give Mermaid a beat.
  await new Promise((r) => setTimeout(r, 1200));
};

await page.setViewport({ width: 1440, height: 1000 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));
await expandAll();

const diagramReport = await page.evaluate(() => {
  const blocks = [...document.querySelectorAll('pre.mermaid')];
  return blocks.map((pre, i) => {
    const fig = pre.closest('figure');
    const svg = pre.querySelector('svg') || fig?.querySelector('svg');
    const vb = svg?.getAttribute('viewBox') || '';
    const [x, y, w, h] = vb.split(/\s+/).map(Number);
    // Mermaid's failure mode for an unmeasurable container is a fixed
    // 16x16 box at -8,-8 with nodes still in the DOM. That is a specific
    // signature; a small-but-real diagram (a 5-node LR strip is ~94px tall)
    // is not degenerate. Judge the signature, not a size threshold.
    const degenerate = !svg || !(w > 0 && h > 0) || (Math.abs(w - 16) < 0.5 && Math.abs(h - 16) < 0.5);
    // A node whose <br> was dropped shows adjacent words jammed together.
    const labels = [...(svg?.querySelectorAll('.nodeLabel') || [])];
    // "Run-on" means markup was lost, not that a node is short. Two tells:
    // a flowchart node's closing `}` glued to text, and a hard-break tag left
    // sitting in the rendered output as literal characters.
    const runOn = labels
      .map((n) => n.textContent.trim())
      .filter((t) => /\S}/.test(t) || /<\/?(b|br|i)>/.test(t));
    return {
      index: i + 1,
      caption: fig?.querySelector('figcaption')?.textContent.trim().slice(0, 60) || '',
      hasFigure: !!fig,
      svgsInFigure: fig ? fig.querySelectorAll('svg').length : 0,
      viewBox: vb,
      width: Math.round(w || 0),
      height: Math.round(h || 0),
      nodes: svg?.querySelectorAll('.node').length || 0,
      edges: svg?.querySelectorAll('.edgePath, .flowchart-link').length || 0,
      raw: pre.textContent.trim().startsWith('flowchart') || pre.textContent.trim().startsWith('sequenceDiagram'),
      degenerate,
      runOn: runOn.slice(0, 4),
    };
  });
});

if (!diagramReport.length) bad('no mermaid diagrams found');
diagramReport.forEach((d) => {
  const label = `Figure ${d.index}`;
  if (!d.hasFigure) bad(`${label} not inside <figure>`);
  if (!d.caption) bad(`${label} has no caption`);
  if (d.degenerate) bad(`${label} degenerate viewBox`, d.viewBox || 'no svg');
  else ok(`${label} renders`, `${d.width}×${d.height}, ${d.nodes} nodes, ${d.edges} edges`);
  if (d.runOn.length) note(`${label} suspicious labels (dropped <br>?)`, JSON.stringify(d.runOn));
});

console.log('\n[3] KaTeX');
const katexReport = await page.evaluate(() => {
  const errors = [...document.querySelectorAll('.katex-error')];
  // Raw TeX surviving on the page: a literal backslash-paren or backslash-bracket
  // in a text node that is not inside <script>/<pre>/<code>.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const raw = [];
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest('script, pre, code, .katex')) continue;
    if (/\\\(|\\\[/.test(n.textContent)) raw.push(n.textContent.trim().slice(0, 50));
  }
  return {
    rendered: document.querySelectorAll('.katex').length,
    display: document.querySelectorAll('.katex-display').length,
    errors: errors.map((e) => e.textContent.trim().slice(0, 120)),
    raw: raw.slice(0, 5),
  };
});
if (katexReport.errors.length) bad('KaTeX compile errors', katexReport.errors.join(' | '));
else if (katexReport.rendered) ok('KaTeX rendered', `${katexReport.rendered} spans, ${katexReport.display} display`);
else note('no KaTeX output', 'page may have no equations (allowed if the mechanism is not quantitative)');
if (katexReport.raw.length) bad('raw TeX visible on page', JSON.stringify(katexReport.raw));

console.log('\n[4] Layout and console');
const layout = await page.evaluate(() => {
  const de = document.documentElement;
  const toggle = document.getElementById('nav-toggle');
  return {
    desktopOverflow: de.scrollWidth - de.clientWidth,
    title: document.title,
    tocPresent: !!document.getElementById('toc'),
    toggleDisplay: toggle ? getComputedStyle(toggle).display : 'missing',
  };
});
if (layout.desktopOverflow > 1) bad('desktop horizontal overflow', `${layout.desktopOverflow}px`);
else ok('desktop overflow', '0px');

await page.setViewport({ width: 390, height: 844, isMobile: true });
await new Promise((r) => setTimeout(r, 800));
const mobile = await page.evaluate(() => {
  const de = document.documentElement;
  const toc = document.getElementById('toc');
  const toggle = document.getElementById('nav-toggle');
  const hidden = toc ? getComputedStyle(toc).transform !== 'none' : true;
  return {
    overflow: de.scrollWidth - de.clientWidth,
    tocHidden: hidden,
    toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
  };
});
if (mobile.overflow > 1) bad('mobile horizontal overflow', `${mobile.overflow}px`);
else ok('mobile overflow', '0px');
if (layout.tocPresent && !mobile.toggleVisible) bad('no mobile TOC toggle');
else ok('mobile nav', mobile.toggleVisible ? 'toggle visible' : 'no TOC');

if (consoleErrors.length) bad('console errors', consoleErrors.slice(0, 3).join(' | '));
else ok('console errors', 'none');

// ---------------------------------------------------------------- 5. content
console.log('\n[5] Content');
const content = await page.evaluate(() => {
  const body = document.body.cloneNode(true);
  body.querySelectorAll('script, style, nav').forEach((n) => n.remove());
  const words = (body.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  return {
    figures: document.querySelectorAll('figure').length,
    captions: document.querySelectorAll('figcaption').length,
    tables: document.querySelectorAll('table').length,
    words,
    /* "todo list" is the worked example's subject in many explainers, so the
       marker check only matches the uppercase convention (TODO/FIXME) and
       "lorem ipsum". A lowercase "todo" is prose. */
    placeholderHits: (document.body.textContent.match(/\b(TODO|FIXME)\b|lorem ipsum/g) || []).slice(0, 5),
  };
});
ok('figures', `${content.figures} figures, ${content.captions} captions`);
ok('tables', `${content.tables}`);
console.log(`  INFO  prose words: ${content.words}`);
if (content.captions < content.figures) bad('figure without caption', `${content.figures - content.captions} uncaptioned`);
if (content.placeholderHits.length) bad('placeholder text', content.placeholderHits.join(', '));

// ---------------------------------------------------------------- screenshots
if (SHOTS > 0) {
  console.log(`\n[6] Screenshots (max ${Math.min(SHOTS, 6)} this run)`);
  fs.mkdirSync(OUT, { recursive: true });
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await expandAll();
  const n = Math.min(SHOTS, 6);
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < n; i++) {
    const y = Math.floor((total / n) * i);
    // Viewport clip, not element clip: element screenshots use a stale scroll
    // offset when the target sits below the fold.
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await new Promise((r) => setTimeout(r, 400));
    const p = path.join(OUT, `shot-${i + 1}.png`);
    await page.screenshot({ path: p });
    console.log(`  shot  ${p}`);
  }
  if (SHOTS > 6) note('screenshot cap', 'asked for more than 6; capped to stay under the image limit');
}

await browser.close();
fs.rmSync(tmpDir, { recursive: true, force: true });
report();

function report() {
  console.log(`\n${'─'.repeat(60)}`);
  if (!fail.length) {
    console.log(`PASS  ${path.basename(file)} — ${diagramReport?.length ?? 0} diagrams, ${warn.length} warnings`);
    process.exit(0);
  }
  console.log(`FAIL  ${fail.length} check(s)`);
  fail.forEach((f) => console.log(`  ✗ ${f}`));
  if (warn.length) warn.forEach((w) => console.log(`  ! ${w}`));
  process.exit(1);
}
