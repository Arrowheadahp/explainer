# Scripts

Two optional helpers. The skill still produces a page without them — they exist
so the self-check is *measured* instead of *asserted*.

## Install once

```bash
mkdir -p /tmp/explainer-tools && cd /tmp/explainer-tools
npm init -y >/dev/null
npm i puppeteer mermaid katex --no-save
```

Then run the scripts from that directory (so `node_modules` resolves), pointing
at the page by path:

```bash
node /path/to/explainer/scripts/verify.mjs /path/to/page.html
```

Requirements: Node ≥ 18, and a local Chrome, Chromium, or Edge. Override the
browser with `CHROME_PATH=/path/to/chrome`.

## verify.mjs

```
node verify.mjs page.html [--screenshots N] [--out DIR]
```

Prints a PASS/FAIL line per check and exits non-zero on failure.

| Section | What it catches |
|---|---|
| 1 · structure | unclosed tags, broken internal `#anchor` links, `<sup>` citations with no matching source entry, sources nobody cites |
| 2 · Mermaid | a diagram that fails to parse, renders with a degenerate `viewBox`, or produces nodes with dropped `<br>` markup |
| 3 · KaTeX | equations that do not compile, raw `\( ... \)` left visible on the page |
| 4 · layout | horizontal overflow at 1440px and 390px, missing mobile TOC toggle, console errors |
| 5 · content | figures without captions, prose word count (reported, never enforced), placeholder markers |

Mermaid is judged in real Chrome only. A Node-side renderer cannot lay out a
flowchart, so it reports a degenerate `viewBox` even for a two-node graph. Use
a Node parser to check *syntax* if you must; never to check *layout*.

## shot.mjs

```
node shot.mjs page.html [--n 4] [--width 1440] [--section '#fig-1'] [--full]
```

Hard cap of **6 images per run**. Screenshots are the most expensive thing you
can put in a context window; a session that took 31 of them hit a provider limit
and died with the work unfinished.

Before taking any:

1. Run `verify.mjs`. If it reports the viewBox and node counts you expect, you
   probably do not need a picture.
2. If you do, ask one specific question — "is the third lane legible", not "does
   it work" — and take one image.

The script takes viewport clips after scrolling, from a unique temp copy each
run. Both details matter: element screenshots reuse a stale scroll offset when
the target is below the fold, and a reused `file://` URL serves the cached
document, so a change appears not to have applied.
