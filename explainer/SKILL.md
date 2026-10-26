---
name: explainer
description: Produce a deep, single-file HTML page explaining a mechanism — how photosynthesis works, how a packet crosses the internet, how Q-learning learns, how a pencil is made — for a curious reader with no prior knowledge. Layered build-up from prerequisites to an in-depth step-by-step mechanism trace, with detailed diagrams, typeset equations, worked examples, artifact inventories, and verified high-quality sources. Use when the user asks "explain how X works", "explain X in detail", "walk me through X", or "how does X work".
license: MIT
compatibility: Requires web access for CDN libraries (Mermaid, KaTeX) and a shell to auto-open the generated HTML file. Output is one self-contained HTML file written to disk. The optional verification scripts in scripts/ need Node ≥ 18 and a local Chrome/Chromium.
metadata:
  opencode:
    autoinvoke: "false"
  version: "1.1.0"
---

# explainer

Explain a **mechanism** — a process or system whose operation can be traced step
by step — as a polished, single-file HTML page for a curious reader with no
prior knowledge of the subject.

This skill fixes two things. The **scope**: mechanisms only. The **fidelity**:
detail is the deliverable — neither the prose nor the diagrams are capped.

Read [references/style-guide.md](references/style-guide.md) and
[references/source-rules.md](references/source-rules.md) before generating.
Read [references/mermaid-gotchas.md](references/mermaid-gotchas.md) before
writing any diagram. Calibrate depth and tone against the worked artifact in
[references/example.html](references/example.html).

## Scope

In: anything traceable as the operation of a system — algorithms (Q-learning,
TCP/IP), physical products (a pencil, a car), biological processes
(photosynthesis), protocols (TLS handshake), machines, and toolchains or
methodologies whose steps produce artifacts.

Out: topics that cannot be traced as a mechanism — historical events,
classificatory or definitional subjects ("what is depression"). If the request
is not a mechanism, say so and decline or help the user reframe.

## Source rule (absolute)

**Never explain from parametric knowledge alone.** Every factual claim must be
verified against, and every page must cite, sources from the quality hierarchy
defined in [references/source-rules.md](references/source-rules.md):
textbooks and university notes, peer-reviewed work and official standards,
reputable institutional sources. Wikipedia is a discovery tool, never a cited
source. Claims that could not be verified are flagged inline and surfaced in a
page-top banner — never presented as settled fact.

Reading a primary artifact directly (a repository, a specification, a source
file) counts as verification. Cite it by version and commit where the artifact
is versioned, so the claim can be checked again later.

## Figure plan (before you write)

Do this **before the first paragraph**, and state it to the user in a few lines.
Deciding layout after the prose exists means rewriting the prose.

1. **List the figures.** One row each: number, kind (flowchart, sequence,
   state, annotated SVG), what question it answers, which section it sits in.
2. **Name the actors and artifacts** the figures will show, and fix the exact
   wording there. The same terms must appear in the prose and in the nodes.
3. **Choose the layout** for each flowchart: flat `LR` (default), `TD` swimlanes
   when actors — not phases — are the story, or `sequenceDiagram` when messages
   between parties are the point. Read
   [references/mermaid-gotchas.md](references/mermaid-gotchas.md) before
   committing to nested subgraphs.
4. **Estimate the width.** Anything expected wider than about 900px gets the
   collapsible viewer (see *Diagram contract*). Wide is fine;
   wide-and-unlabelled is not.

If the user's question is really "what does this process look like", the figure
plan *is* the deliverable — show it before writing 7,000 words around it.

## Diagram contract

Detail is encouraged. **There is no node cap.** The limit is legibility, and
legibility is solved by layout, lane grouping and a viewer — never by deleting
nodes that carry meaning.

- **Count follows the mechanism.** One figure per distinct sub-mechanism, plus
  one big-picture figure. A mechanism with nine stages gets the overview and a
  figure per hard stage. There is no minimum of three and no maximum.
- **Nodes carry prose, not labels.** A node that says `writing-plans` has told
  the reader nothing. A node that says what that stage *does*, in the figure's
  own words, is the reason the figure exists.
- **Shape vocabulary, consistent across the page:** rectangle = a stage,
  diamond = a decision, rounded = start/end, accent colour = the human, green =
  a produced artifact. A reader learns it on Figure 1 and never re-learns it.
- **Show the humans.** Any pipeline-shaped mechanism gets one `YOU` lane or set
  of accent-coloured nodes marking every point where the run stops for a person:
  approvals, choices, and nothing else. A figure with no human nodes implies the
  process is fully automatic, which is usually false.
- **Show the artifacts.** Any mechanism that leaves by-products names them as
  nodes — split committed from scratch when both exist. This is what makes the
  figure an inventory rather than a recipe.
