---
name: explainer
description: Produce a deep, single-file HTML page explaining a mechanism — how photosynthesis works, how a packet crosses the internet, how Q-learning learns, how a pencil is made — for a curious reader with no prior knowledge. Layered build-up from prerequisites to an in-depth step-by-step mechanism trace, with flowcharts, typeset equations, worked examples, and verified high-quality sources. Use when the user asks "explain how X works", "explain X in detail", "walk me through X", or "how does X work".
license: MIT
compatibility: Requires web access for CDN libraries (Mermaid, KaTeX) and a shell to auto-open the generated HTML file. Output is one self-contained HTML file written to disk.
metadata:
  opencode:
    autoinvoke: "false"
  version: "1.0.0"
---

# explainer

Explain a **mechanism** — a process or system whose operation can be traced step
by step — as a polished, single-file HTML page for a curious reader with no
prior knowledge of the subject.

This skill fixes only two things: the **scope** (mechanisms only)

Read [references/style-guide.md](references/style-guide.md) and
[references/source-rules.md](references/source-rules.md) before generating.
Calibrate depth and tone against the worked artifact in
[references/example.html](references/example.html).

## Scope

In: anything traceable as the operation of a system — algorithms (Q-learning,
TCP/IP), physical products (a pencil, a car), biological processes
(photosynthesis), protocols (TLS handshake), machines.

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

## Output contract

Exactly **one HTML file** is written to disk and delivered. The file is the
deliverable: everything lives inside it (+ CDN libraries — see single-file
below). The filename is a slug of the topic, e.g. `how-q-learning-works.html`.

### Content layers

Structure the page in these layers, each labeled with a heading:

1. **Hook & prerequisites** — why the mechanism matters; what the reader needs
   first, each prerequisite briefly explained in place.
2. **Big picture** — the mechanism end-to-end in one diagram and a few
   paragraphs, before any detail.
3. **The mechanism, step by step** — the deep core. Trace the operation
   concretely, stage by stage, with a flowchart. This layer is what
   distinguishes the page from a summary: depth here, not later. When the
   mechanism is quantitative or algorithmic, include a **worked example** with
   concrete numbers the reader can follow line by line (a small table or
   annotated chart).
4. **Deeper layers** — the key equations (typeset) and what each term means;
   edge cases; the misconceptions a curious person almost certainly holds, and
   why they are wrong.
5. **Further exploration** — where to go next, linked.

Length: roughly **1,500–3,000 words**. Minimum **three diagrams**: the big
picture, the step flowchart, and at least one detail or trade-off diagram.

### Single-file

One `.html` file; no local assets. CDN `<script>`/`<link>` tags are permitted
and normal: **Mermaid** (dark-tuned — see style guide) for flowcharts and
diagrams where suitable, **KaTeX** for typeset equations. Hand-written inline
SVG is fine when it communicates better. All interactive behavior (scrollspy,
nav drawer) is vanilla JS in the file; no external JS frameworks.

### Self-check before delivery

- Every diagram is labeled and labeled consistently with the prose.
- Every equation is typeset (KaTeX or clean HTML), never a loose ASCII string,
  and is introduced in prose (what it says and what each term means).
- Worked-example numbers are actually correct — recompute them.
- The source list supports the claims attributed to it; flag any claim you
  could not verify, per source rules.
- No placeholder text, no TODOs, no lorem ipsum, no "the author".
- HTML loads cleanly in a fresh browser tab: no console errors from the CDN
  tags, navigation works at desktop and mobile widths.

### Delivery

Write the file into the user's current working directory (or wherever they
ask). Then **auto-open** it, best-effort, via the platform shell command
(`open` on macOS, `xdg-open` on Linux, `start` on Windows) in the background
without blocking. If the auto-open fails or the environment is headless, hand
back the file path prominently and move on — this is not an error to fix.
