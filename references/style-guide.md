# Explainer house style guide

Dark theme, serif display headings, one accent color per page, restrained
palette, permanent navigation. This is a guide, not pixel specs.

Detail is not restrained. Restraint is for colour, chrome and decoration; a
figure with thirty nodes is on-brand, a figure with three is usually
under-designed.

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
- **Role colors in diagrams** are a sanctioned second use of colour, and they
  are semantic, not decorative: the accent marks the human, green marks a
  produced artifact, and a single muted border marks everything else. Three
  roles, three treatments, used identically on every figure.
- No gradients, no glows, no dark-pattern-of-the-week.

## Typography

- Headings: a serif display face — Georgia, "Iowan Old Style", or "Source
  Serif 4" via system fallbacks. Big, generous spacing, no cartouches.
- Body: a readable neutral sans or humanist serif at 16px+, max line length
  ~70–75ch, line-height ~1.7. Headings serif, body any consistent choice.
- `font-feature` niceties optional; no custom font CDN needed.
- Prose keeps a readable measure; **figures and tables are allowed to break
  out of it** and use the full content column (up to ~960–980px). A 30-node
  diagram squeezed into 75ch is unreadable. Set
  `p, ul, ol, h1, h2, h3, h4 { max-width: 72ch; }` and give `figure`,
  `.table-scroll` and `pre` `width: 100%`.

## Layout & navigation (required)

- **TOC sidebar** on wide screens (≥ ~1100px): fixed left column listing the
  layer headings ①–⑤ with active-section highlight driven by an Intersection-
  Observer scrollspy; smooth scrolling on anchor click. Implements vanilla JS,
  inline, ~30 lines.
- **Narrow screens**: sidebar collapses to a slide-in drawer toggled by a
  single hamburger control; same scrollspy. The drawer needs
  `padding-top` clear of the toggle, or it opens with the title under it.
- No back-to-top button. Deep-linkable heading anchors (`id` + CSS
  `scroll-margin-top` if using a sticky top bar; a sticky top bar is optional).
- Sections, figures, and equations get stable `id`s; figures get numbered
  captions ("Figure 3 — ..."), consistent with prose references.

## Wide-figure viewer (required for wide diagrams)

Any figure wider than the content column ships with a toolbar. This is a
fixture of the house style, not an enhancement.

```html
<figure id="fig-pipeline">
  <div class="fig-toolbar" role="group" aria-label="Figure 1 display controls">
    <button type="button" data-fig-action="expand" aria-pressed="true">Expand diagram</button>
    <button type="button" data-fig-action="fit" aria-pressed="true">Fit width</button>
    <button type="button" data-fig-action="natural" aria-pressed="false">Natural size</button>
  </div>
  <div class="fig-body">
    <pre class="mermaid">flowchart LR ...</pre>
  </div>
  <p class="fig-hint">Shown at Fit width — the whole shape at once. Use Natural size to read the labels; the diagram then scrolls sideways at full size.</p>
  <figcaption>Figure 1 — ...</figcaption>
</figure>
```

Rules that took a long time to get right:

- **Fit width is the default** for every wide figure: a first-time reader gets
  an overview of the whole shape, never a collapsed box that looks empty. That
  is also why the `.fig-body` markup carries no `hidden` attribute — with JS off
  the body stays visible instead of degrading to a blank box.
- **Expanding from collapsed opens at natural size.** "Fit" on a 6,000px
  diagram is an unreadable strip, and a reader who asks to expand has asked for
  the full-size view. The toolbar's Natural size button is the same view.
- **The caption stays visible** in every state, and states what to read from
  the figure.
- **One scroll container.** `.fig-body` scrolls; the inner `pre` never does
  (`overflow: visible`). Two nested scrollers lose the gesture.
- **Natural size is pinned to the viewBox** in pixels by script, and those
  inline sizes are cleared when switching back to Fit.
- **The SVG renders on first display**, never while hidden: a diagram inside a
  hidden container renders at 16px. Initialise Mermaid with `startOnLoad: false`
  and paint explicitly — a restored `localStorage` state can start the figure
  collapsed, and the figure is never measured through a hidden body.
- **`localStorage` persistence** with a `try/catch` — it throws in some
  privacy modes.
- **No page overflow at 390px**, in every state.
- **It degrades**: with JS off, the body is visible or the figure is absent,
  never a blank box.

## Diagrams

- `<pre class="mermaid">` per diagram, initialised once with
  `theme: 'dark'` and `themeVariables` matched to the palette above: panel
  background, text in body colour, primary node border in the accent.
- Render in real Chrome during the check. A Node renderer cannot lay out a
  flowchart and will report a degenerate viewBox (`-8 -8 16 16`) for any graph.
  Read [mermaid-gotchas.md](mermaid-gotchas.md) before writing a figure.
- **Layout by default:** a flat `flowchart LR` with the lane name written into
  each node label, and role colour carrying the grouping. Nested
  `subgraph` + `direction` produces a diagonal staircase and cheap-looking
  boxes; use it only when the actors are genuinely the subject.
- **Node budget:** none. Detail is the point. A wide figure with a viewer and a
  caption that explains how to read it beats a five-node summary of a nine-stage
  process.
- **Every decision is a diamond.** `X{"question?"}`, never `X["question?"]`.
  A figure with no diamonds is a bulleted list that draws arrows.
- **Every node says what happens**, in the page's own vocabulary. The figure and
  the prose must never use two names for the same thing.
- **`<br>` for line breaks, `<b>` for emphasis**, and one convention chosen per
  page — `**bold**` only works with `flowchart: { markdown: true }`.
- **Sequence diagrams** for message exchanges between named parties; their node
  count is the number of messages, and long ones are fine.
- Hand-rolled inline SVG is allowed and sometimes better (annotated numeric
  axes, worked-example tables-as-SVG); keep it consistent with the palette.
- Every diagram: caption, number, and prose reference ("see Figure 2").

## Artifact inventories

When a mechanism produces things, the table is a first-class element, not an
appendix. Four columns, always the same four:

| Artifact | Written by | Read by | Lifetime |
|---|---|---|---|

- Mark scratch, temporary, or git-ignored artifacts distinctly (a muted row or
  an italic name), because "what survives the run" is the reader's real question.
- Wrap wide tables in `<div class="table-scroll">` — a table that pushes the
  page sideways on a phone is a bug, not a style choice. Do not put a
  `min-width` on the inner table.

## Worked examples (quantitative/algorithmic mechanisms)

- Inline in the step-by-step layer, not a separate appendix.
- Formats that work: a small markdown-style table of steps × values, an SVG
  line chart of a value evolving over iterations, or a monospace block with
  numbered lines annotated by side comments.
- Numbers must survive recomputation; show intermediate values, not just the
  final result. Recompute them in a scratch file and read the output — do not
  eyeball arithmetic late in a long build.

## Anti-patterns

- Dashboard chrome (cards, stat tiles, progress rings). This is a document.
- Emoji as structure. Decorative emoji: never more than zero.
- More than one accent hue. Rainbow diagrams.
- Cookie banners, fake "loading" bars, JS frameworks, analytics, or anything
  phoning home beyond the Mermaid/KaTeX CDNs.
- Deleting nodes to make a diagram fit. Widen the figure instead.
- A figure whose nodes are only names (`brainstorming`, `TDD`, `review`).
- Copying a rule from this guide without checking it against the example —
  the example is the calibration, and if they disagree, one of them is wrong.
