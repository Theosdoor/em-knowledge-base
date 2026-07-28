---
title: Misalignment Empirics
---

Shared knowledge base for our work on emergent misalignment (EM) and inoculation prompting (IP).

One note per paper, one file per note. The graph shows papers and how they relate; every edge is a link someone wrote a reason for.

## Where things are

- **Papers** — one note per paper, filed under `Papers/`. Reach them via the explorer on the left, the search box, or the graph.
- [[Threat Model]] — backchaining from the threat model to concrete projects.
- [[Project Ideas]] — rough brainstorming.
- [[Open Questions]] — questions for the supervisor and for each other.

## Finding things

- **Search** (top left, or `Ctrl`/`Cmd` + `K`) covers the full text of every note.
- **Graph** (right) shows papers as nodes. Click a node to jump to it; the local graph shows what a paper connects to.
- **Tags** — each paper carries its citekey plus method, topic and model tags (`method/sae`, `topic/backdoors`, `model/qwen`, …). Click any tag to see everything sharing it.

## Note status

Every paper note has a `status`:

| status           | meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `stub`           | metadata and links only, nobody has read it properly yet     |
| `ai-drafted`     | summary written by Opus 5 from the megadoc, unverified       |
| `in-review`      | someone is checking it against the paper                     |
| `human-reviewed` | checked against the paper by a person named in `reviewed-by` |

Sections drafted by Opus 5 keep an inline `*Opus 5*` marker. Empty fields are marked with a `> [!todo]` callout rather than left blank, so gaps are visible.

## Contributing

See `CONTRIBUTING.md` in the repository root for the git workflow and note conventions. Short version: pull before you edit, one paper per file, and when you link two papers write why.
