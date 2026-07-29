# Misalignment Empirics

An Obsidian vault of paper notes on emergent misalignment (EM) and inoculation
prompting (IP), published as a graph-first Astro site at
<https://theosdoor.github.io/em-knowledge-base>.

Four people write the notes and push straight to `main`. Every push rebuilds and
deploys. That constraint shapes most of the decisions below.

## Layout

```
Vault/          the notes — the actual content
  Papers/       one file per paper; the filename is the citekey and the node id
  Project/      threat model, project ideas, open questions
  Meta/         the tag registry
  Templates/    the paper-note template
  Assets/       images, embedded as ![[name.png]]
site/           the Astro site that publishes the vault
Archive/        the original Google Docs megadoc, kept for provenance
```

`site/` reads `../Vault` directly through content collections. It is never
copied or generated into.

## Commands

Run from `site/`:

```sh
pnpm dev        # http://localhost:4321/em-knowledge-base/
pnpm build      # into site/dist/
pnpm test       # node --test over src/**/*.test.ts
pnpm tidy       # rename untitled notes to the citekey their citation implies
pnpm citations  # refresh src/data/citations.json from Semantic Scholar
```

`pnpm test` runs TypeScript directly through node's type stripping, which is why
imports inside `src/lib/` and `scripts/` carry explicit `.ts` extensions. Keep
them.

## The note format

A paper note carries a title, a pasted citation and a pasted link. Nothing else
about the paper is typed:

```markdown
---
title: Riché 2026 — Inoculation Adapters
category: mitigations
tags: [method/lora]
---

> Riché, Maxime, Daniel Tan, Vili Kohonen, and Niels Warncke. "Inoculation
> Adapters: Improved Selective Generalization…" arXiv preprint arXiv:2606.30252 (2026).

https://arxiv.org/abs/2606.30252
```

`src/lib/citation.ts` reads authors, year, venue, arXiv id, DOI, both links, the
full title and the citekey out of those two lines. `resolvePaper` in
`graph-model.ts` merges them: **frontmatter always wins**, parsing only fills
what nobody wrote. Never invert that — a hand-corrected author list must survive
a citation that disagrees with it.

When changing the parser, run it across the whole vault, not just the tests. Its
correctness claim is that it reproduces every citekey already in `Vault/Papers/`,
and there is a test asserting exactly that.

## Edges are directed

`## Related Papers` lists what *this* paper draws on. The arrow runs from the
note that wrote the bullet to the paper it names. There are no mirror bullets:
the far end grows a **Referenced by** entry derived in `backlinks()`.

Do not reintroduce a warning about links written in one direction. One direction
is now the correct and expected state; the old `findOneWayLinks` was removed for
that reason.

A pair that links to each other is `mutual` and draws without an arrow. Citation
edges (`kind: 'cites'`) come from `src/data/citations.json` and draw thin against
the reasoned links' heavier line; a reasoned link always replaces the citation
edge for the same pair.

Both renderers place arrowheads against force-graph's own idea of a node's
radius, which is why each sets `nodeVal` to match the radius we actually paint.
Change `nodeRadius` and those have to change with it, or every arrow hides
underneath the circle it points at.

## Nothing a note author types may break the build

This is the hardest rule here. Every frontmatter field is optional and every one
tolerates the shapes a half-filled template makes — `title:` with nothing after
it is YAML `null`, and a `tags:` list with one blank bullet is `[null]`. See the
preprocessing helpers in `content.config.ts`. A schema change that can throw on
a stub is a bug, however well-formed the note "should" have been.

Problems are reported, never thrown: the build prints duplicates, filename
mismatches and uncited notes via `vaultIssues`, and the dev toolbar's **Vault**
panel shows the same list while someone writes.

## Conventions in the site code

- `src/lib/` is pure and unit-tested: no Astro imports, no `astro:content`.
  Anything needing collections goes in `src/lib/graph.ts` instead.
- Appearance decisions live in `src/scripts/appearance.ts` so the 2D and 3D
  renderers cannot disagree about what the graph means.
- Comments explain why a decision was made, not what the line does. The existing
  ones set the standard; match it rather than adding narration.
- British spelling in prose and identifiers (`normalise`, `colour`).
- No dependency is added without a reason that survives being asked twice. The
  citation parser is hand-written for this reason.
