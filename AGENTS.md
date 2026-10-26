# AGENTS.md

This repository is the `explainer` Agent Skill source. No build tooling.

## Structure

- `explainer/` — the installable skill directory (its `name` frontmatter must match the directory name).
  - `SKILL.md` — principles, figure plan, diagram contract, output contract.
  - `references/style-guide.md` — house style, including the wide-figure viewer.
  - `references/source-rules.md` — citation discipline and the source hierarchy.
  - `references/mermaid-gotchas.md` — layout, label-markup, hidden-render and measurement traps.
  - `references/example.html` — the calibration artifact.
  - `scripts/verify.mjs`, `scripts/shot.mjs`, `scripts/README.md` — optional measurement helpers.
- `GLOSSARY.md` — domain terms for the skill.

## Conventions

- `explainer/SKILL.md` speaks in principles and the output contract only; heavy detail lives in `explainer/references/` and is read on demand.
- Keep `SKILL.md` under ~500 lines. Reference the Agent Skills spec: https://agentskills.io/specification
- **`example.html` is the calibration artifact.** Any change to the style guide, the diagram contract or the output contract must be reflected there. If the prose and the example disagree, the next generation follows the example — so a prose-only change is an incomplete change.
- The skill has no node cap and no word cap. Detail is the deliverable; legibility is solved by layout and the figure viewer, never by deleting nodes.

## Checks (run manually)

```bash
# one-time, outside the repo:
#   mkdir -p /tmp/explainer-tools && cd /tmp/explainer-tools && npm init -y && npm i puppeteer mermaid katex --no-save

node explainer/scripts/verify.mjs explainer/references/example.html
node explainer/scripts/verify.mjs <generated-page>.html
```

Expected: PASS on `example.html` with 4 diagrams, 0 warnings.

Screenshots, if genuinely needed, are capped:

```bash
node explainer/scripts/shot.mjs <page>.html --n 3
```

Six images per run maximum, and each one should answer a specific question. Prefer the numbers `verify.mjs` prints.

- Frontmatter validators: `skills-ref validate ./explainer` (if installed).
