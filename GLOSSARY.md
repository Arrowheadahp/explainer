# GLOSSARY

## Explainer
A single-file HTML page produced by the `explainer` skill: a deep explanation of a mechanism for a curious reader with no prior knowledge of the subject.

## Mechanism
The subject of an explainer: a process or system whose operation can be traced step by step (e.g. photosynthesis, TCP/IP routing, car manufacturing, Q-learning). The skill's scope is mechanisms only — topics that cannot be traced as the operation of a system (historical events, classificatory subjects) are out of scope.

## Worked example
A small numerical illustration inside the step-by-step layer, mandatory when the mechanism is quantitative or algorithmic: concrete numbers the reader can follow line by line (e.g. actual Q-values changing over episodes).

## Single-file
Output property: everything the explainer page needs lives in one `.html` file. CDN-loaded libraries (Mermaid, KaTeX) are permitted; no other local assets.

## Layer
A depth level of the explainer scaffold: ① hook/prerequisites, ② big picture, ③ in-depth step-by-step mechanism, ④ deeper detail (equations, edge cases, misconceptions), ⑤ further exploration.

## House style
The fixed, style-guide-defined visual identity of explainers: dark theme, serif display headings, one accent color (randomly chosen per page), restrained palette, proper navigation.

## Verified source
A citation from the accepted hierarchy — textbooks/university notes, peer-reviewed papers/official standards, or reputable institutional sources — consulted by the agent, never drawn from parametric memory alone.