- **Every figure gets a caption, a number, and a prose reference.** The caption
  states what to read *out* of the figure, not what it depicts.
- **Wide figures get the viewer.** A figure that renders wider than the content
  column ships with a toolbar — `Expand` / `Fit width` / `Natural size` — that
  opens expanded to natural size, persists in `localStorage`, keeps the caption
  visible when collapsed, and never lets the page overflow at 390px. Write it
  once per page and reuse it for every wide figure.

Mermaid carries flowcharts and sequence diagrams; hand-written inline SVG is
better for annotated numeric axes. Both are allowed. The palette rules live in
[references/style-guide.md](references/style-guide.md).

## Output contract

Exactly **one HTML file** is written to disk and delivered. The file is the
deliverable: everything lives inside it (+ CDN libraries — see single-file
below). The filename is a slug of the topic, e.g. `how-q-learning-works.html`.

### Content layers

Structure the page in these layers, each labeled with a heading:

1. **Hook & prerequisites** — why the mechanism matters; what the reader needs
   first, each prerequisite briefly explained in place.
2. **Big picture** — the mechanism end-to-end in one detailed diagram and a few
   paragraphs, before any detail. This figure earns its size: actors, decisions,
   artifacts, and enough nodes to be a map rather than a table of contents.
3. **The mechanism, step by step** — the deep core. Trace the operation
   concretely, stage by stage. This layer is what distinguishes the page from a
   summary: depth here, not later. Give each stage its own subsection, its own
   diagram where the stage is hard, and the state it leaves behind.
4. **Worked example** — mandatory when the mechanism is quantitative or
   algorithmic, and strongly preferred otherwise: one real instance traced
   through every stage with concrete values the reader can follow line by line.
   A mechanism that produces files, records or commits is traced through the
   actual shapes of those artifacts.
5. **Artifact inventory** — mandatory when the mechanism leaves persistent
   by-products. A table of every artifact the process creates: what it is, who
   or what writes it, who or what reads it, and how long it lives. Include the
   by-products the reader would not guess at — scratch files, caches, ledgers,
   lockfiles — and mark which survive the run.
6. **Deeper layers** — the key equations (typeset) and what each term means;
   edge cases; the trade-offs stated plainly; the misconceptions a curious
   person almost certainly holds, and why they are wrong.
7. **Further exploration** — where to go next, linked.

**Length is set by the mechanism, not by a budget.** Prose density is the only
constraint: every paragraph advances the trace, states a mechanism, or surfaces
a trade-off. Volume is unbounded when the mechanism is deep. Do not compress a
deep mechanism to hit a word target, and do not pad a shallow one. A 7,000-word
page that never repeats itself is better than a 2,000-word page that omits the
artifact inventory.

### Single-file

One `.html` file; no local assets. CDN `<script>`/`<link>` tags are permitted
and normal: **Mermaid** (dark-tuned — see style guide) for flowcharts and
diagrams where suitable, **KaTeX** for typeset equations. Hand-written inline
SVG is fine when it communicates better. All interactive behavior (scrollspy,
nav drawer, figure viewer) is vanilla JS in the file; no external JS frameworks.

### Self-check before delivery

Report **measurements, not claims**. If the scripts below are unavailable, run
the equivalent checks and say what they returned.

```bash
node explainer/scripts/verify.mjs page.html
```

- Every figure renders in a browser: a real `viewBox`, a plausible node count,
  no literal `<br>` or `</b>` in any label.
- Every equation is typeset (KaTeX or clean HTML), never a loose ASCII string,
  and is introduced in prose (what it says and what each term means).
- Worked-example numbers are actually correct — recompute them in a scratch file
  and read the output back; do not assert they are right.
- Every inline citation resolves to a source entry; every source is cited;
  anything unverifiable carries the flag from source rules.
- No placeholder text, no TODOs, no lorem ipsum. (Lowercase "todo list" as a
  worked-example subject is fine; an app or a mechanism may be a todo list.)
- The page loads with no console errors, and neither desktop nor a 390px
  viewport scrolls horizontally.

**Screenshot budget: at most six images per session, and each one answers a
specific question.** Prefer numbers (`viewBox`, `scrollWidth`,
`getBoundingClientRect`) to pixels. Runaway screenshots have ended real
sessions: one build reached 31 images and was rejected by the provider mid-task,
losing the rest of the work. Use `scripts/shot.mjs`, which enforces the cap.

### Delivery

Write the file into the user's current working directory (or wherever they
ask). Then **auto-open** it, best-effort, via the platform shell command
(`open` on macOS, `xdg-open` on Linux, `start` on Windows) in the background
without blocking. If the auto-open fails or the environment is headless, hand
back the file path prominently and move on — this is not an error to fix.

Report the page in terms of what it contains: length, figure and node counts,
equation count, source count, and any claim that carries a flag. Mention what
the verification commands returned.
