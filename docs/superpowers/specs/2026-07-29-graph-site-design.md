# Graph-first site for the EM knowledge base

Date: 2026-07-29
Status: approved

## Problem

Four collaborators write paper notes in an Obsidian vault (`Vault/`). Everyone else
should be able to read the results on a website. The current site is built with
Quartz and does not do what is wanted.

Three requirements drove the redesign, and each of them fights Quartz directly:

| Requirement | Quartz behaviour |
| --- | --- |
| The graph *is* the main page, full-bleed | Graph is a sidebar component in a fixed layout |
| One node per paper, nothing else | Tags become nodes too |
| Search highlights nodes live, in two colours | Search is a full-text modal that navigates away |

Meeting the requirements inside Quartz would mean forking its graph plugin, forking
its search, and overriding its layout — writing the whole application anyway, but
inside a vendored 291-line-config build system that already broke once on the
subpath deploy. The only thing Quartz contributes for free is markdown-to-HTML for
13 files, which is the easy part.

**Decision: remove Quartz entirely and build a small static site.**

## Scope

In scope:

- Full-bleed graph as the landing page, one node per paper.
- Live search that highlights nodes in two colours as the user types.
- A reading panel that opens beside the graph without unmounting it.
- Static pages for the non-paper notes in `Vault/Project/` and a help overlay.
- A tag registry note that makes the approved tag set discoverable in Obsidian.
- Rewritten GitHub Pages deploy, and removal of all Quartz files.

Out of scope:

- Tag-derived edges. The data model reserves a place for them (see Edge model) but
  they ship switched off.
- Any build-time validation of tags or frontmatter. Explicitly declined: a
  half-written stub must never break the build or block anyone's push.
- Full-text search over note bodies. Search covers bibliographic fields and tags.

## Decisions and their reasons

### Edges come from wikilinks only, not shared tags

Measured against the real vault:

```
78 possible pairs among 13 papers
  >=1 shared tag  ->  61 edges  (78% density)  hairball
  >=2 shared tags ->  29 edges  (37%)
  >=3 shared tags ->  16 edges  (21%)
explicit Related-Papers wikilinks -> 23 pairs
```

`topic/mitigations` sits on 10 of 13 papers and would alone produce 45 edges. Tag
edges reproduce the "not what I wanted" problem and get worse as the vault grows.

Wikilinks alone give 23 edges, degree range 2–7, and **no isolated nodes** — a
readable graph where every edge is one a human wrote a reason for.

### Three visual channels, kept independent

Search highlighting must never collide with review status, so each gets its own
channel:

| Channel | Encodes |
| --- | --- |
| Colour | recency at rest, search state under a query |
| Radius | degree; `tanInoculation2025` at 9 links is visibly the hub |
| Glow | selection |

Colour carries two different meanings, but never at the same time. At rest the
graph reads as a timeline: a green ramp from the oldest paper in the collection
to the newest, on by default and toggleable from the top bar. The moment a query
is typed the two search accents take the channel back. Three colour systems
competing for one channel would be unreadable; two that alternate are not.

Selection glows rather than recolouring, for the same reason.

A `status` field (`stub` / `ai-drafted` / `in-review` / `human-reviewed`) was
built and then removed at the user's request: it was not enforced, and a note
left saying `ai-drafted` for a year claims less than nothing. The inline
`*Opus 5*` markers already mark unverified prose.

### Search matches on substring, name beats tag

| State | Rule | Fill |
| --- | --- | --- |
| name | substring in `authors`, `title`, `aliases` or `year` | accent A |
| tag | substring in any tag | accent B |
| both | name wins | accent A |
| miss | query non-empty, nothing matched | dimmed to ~20% |
| rest | query empty | neutral |

Matched nodes force their labels visible; missed nodes drop labels entirely, so
typing reads as the graph resolving into the papers you meant.

