# Explainer house style guide

Dark theme, serif display headings, one accent color per page, restrained
palette, permanent navigation. This is a guide, not pixel specs.

## Palette

- Base: near-black background (`#0d1117` or similar), slightly lighter panels
  (`#161b22`) — GitHub-dark-ish territory.
- Text: light gray body (`#c9d1d9`), near-white headings (`#e6edf3`), muted
  meta text (`#8b949e`).
- **Accent: one color per page**, chosen at generation time from curated
  dark-friendly values and used for links, active nav, diagram highlights, and
  small emphasis: `#4fc3f7`, `#7ee787`, `#ffab70`, `#d2a8ff`, `#79c0ff`,
  `#f2cc60` work on this base. Never more than this one hue beyond the
  neutrals; status colors (red for "wrong", green for "correct") in
  misconceptions sections are the only sanctioned exception.
- No gradients, no glows, no dark-pattern-of-the-week. Restraint is the style.

## Typography

- Headings: a serif display face — Georgia, "Iowan Old Style", or "Source
  Serif 4" via system fallbacks. Big, generous spacing, no cartouches.
- Body: a readable neutral sans or humanist serif at 16px+, max line length
  ~70–75ch, line-height ~1.7. Headings serif, body any consistent choice.
- `font-feature` niceties optional; no custom font CDN needed.

## Layout & navigation (required)

- **TOC sidebar** on wide screens (≥ ~1100px): fixed left column listing the
  layer headings ①–⑤ with active-section highlight driven by an Intersection-
  Observer scrollspy; smooth scrolling on anchor click. Implements vanilla JS,
  inline, ~30 lines.
- **Narrow screens**: sidebar collapses to a slide-in drawer toggled by a
  single hamburger control; same scrollspy.
- No back-to-top button. Deep-linkable heading anchors (`id` + CSS
  `scroll-margin-top` if using a sticky top bar; a sticky top bar is optional).
- Sections, figures, and equations get stable `id`s; figures get numbered
  captions ("Figure 3 — ..."), consistent with prose references.

## Diagrams

- Prefer a single `<pre class="mermaid">` block per diagram, with `mermaid.initialize({
  startOnLoad: true, theme: 'dark', themeVariables: {...} })` tuned to the
  palette above: transparent panel backgrounds, text in body color, primary
  node line/fill in the accent color. Diagram text must match prose
  terminology exactly.
- Mermaid CDN: the current `https://cdn.jsdelivr.net/npm/mermaid@<ver>/dist/
  mermaid.esm.min.mjs` as `<script type="module">`. KaTeX via jsdelivr
  `auto-render` extension with `delimiters: [{left:'\\[',right:'\\]',display:
  true},{left:'\\(',right:'\\)',display:false}]`.
- Hand-rolled inline SVG is allowed and sometimes better (annotated numeric
  axes, worked-example tables-as-SVG); keep it consistent with palette.
- Every diagram: caption, number, and prose reference ("see Figure 2").

## Worked examples (quantitative/algorithmic mechanisms)

- Inline in the step-by-step layer, not a separate appendix.
- Formats that work: a small markdown-style table of steps × values, an SVG
  line chart of a value evolving over iterations, or a monospace block with
  numbered lines annotated by side comments.
- Numbers must survive recomputation; show intermediate values, not just the
  final result.

## Anti-patterns

- Dashboard chrome (cards, stat tiles, progress rings). This is a document.
- Emoji as structure. Decorative emoji: never more than zero.
- More than one accent hue. Rainbow diagrams.
- Cookie banners, fake "loading" bars, JS frameworks, analytics, or anything
  phoning home beyond the Mermaid/KaTeX CDNs.
