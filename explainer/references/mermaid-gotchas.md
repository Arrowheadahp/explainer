# Mermaid and KaTeX gotchas

Every entry here cost turns in a real explainer build. Read this before writing
a diagram, not after it looks wrong.

Two rules sit above all of them:

1. **Chrome is the only judge of layout.** Parse in Node to catch syntax errors;
   never trust a Node renderer for geometry. A jsdom-based renderer reports a
   degenerate `viewBox` (`-8 -8 16 16`) even for a two-node graph, because it
   has no layout engine and stubs `getBBox`.
2. **Measure before you look.** `verify.mjs` prints viewBox, node count and
   overflow width. A screenshot answers "does it look right"; numbers answer
   "did that change take effect". Reach for the second one first.

## Layout

### Nested `direction` inside a subgraph produces a staircase

`flowchart LR` holding subgraphs that each declare `direction TB` does not give
you three parallel lanes. Mermaid ranks the subgraph nodes as a single flow and
stacks the boxes diagonally. Measured on a real six-phase graph:

```
LR with 6 subgraphs + direction TB  -> viewBox 6762 x 1064
real content band                    ->    ~218px tall, sitting at y=754
```

A 1,064px-tall figure for 218px of content — mostly dead space, and the phases
read as disconnected columns rather than a sequence.

**Fix:** drop the subgraph boxes. Put the lane name inside each node's label
(`**YOU** · …`, `**ARTIFACT** · …`) and colour by role with `style`. A flat
`flowchart LR` with 18–30 nodes lays out as one readable band:

```
flowchart LR
  U0["<b>YOU</b> · type example.org"] --> P1["<b>1 · DNS</b><br/>resolve the name"]
  P1 --> P1a{"answer cached?"}
  ...
  style U0 fill:#161b22,color:#4fc3f7,stroke:#4fc3f7
  style A1 fill:#161b22,color:#7ee787,stroke:#7ee787
```

If the mechanism genuinely needs swimlanes (actors are the point, not phases),
use `flowchart TD` with `subgraph` per actor and accept a tall figure — but then
the figure needs the viewer, and the outer flow should be vertical.

### A wide `LR` graph is not a defect

Six thousand pixels wide is fine. It is a *figure that scrolls*, not a figure
that failed. Give it the viewer (Fit / Natural / Collapse) and a caption that
says to scroll sideways. Do not delete nodes to make it fit.

## Markup inside node labels

### `textContent` silently drops `<br>`; `innerHTML` escapes `-->`

Capturing a diagram's source before Mermaid rewrites the DOM looks like:

```js
const pre = document.querySelector('#fig-1 pre.mermaid');
pre.dataset.src = pre.textContent;   // wrong: "skillline two" (breaks gone)
pre.dataset.src = pre.innerHTML;     // wrong: "A --&gt; B" (arrows escaped)
```

Confirmed in Chrome on `<pre>A --> B<br/>C</pre>`:

| read | result |
|---|---|
| `textContent` | `A --> BC` |
| `innerHTML` | `A --&gt; B<br>C` |

`<br/>` parses to `<br>`; the breaks survive in `innerHTML` but the arrow is
re-serialised as an entity for round-tripping. Neither view is directly usable.

**Fix:** capture `innerHTML`, then unescape it before handing it back to Mermaid.

```js
pre.dataset.src = pre.innerHTML.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
```

Better still: **do not re-render at all.** See "hidden diagrams" below.

### `**bold**` needs config; `<b>` does not

`**text**` is printed literally unless `flowchart: { markdown: true }` is set.
`<b>text</b>` and `<br>` work with the default `securityLevel`. Pick one
convention per page — mixing them means one of them renders as literal
characters somewhere and you will not notice until you look closely.

### `{` and `}` in labels

A node written `D["Status?"]` is a rectangle. `D{"Status?"}` is a diamond. Use
the diamond for every decision — it is the only visual cue that a branch exists,
and a figure with no diamonds reads as an assembly line.

## Hidden diagrams

### A diagram in a hidden container renders at 16px

If a figure starts collapsed (`display:none` or `hidden`), Mermaid measures its
container as zero and emits:

```html
<svg width="100%" style="max-width: 16px;" viewBox="-8 -8 16 16">
```

Every node is still in the DOM, so nothing looks broken in the markup. It is
only visible as a tiny stub when expanded.

**Fix:** initialise with `startOnLoad: false` and render explicitly on first
expansion:

```js
let painted = false;
const paint = async () => {
  if (painted || figureBody.hidden) return;
  painted = true;
  const { svg } = await mermaid.render('fig-1-svg', sourceMarkup);
  pre.innerHTML = svg;
  sizeToViewBox();          // see "natural size" below
};
```

Render unconditionally on first expand. Do not keep a "the viewBox looked sane,
so we are done" flag — that guard is exactly how a degenerate first render
survives.

### Never render into the element you are measuring

Reading `innerHTML` after Mermaid has already run gives you Mermaid's SVG, not
your source. Capture once, in a classic `<script>` that runs at parse time
(module scripts are deferred), before the module imports Mermaid.

## Scroll containers

### Two nested scrollers swallow the scroll

The house style gives `<pre>` an `overflow-x: auto`. A figure wrapper that also
scrolls silently loses the gesture to the inner element: the outer box never
scrolls, and the content appears clipped at the left edge.

**Fix:** exactly one scroll container.

```css
.fig-body { overflow: auto; max-height: 85vh; }
.fig-body > pre.mermaid { overflow: visible; margin: 0; }   /* inner never scrolls */
```

### `width="100%"` on the SVG has nothing good to resolve against

Mermaid emits `width="100%"`. Inside a `<pre>` that is sized by its content, that
is circular: the `<pre>` shrinks to fit, so the SVG resolves to 0px. Natural
size needs the SVG pinned to its own viewBox in pixels:

```js
const [, , w, h] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
svg.style.width = `${w}px`;
svg.style.height = `${h}px`;
```

Clear those inline sizes when switching back to Fit, or Fit inherits the
natural width and overflows the page.

### `display: flex` on the scroller centres an oversized child

`align-items: flex-start` does not reliably top-align a child wider than the
container. Use plain block layout for the figure body.

## Measurement

### `document.querySelectorAll('b')` finds nothing inside an SVG

SVG elements live in the SVG namespace, so HTML tag selectors miss them. Query
`.nodeLabel` and inspect its `innerHTML`, or use `svg.querySelectorAll('foreignObject b')`.

### `getBBox()` on a node is not a page coordinate

It returns the box in the node's own transformed space, so x/y values can be
negative while the node is visibly on the right of the page. For position on the
page use `getBoundingClientRect()`.

### Single-line labels are usually correct

Subgraph titles, phase headers and start nodes are legitimately one line.
Flagging them as "run-together text" sends you hunting a bug that is not there.
The real signal for dropped markup is a literal `</b>` or `}` in the text, or two
words jammed with no space where the source had `<br>`.

## KaTeX

### Grep for delimiters will match your own config script

The auto-render setup contains `left:'\\['`, and a naive scanner over the file
picks that up as an equation, then reports a parse error that does not exist.
Extract expressions from rendered DOM (`.katex`, `.katex-error`) or exclude
`<script>` bodies before matching.

### Display equations push the page wide on mobile

A long `\[ ... \]` renders wider than a 390px column and creates horizontal
overflow on the whole document. Contain it:

```css
.katex-display { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; }
```

### Wide tables do the same thing

```html
<div class="table-scroll"><table>...</table></div>
```

with `.table-scroll { overflow-x: auto; }`. Do not set a `min-width` on the
inner table — it re-creates the overflow you were containing.