Substring rather than whole-word so the graph reacts mid-word. Typing `wang`
lights both Wang papers; `2025` lights all three 2025 papers; `inocul` lights Tan
and Riche by title (accent A) and three more by `method/inoculation-prompting`
(accent B).

### Reading opens a panel, not a new page

The graph stays mounted and the clicked node's neighbourhood stays emphasised while
reading. The URL still updates to `/papers/<citekey>`, so links are shareable and
each paper is a real static page for anyone arriving cold or crawling.

### Tag registry is a reference, not a gate

Obsidian cannot restrict tags to a list; no core feature does it and plugin
approaches are bypassable by editing frontmatter directly. Real enforcement could
only live in CI, and CI enforcement was declined.

`Vault/Meta/Tag Registry.md` therefore carries every approved tag in its own
frontmatter. Because Obsidian's tag autocomplete draws from all tags present in the
vault, the registry alone makes the approved set appear as suggestions while typing,
with no plugin to install. Its body is a glossary, published as a page.

Per-paper citekey tags (`zhaoPiggyback2026`) stay in the vault but are filtered out
of the tag set at build time, so they never appear in the glossary or produce
tag-colour matches. The rule is: drop any tag equal to the note's filename.

### Publication dates come from the arXiv id where possible

Ordering by recency needs month granularity, but asking four people to look up and
maintain a date on every note invites drift. Modern arXiv identifiers already encode
it as `YYMM.NNNNN`, so `2502.17424` is February 2025 and 15 of the 17 notes need no
date field at all.

Precedence: an explicit `date: YYYY-MM` in the frontmatter, then the arXiv id, then
the year alone. A year-only paper sorts below every dated paper of that year, which
is the honest position for a month nobody has recorded, and `/papers/` reports how
many are in that state rather than hiding them at the bottom.

### Frontmatter schema is permissive

Every field is optional. Missing values render as gaps in the UI. This is the same
principle as declining tag enforcement — a stub someone is midway through writing
must not break `main`.

## Architecture

```
EM_knowledge_base/
|-- Vault/              collaborators live here; untouched by the site
|   |-- Papers/*.md     one file per paper -> one node
|   |-- Project/*.md    pages, never nodes
|   |-- Meta/Tag Registry.md
|   |-- Assets/         images
|   `-- index.md        source of the help overlay
|-- site/               pnpm + Astro application
`-- docs/specs/
```

Stack, versions confirmed 2026-07-29:

| Package | Version | Role |
| --- | --- | --- |
| pnpm | 11.3.0 | package manager |
| astro | 7.1.5 | static site, content collections, markdown pipeline |
| @astrojs/markdown-remark | 7.2.1 | the `unified()` processor |
| tailwindcss | 4.3.3 | styling, via `@tailwindcss/vite` |
| 3d-force-graph | 1.80.0 | WebGL graph, d3-force physics |
| three-spritetext | 1.10.0 | node labels |

Tailwind 4 has no `@astrojs/tailwind` integration; it is a Vite plugin plus
`@import "tailwindcss";` in a global stylesheet. `pnpm astro add tailwind` wires both.

Astro 7 defaults to the Sätteri markdown processor, which does not take remark
plugins. The Obsidian dialect needs remark, so `markdown.processor` is set to
`unified()` from `@astrojs/markdown-remark`.

Astro 7's `glob()` loader accepts a `base` anywhere on disk, so the vault is read in
place at `../Vault/Papers` and never moves into `src/`. Its default id generator
lowercases, which would break `[[zhaoPiggyback2026]]`, so `generateId` is overridden
to keep the filename exactly.

The graph is 3D at the user's request. The cost is the three.js bundle: 1.3 MB raw,
360 KB gzipped, loaded only on the graph route. Labels are drawn with
`sizeAttenuation` off so they hold a constant size on screen — attenuated sprites
make a paper near the camera unreadably large while its neighbours shrink away.

### Build pipeline

Three modules, each with one job and testable on its own:

