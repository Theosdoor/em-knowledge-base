# Contributing

The notes live in `Vault/`. Everything in `site/` is the static site that publishes them to <https://theosdoor.github.io/em-knowledge-base>.

If you are only writing notes, you never need to touch `site/`. Obsidian and git are enough.

## First-time setup

In Obsidian: **Open folder as vault** → pick `em-knowledge-base/Vault`. The `.obsidian` settings are committed, so you get the same enabled plugins as everyone else.

Only if you want to preview the site locally:

```sh
git clone https://github.com/Theosdoor/em-knowledge-base.git
cd em-knowledge-base/site
pnpm install
```

## Day-to-day

We all push straight to `main`. No branches, no PRs. One paper per file keeps conflicts rare, but:

```sh
git pull --rebase        # ALWAYS before you start editing
# ... edit in Obsidian ...
git add -A && git commit -m "add Betley 2025 emergent misalignment note"
git push
```

Every push to `main` rebuilds and redeploys the site (~1 min). Check the Actions tab if it doesn't appear.

If you get a conflict, it will be inside one note. Resolve it in a text editor — the frontmatter is plain YAML and the body is plain Markdown.

Nothing you write in a note can break the build. Frontmatter fields are all optional and missing ones render as gaps, so a half-finished stub is safe to push.

## Adding a paper

Copy `Vault/Templates/Paper Note.md` (Obsidian: `Ctrl`/`Cmd` + `P` → *Insert template*) into `Vault/Papers/`.

A note needs three things typed into it: a **title**, the **citation** pasted into the blockquote at the top, and the **link** on the line under it.

```markdown
---
title: Riché 2026 — Inoculation Adapters
category: mitigations
tags:
  - method/lora
---

> Riché, Maxime, Daniel Tan, Vili Kohonen, and Niels Warncke. "Inoculation Adapters:
> Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors."
> arXiv preprint arXiv:2606.30252 (2026).

https://arxiv.org/abs/2606.30252
```

Everything else is read out of those two lines by `src/lib/citation.ts`: the author list, the year, the venue, the arXiv id, the publication month, the abs and pdf links, and the full title for search. None of it goes in the frontmatter. If you do write a field in — because a citation was wrong, or a venue needs correcting — yours wins and nothing overwrites it.

Two links are the exception, because no citation carries them: a **writeup** and a **repository**. Fill those in as properties — Obsidian shows them in the panel at the top of the note, and the template already lists them:

```yaml
blog: https://www.lesswrong.com/posts/…
code: https://github.com/…
```

Both then show in the paper header as `blog ↗` and `code ↗`, beside `abs ↗` and `pdf ↗`. Much of this literature is read as a LessWrong post first and a paper second, and half of it only means anything if you can run it, so neither belongs buried in `## Notes`.

Labelled links in the citation are still read where they appear — `[abs]`, `[pdf]` and `[report]` for the paper, `[blog]` and `[code]` for the other two — so a citation you paste with them already in it needs no further typing. A property always wins over a label. Neither `[blog]` nor `[code]` is ever treated as the paper's own address.

Some of this work only ever appeared as a post, and those notes are as real as the arXiv ones: paste the post's URL as the note's link in the usual place. A LessWrong or Alignment Forum address is shown as `blog ↗` wherever it comes from, because `paper ↗` and `abs ↗` have to mean an abstract or a pdf — something you can cite — or the label tells you nothing.

Every paper note carries the same properties in the same order, most of them empty. That is deliberate: the panel looks identical on every note, so an empty `code` reads as "nobody has found the repository" rather than "this note is older than the field". Leave the ones you have nothing for alone — an empty property and an absent one mean the same thing to the site.

`title` is the short name the graph labels the paper with. Leave it empty and it becomes `Surname Year — Title up to its colon`, which is usually right; fill it in when it isn't.

**Filename is the citekey**: first author's surname in lowercase + the first significant word of the title + year, skipping leading articles.

| Paper                                                     | Citekey              |
| --------------------------------------------------------- | -------------------- |
| Zhao et al., *The Piggyback Hypothesis…*, 2026             | `zhaoPiggyback2026`  |
| Betley et al., *Emergent Misalignment…*, 2025              | `betleyEmergent2025` |
| Dickson, *The Devil in the Details…*, 2025                 | `dicksonDevil2025`   |

You do not have to work that out. `pnpm tidy` derives it from the citation and renames the file, so leaving Obsidian's `Untitled` and pasting a citation is a complete first step. It only renames untitled notes by default; `pnpm tidy --all` also renames a note whose name disagrees with its citation, which changes that note's published URL.

The citekey is the paper's identity everywhere: the filename, the node in the graph, and the URL (`/papers/betleyEmergent2025/`).

Fill what you know. Leave `> [!todo] Not yet filled in` in the sections you don't — a visible gap is better than a silent one.

## Two notes about one paper

The worst thing that can happen to this vault: one paper written up twice under two citekeys, splitting its connections across two nodes so neither shows the whole picture.

Nothing prevents it, because nothing should refuse a note. The build prints it instead, matching on arXiv id, DOI and title, and the **Vault** panel in the dev toolbar lists it while you write.

## Tags

Take tags from `Vault/Meta/Tag Registry.md`. Because every approved tag sits in that note's own frontmatter, Obsidian's autocomplete offers exactly those when you type in a `tags:` field — no plugin needed.

