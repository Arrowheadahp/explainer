# explainer

An [Agent Skills](https://agentskills.io/specification) skill that produces a
**deep, single-file HTML page** explaining a mechanism — how photosynthesis
works, how a packet crosses the internet, how Q-learning learns, how a pencil
is made — for a curious reader with no prior knowledge.

The generated page is layered (prerequisites → big picture → in-depth
step-by-step trace with flowcharts and worked examples → equations and
misconceptions → further exploration), written in a fixed dark house style
with proper navigation, and grounded in high-quality verified sources — never
parametric knowledge alone.

## Layout

```
explainer/
├── SKILL.md                  # scope, source rule, output contract, QA gate
├── references/
│   ├── style-guide.md        # dark theme, typography, navigation, diagrams
│   ├── source-rules.md       # source hierarchy, citation + flagging rules
│   └── example.html          # worked example: how the internet delivers a web page
├── LICENSE                   # MIT
└── README.md
```

## Install

### OpenCode

Global:

```bash
git clone https://github.com/<you>/explainer ~/.config/opencode/skills/explainer
```

Per project:

```bash
git clone https://github.com/<you>/explainer .opencode/skills/explainer
```

Invoke explicitly as `@explainer`. The skill sets
`metadata.opencode.autoinvoke: "false"` so it is not triggered implicitly.

### Claude Code

```bash
git clone https://github.com/<you>/explainer .claude/skills/explainer
```

(`/explainer` slash command after restart, or "use the explainer skill".)

### Any other Agent Skills-compliant agent

Clone the repository into the agent's skills location, or any directory
configured as a skills source in that agent's settings:

```bash
git clone https://github.com/<you>/explainer <your-agent-skills-dir>/explainer
```

The skill directory matches the required `name` frontmatter.

## Use

> **@explainer** explain how Q-learning works in detail.

> **@explainer** I want to understand how a pencil is made.

The agent researches the mechanism against verified sources, drafts the
layered page, builds diagrams (Mermaid + KaTeX via CDN, single HTML file),
writes one `.html` to your working directory, and opens it in your browser.

## Requirements

Output-page requirements: web access for the Mermaid/KaTeX CDNs, a modern
browser. Generation requirements: the agent needs web research to source facts.