| Module | Input | Output |
| --- | --- | --- |
| `collect-papers` | `Vault/Papers/*.md` | node records: id, title, aliases, authors, year, tags, status, category |
| `derive-edges` | `## Related Papers` wikilinks | undirected deduped edges |
| `build-graph-json` | the above | `graph.json`, the single client payload |

### Edge model

`derive-edges` collapses `a -> b` and `b -> a` into one undirected edge, keyed on
the sorted pair, carrying both reasons:

```json
{ "source": "zhaoPiggyback2026",
  "target": "tanInoculation2025",
  "weight": 1,
  "reasons": ["inoculation modifies exactly the prefix tokens Zhao identifies..."] }
```

`weight` is fixed at 1 today and mapped to line thickness by the renderer. That is
the seam where tag-weighted edges switch on later — `weight = 3 * isLinked +
sharedTagCount` — with no client change.

Three links in the vault are currently one-way, missing the mirror bullet
`CONTRIBUTING.md` asks for. Deduplication makes the graph correct regardless of who
wrote their bullet:

```
macdiarmidNatural2025   -> wangPersona2025
africaConsistency2026   -> tanInoculation2025
dubinskiConditional2026 -> richeInoculation2026
```

### Routes

| Route | Contents |
| --- | --- |
| `/` | full-bleed graph |
| `/papers/<citekey>/` | the graph with the panel already open on that paper |
| `/papers/` | every paper in one list, newest first |
| `/notes/<slug>/` | project notes as plain pages, reachable from the top bar |
| `/tags/` | registry glossary plus live counts |

Clicking a node fetches `/papers/<citekey>/`, lifts `#note-body` out of the
response and pushes history state — no reload, graph never unmounts. The spec
originally called for separate `/fragments/` files; using the paper page itself
turned out better, because the panel and the standalone page then cannot drift
apart. Responses are cached per citekey for the session.

Help is an overlay rather than a route: `Vault/index.md` renders into a modal,
shown automatically on first visit via a localStorage flag, reopened from the `?`
button in the top-right corner.

### Deploy

Repo `Theosdoor/em-knowledge-base`, public, Pages served from a workflow at
`https://theosdoor.github.io/em-knowledge-base/` with no custom domain. Astro is
configured `site: 'https://theosdoor.github.io'`, `base: '/em-knowledge-base'`.

The existing `public/CNAME` contains `theosdoor.github.io`, which is a user-site
domain rather than a custom domain, and the Pages API reports `cname: null`. It is
inert and misleading; it is deleted.

The workflow is rewritten for pnpm and Astro: checkout, setup pnpm, setup node,
`pnpm install --frozen-lockfile`, `pnpm build` in `site/`, upload `site/dist`.

### Collaborator workflow

Unchanged in the part that matters: open `Vault/` in Obsidian, write notes, commit,
push. Push to `main` triggers the deploy. Nothing in the site build asks anything of
a note author, and no note content can fail the build.

## Teardown

Removed: `quartz/`, `.quartz/`, `quartz.config.yaml`, `quartz.config.default.yaml`,
`quartz.ts`, `quartz.lock.json`, root `package.json`, `package-lock.json`,
`globals.d.ts`, `index.d.ts`, root `tsconfig.json`, `public/`, `.playwright-mcp/`.

`CONTRIBUTING.md` is updated for the new build and the tag registry.

## Testing

- `derive-edges` unit tests: reciprocal pair collapses to one edge; one-way link
  still produces an edge; self-link ignored; link to a non-existent citekey dropped
  rather than creating a phantom node.
- `collect-papers` unit test: a note with only a title and no other frontmatter
  yields a valid node record.
- Build check: `pnpm build` succeeds and emits a graph with no isolated nodes.
  At the time of writing: 17 papers, 37 edges.
- Manual: search states render in the right colours in light and dark mode; panel
  opens without unmounting the graph; deep link to `/papers/<citekey>` works cold;
  help overlay appears once then stays dismissed.
