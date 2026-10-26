# GLOSSARY

## Explainer
A single-file HTML page produced by the `explainer` skill: a deep explanation of a mechanism for a curious reader with no prior knowledge of the subject.

## Mechanism
The subject of an explainer: a process or system whose operation can be traced step by step (e.g. photosynthesis, TCP/IP routing, car manufacturing, Q-learning). The skill's scope is mechanisms only — topics that cannot be traced as the operation of a system (historical events, classificatory subjects) are out of scope.

## Layer
A depth level of the explainer scaffold: ① hook/prerequisites, ② big picture, ③ in-depth step-by-step mechanism, ③b worked example, ③c artifact inventory, ④ deeper detail (equations, edge cases, misconceptions), ⑤ further exploration. Layers ③b and ③c are conditional on the mechanism: mandatory when it is quantitative/algorithmic or leaves persistent by-products, respectively.

## Artifact inventory
The table of every by-product a mechanism creates, with four fixed columns: what it is, who or what writes it, who or what reads it, and how long it lives. Mandatory when the mechanism leaves things behind (caches, sockets, files, commits, ledgers). The point of the table is that the expensive work is *creating* artifacts and the fast path is *reusing* them.

## Figure plan
The pre-writing step that fixes the figure set before any prose exists: one row per figure (kind, question answered, section), the exact actor and artifact vocabulary the figures will use, the Mermaid layout for each flowchart, and which figures are expected to be wide enough to need the viewer. Recorded and shown to the user in a few lines. Exists because deciding layout after the prose is written means rewriting both.

## Diagram contract
The rules that make detailed diagrams possible: no node cap, nodes carry prose rather than labels, every decision is a diamond, humans and artifacts each get visible representation, every figure is numbered and captioned, and wide figures ship with the viewer. Detail is encouraged; illegibility is solved by layout, not by deleting nodes.

## Viewer
The toolbar that accompanies any diagram wider than the content column: Expand / Fit width / Natural size, opening at natural size, persisted in `localStorage`, caption always visible, one scroll container only, no page overflow at 390px. A house-style fixture, not an enhancement.

## Worked example
A small numerical illustration inside the step-by-step layer, mandatory when the mechanism is quantitative or algorithmic: concrete numbers the reader can follow line by line (e.g. actual Q-values changing over episodes, or the round trips that add up to a page load).

## Single-file
Output property: everything the explainer page needs lives in one `.html` file. CDN-loaded libraries (Mermaid, KaTeX) are permitted; no other local assets.

## House style
The fixed, style-guide-defined visual identity of explainers: dark theme, serif display headings, one accent color (chosen per page), restrained palette, proper navigation, role colors in diagrams (accent = human, green = artifact), and the viewer for wide figures.

## Verified source
A citation from the accepted hierarchy — textbooks/university notes, peer-reviewed papers/official standards, or reputable institutional sources — consulted by the agent, never drawn from parametric memory alone. A primary artifact read directly (a repository at a named commit, a specification) is also a verified source.
