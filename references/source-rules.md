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

## Reading the artifact itself

For mechanisms that are themselves artifacts — a codebase, a protocol
implementation, a configuration format, a toolchain — the artifact is the
strongest available source, and it outranks commentary about it.

- **Cite it by version and commit** where it is versioned (`v7.0.1`, commit
  `2ce8aa1`), so a reader can check the claim against the same tree.
- **Quote what the artifact says, not what it is said to say.** If a document
  claims a word limit, a node cap, or a rule, the claim is only verified if you
  found that rule in the text. Several plausible rules turn out to be invented
  on closer reading.
- **Distinguish reading from running.** A rule you read in source is verified;
  behaviour you infer from reading it is not, until you run it. Mark inferred
  behaviour as inferred.
- Repository READMEs and release notes are the maintainers' own words —
  institutional-level, citable, but check them against the code they describe.

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
- **Constructed examples must say they are constructed.** If a worked example
  uses illustrative identifiers, commit SHAs, line counts or test counts to show
  an artifact's *shape* rather than recording a real run, that is legitimate —
  but it is stated in the sources section and, where it matters, in the prose.
  Do not let a plausible-looking example read as a transcript.
