# AGENTS.md

This repository is the `explainer` Agent Skill source. No build tooling.

## Structure

- `explainer/` — the installable skill directory (its `name` frontmatter must match the directory name).
- `GLOSSARY.md` — domain terms for the skill (explainer, mechanism, layer, single-file, house style, verified source, worked example).

## Conventions

- `explainer/SKILL.md` speaks in principles and the output contract only; heavy detail lives in `explainer/references/` (style-guide.md, source-rules.md, example.html) and is read on demand.
- Keep `SKILL.md` under ~500 lines. Reference the Agent Skills spec: https://agentskills.io/specification
- `example.html` is the calibration artifact: any change to the style guide or output contract should be reflected there.

## Checks (run manually)

- Open `explainer/references/example.html` in a browser; verify dark theme, TOC scrollspy, Mermaid diagrams, and KaTeX equations all render (CDN-dependent).
- Frontmatter validators: `skills-ref validate ./explainer` (if installed).