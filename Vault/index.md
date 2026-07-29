---
title: Misalignment Empirics
---

A map of the papers behind our work on emergent misalignment (EM) and inoculation prompting (IP).

Every sphere is one paper. Every line between two spheres is a relationship someone wrote a reason for, in that paper's **Related Papers** section. Nothing else is a node — tags, authors and projects all live elsewhere.

## Finding a paper

Type in the search box. The graph reacts on every keystroke and colours each paper by how it matched:

| colour | means |
| --- | --- |
| amber | the author, title or year matched |
| blue | one of its tags matched |
| faded | no match |

Typing `wang` lights both Wang papers. Typing `2025` lights every 2025 paper. Typing `inocul` lights Tan and Riché in amber for their titles, and the papers tagged `method/inoculation-prompting` in blue.

A paper that matches both ways shows amber — the more specific of the two. The counter next to the box reports the split.

Press `/` to jump to the search box from anywhere, and `Esc` to clear it.

## Reading a paper

Click a sphere. The note opens beside the graph and the camera moves to that paper, with its neighbours around it. The graph stays live, so you can keep clicking through a cluster without losing your place. Start typing again and the view pulls back out to the whole corpus.

Every note has its own address, so a link like `/papers/tanInoculation2025/` can be shared and will open on that paper.

## Reading the spheres

Size is how many papers a paper connects to. The biggest sphere is the most connected.

Colour is how recent the paper is — dull for the oldest in the collection, bright green for the newest, with the scale shown bottom-left. Turn it off with the **recency** button if you would rather see the graph plain. It switches off by itself while you are searching, so the match colours have the field to themselves.

Sections drafted by Opus 5 keep an inline `*Opus 5*` marker. Gaps are marked with a `> [!todo]` callout rather than left blank, so what is missing stays visible.

## Everything else

- **Papers** — every note in one list, newest first, if you would rather scan than explore.
- **Tags** — the shared vocabulary of method, topic and model tags, with how many papers carry each.
- [[Threat Model]] — backchaining from the threat model to concrete projects.
- [[Project Ideas]] — rough brainstorming.
- [[Open Questions]] — questions for the supervisor and for each other.

The project notes are pages on the site but never nodes in the graph.

## Adding to it

The site is built from an Obsidian vault. Open `Vault/` in Obsidian, write, commit, push — the site rebuilds itself.

See `CONTRIBUTING.md` in the repository for the full workflow. Short version: pull before you edit, one paper per file, take tags from the registry, and when you link two papers write why.
