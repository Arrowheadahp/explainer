# Source rules for explainers

The whole page rests on this rule: **the agent never explains from parametric
knowledge alone**. Research, verify, then write; the page's `Sources` section
is load-bearing, not decorative.

## Research discipline

- Prefer searching and reading sources over recalling them.
- Search to *discover*; verify claims against what a source actually says.
- If the environment has no web access, say so upfront, write the page anyway
  (the user experience of a draft beats nothing), and apply the flagging rule
  below aggressively.

## Quality hierarchy (cited sources only)

1. **Textbooks & university course material** — standard texts, lecture notes
   from recognized universities.
2. **Peer-reviewed literature & official standards** — journal articles,
   conference papers, RFCs, ISO/IEC/specification documents.
3. **Reputable institutional sources** — NASA, NIST, NIH, major manufacturers
   and operators describing their own processes, national academies.

**Not citable:** Wikipedia, personal blogs, random YouTube, AI-generated
content, undated commercial listicles. Wikipedia's value is its lead references
— mine those, then cite the primary source it points to.

## Citation format

- Cite **inline** — a small footnote-style superscript or `<sup>` link — at
  each claim cluster that a source supports, linking to the entry (e.g. `[3]`)
  in the sources section.
- End of page: a numbered **Sources** section. Each entry: author/source
  title, what it supports in one phrase ("this claim was checked against the
  textbook's discussion of graphite production"), and the URL.
- Three to eight sources typically suffices for a full explainer; layered
  topics may need more.

## Unverifiable claims

- A claim with no reachable qualifying source gets an **inline flag** — a
  `<mark>`-style annotation in accent-muted color reading "inferred, not
  verified here".
- If **any** part of the page is flagged, add a visible banner at the top:
  one sentence stating that the page includes unverified claims and linking to
  how they are flagged. No page-wide lie of "everything checked" when it isn't.
- Never dress inference as citation. Rough-number-of-the-market-type claims
  ("a pencil line runs ~X m/min") come from a source or carry the flag.

## Numbers

- All quantitative facts (throughput, latency figures, temperatures, doses)
  need a source or a flag.
- Worked examples may use individually computed numbers, but the *inputs*
  (constants, unit costs, parameters) are sourced or flagged.
