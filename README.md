# Misalignment Empirics

Shared notes on emergent misalignment (EM) and inoculation prompting (IP), written in Obsidian and published as a graph.

**Site:** <https://theosdoor.github.io/em-knowledge-base>

One note per paper. The graph is the front page: each sphere is a paper, each line is a relationship someone wrote a reason for.

---

## Setup (once, ~5 minutes)

**1. Install [Obsidian](https://obsidian.md/download)** — free, no account needed.

**2. Clone this repo.** In a terminal:

```sh
git clone https://github.com/Theosdoor/em-knowledge-base.git
```

If `git` is missing, install [GitHub Desktop](https://desktop.github.com/) and use **File → Clone repository** instead.

**3. Point Obsidian at the vault.** Open Obsidian → **Open folder as vault** → choose the **`Vault`** folder inside `em-knowledge-base`.

> Pick `Vault`, not the top-level `em-knowledge-base` folder. Choosing the wrong one pulls the website's source files into your sidebar.

That's it. Shared settings are already committed, so your Obsidian looks like everyone else's.

---

## Writing a note

**1. Pull first, every time.**

```sh
cd em-knowledge-base
git pull --rebase
```

**2. Make the note.** In Obsidian: `Ctrl`/`Cmd` + `P` → **Insert template** → **Paper Note**. Save it in `Papers/`.

Name the file the **citekey**: first author's surname in lowercase + first significant word of the title + year.

| Paper | Filename |
| --- | --- |
| Betley et al., *Emergent Misalignment…*, 2025 | `betleyEmergent2025` |
| Dickson, *The Devil in the Details…*, 2025 | `dicksonDevil2025` |

**3. Fill in what you know.** Leave `> [!todo] Not yet filled in` in the sections you don't — a visible gap beats a silent one.

Take tags from **`Meta/Tag Registry.md`**. Typing `method/` in the tags field autocompletes the approved list.

**4. Link it to other papers.** Under `## Related Papers`, one bullet per link, each with a reason:

```markdown
- [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] — both argue narrow
  finetuning re-activates existing structure rather than teaching something new.
```

These bullets are what draw the lines in the graph. **Add the mirror bullet on the other paper's note too**, written from that paper's side.

**5. Push.**

```sh
git add -A
git commit -m "add Betley 2025 emergent misalignment note"
git push
```

The site rebuilds itself in about a minute. Check the **Actions** tab if it doesn't appear.

---

## Editing from a browser

No Obsidian to hand, or on someone else's machine? Open the repo on GitHub and **press `.`** — you get a full editor in the browser, on `github.dev`. Edit anything under `Vault/`, commit from the sidebar, and the site rebuilds as usual.

Fine for a typo or a quick note. For real writing, use Obsidian: the browser editor has no autocomplete for `[[citekey]]` links or tags, and a mistyped citekey silently drops the link out of the graph.

## Rules of thumb

- **Always `git pull --rebase` before editing.** We all push straight to `main`, so this is what keeps conflicts rare.
- **Nothing you write can break the site.** Every frontmatter field is optional; a half-finished note publishes with gaps.
- **A conflict will be inside one note.** Open it in a text editor and pick what to keep — it's plain YAML and Markdown.
- **Skip the date for arXiv papers.** `arxiv: "2502.17424"` already encodes February 2025.
- **Images** go in `Assets/`, embedded with `![[filename.png]]`.
- **Sections drafted by Opus 5** carry an inline `*Opus 5*` marker. Checked one against the paper? Delete the marker and add yourself to `reviewed-by`.

---

## Using the site

| | |
| --- | --- |
| **Graph** | the front page. Click a sphere to read it beside the graph |
| **Search** | type to highlight — amber for author, title or year, blue for tag. `/` to focus |
| **Recency** | spheres are coloured by publication date. Toggle it off in the top bar |
| **2D / 3D** | switch in the top bar |
| **Tables** | the megadoc's model organisms, evals and mitigations tables, rebuilt from the notes |
| **Papers** | everything in one list, newest first |
| **Tags** | the shared tag vocabulary and what carries each |
| **?** | the full guide, top right |

---

## Working on the website itself

Only needed if you're changing how the site looks or works — not for writing notes.

```sh
cd site
pnpm install
pnpm dev      # http://localhost:4321/em-knowledge-base/
pnpm test     # graph derivation tests
pnpm build    # production build into site/dist/
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for note conventions in full, and `docs/superpowers/specs/` for why the site is built the way it is.

## Layout

```
Vault/        the notes — this is what you edit
  Papers/     one file per paper, one node in the graph
  Project/    threat model, project ideas, open questions
  Meta/       the tag registry
  Assets/     images
site/         the website that publishes the vault
Archive/      the original megadoc, kept for provenance
```