Nothing enforces this. The site builds whatever you write, and the tags page marks anything unregistered so it's visible. To add a tag, add it to the registry in the same commit that first uses it, with a line saying what it means.

Tags drive the blue highlight in search. They do not create edges in the graph.

## Linking papers

Papers are the only nodes in the graph. Edges come from the `## Related Papers` section, and **every edge needs a reason**:

```markdown
- [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] — both argue narrow
  finetuning re-activates existing structure rather than teaching something new.
  Zhao localises the carrier to the chat-template prefix; Soligo characterises
  the general solution's stability.
```

A bare `[[link]]` with no explanation is worse than no link — it makes the graph look connected without telling anyone why.

Wikilinks elsewhere in a note are fine, but only the ones under `## Related Papers` become edges.

### Links point one way

List the papers *this* one draws on, and stop there. Do not write a mirror bullet on the other note.

The relationship usually is not symmetric, and pretending it is loses information. Farrelly 2026 stress-tests inoculation prompting, so it draws on Tan 2025 — but Tan does not draw on Farrelly, and could not have. Writing it in both places would claim otherwise.

What links to a paper turns up on that paper's page by itself, under **Referenced by**, quoting the reason the *other* note gave. Nobody types it, and a paper cannot know in advance what will later build on it.

An arrow in the graph is a one-way link. A plain line is a pair that wrote about each other, which happens and is fine — it just means neither is downstream of the other.

### Citation edges

`pnpm citations` asks Semantic Scholar which papers in the vault appear in each paper's reference list, and writes the answer to `site/src/data/citations.json`, which is committed. Those become the faint dashed lines.

They exist so that nobody has to transcribe a bibliography by hand to make the graph honest. They carry no reason, because a reference list gives none. A `## Related Papers` bullet always replaces the dashed line for that pair — an argument outranks a fact about a bibliography.

Run it after adding a batch of papers. A paper Semantic Scholar has never heard of keeps whatever edges it had, so a failed lookup never quietly deletes anything.

## Dates

The graph and the papers list order everything by publication date to the month.

**You do not need to write a date for an arXiv paper.** Modern arXiv ids already encode it — `2502.17424` is February 2025 — and the id comes out of the citation, so pasting the citation is enough.

For anything else (OpenReview, a journal, a workshop), add it explicitly:

```yaml
date: 2026-03    # YYYY-MM
```

An explicit `date` always wins over the arXiv id. A paper with neither sorts by year alone, below every dated paper of that year, and the papers list flags how many are in that state.

## Provenance

Sections drafted by Opus 5 carry an inline `*Opus 5*` marker. When you verify a section against the paper, delete the marker and put your name in `reviewed-by`.

There is no `status` field. It was neither necessary nor enforced, and a note that says `ai-drafted` for a year is worse than no claim at all — the `*Opus 5*` markers already say which prose nobody has checked.

## Previewing the site

```sh
cd site
pnpm dev        # http://localhost:4321/em-knowledge-base/, reloads as you edit
pnpm build      # one-off build into site/dist/
pnpm test       # graph and citation-parsing tests
pnpm tidy       # rename untitled notes to their citekey
pnpm citations  # refresh the bibliography edges
```

The site reads `../Vault` directly, so edits in Obsidian show up on save — including brand-new notes, which appear without a restart.

The **Vault** panel in the dev toolbar (bottom of the browser window, magnifier icon) lists what needs attention: duplicated papers, filenames that disagree with their citation, notes with no citation yet, and links pointing at papers nobody has written up. Each name is a link that opens the note in Obsidian.

## Images

Put them in `Vault/Assets/` and embed with `![[filename.png]]`. Name them after the paper: `minegishi-2026-feature-geometry.png`.

## What not to commit

`.gitignore` handles `node_modules/`, `site/dist/` and Obsidian's per-machine `workspace.json`. The rest of `.obsidian/` is shared on purpose — if you change a setting everyone gets it, so mention it.

`Archive/` holds the original Google Docs megadoc this vault was split out of. Leave it alone; it is there for provenance, and it is excluded from the published site.

## How the site works

`site/` is an [Astro](https://astro.build) project. The parts worth knowing:

| Path | Does |
| --- | --- |
| `src/content.config.ts` | reads `../Vault` as content collections |
| `src/lib/citation.ts` | reads a pasted citation into authors, year, venue, ids and the citekey |
| `src/lib/graph-model.ts` | derives nodes, edges and backlinks; pure functions, unit-tested |
| `src/plugins/remark-obsidian.mjs` | wikilinks, `![[embeds]]` and `> [!callout]` blocks |
| `src/plugins/remark-paper-head.mjs` | takes the pasted link out of the body; the header renders it |
| `src/integrations/vault-status.mjs` | the dev-toolbar panel |
| `src/scripts/graph.ts` | the graph, search highlighting and reading panel |
| `scripts/citations.mjs` | refreshes `src/data/citations.json` from Semantic Scholar |
| `scripts/tidy.mjs` | renames notes to the citekey their citation implies |

Edges carry a `kind` — `related` for a reasoned link, `cites` for a bibliography one — and a `weight` the renderers map to line thickness. Tag-weighted edges would go in the same place, as `3 * isLinked + sharedTagCount`, without touching either renderer.
