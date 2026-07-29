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

**Filename is the citekey**: first author's surname in lowercase + the first significant word of the title + year. Skip leading articles.

| Paper                                                     | Citekey              |
| --------------------------------------------------------- | -------------------- |
| Zhao et al., *The Piggyback Hypothesis…*, 2026             | `zhaoPiggyback2026`  |
| Betley et al., *Emergent Misalignment…*, 2025              | `betleyEmergent2025` |
| Dickson, *The Devil in the Details…*, 2025                 | `dicksonDevil2025`   |

The citekey is the paper's identity everywhere: the filename, the node in the graph, and the URL (`/papers/betleyEmergent2025/`). Renaming later is fine — Obsidian updates the links — but it changes the URL, so get it right if you can.

Put the same citekey in `tags`, and a readable `Author Year — Short Title` in `aliases` so search stays usable.

Fill what you know. Leave `> [!todo] Not yet filled in` in the sections you don't — a visible gap is better than a silent one.

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

**Add the mirror bullet on the other note too**, phrased from that paper's point of view. The build prints a warning listing every link written in only one direction, so check the Actions log or your local build output.

## Dates

The graph and the papers list order everything by publication date to the month.

**You do not need to write a date for an arXiv paper.** Modern arXiv ids already encode it — `2502.17424` is February 2025 — so filling in `arxiv` is enough.

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
pnpm dev       # http://localhost:4321/em-knowledge-base/, reloads as you edit
pnpm build     # one-off build into site/dist/
pnpm test      # graph derivation tests
```

The site reads `../Vault` directly, so edits in Obsidian show up on save. Adding a *new* paper file needs a dev-server restart, because the list of citekeys is read once at startup to resolve wikilinks.

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
| `src/lib/graph-model.ts` | derives nodes and edges; pure functions, unit-tested |
| `src/plugins/remark-obsidian.mjs` | wikilinks, `![[embeds]]` and `> [!callout]` blocks |
| `src/scripts/graph.ts` | the 3D graph, search highlighting and reading panel |

Edges currently come from wikilinks only. `graph-model.ts` carries a `weight` field on every edge, fixed at 1, as the place to add tag-weighted edges later without touching the renderer.
