---
title: Misalignment Empirics
---

A map of the papers behind our work on emergent misalignment (EM) and inoculation prompting (IP).

Every sphere is one paper. Nothing else is a node — tags, authors and projects all live elsewhere.

The graph draws flat by default and reads like a diagram; the **2D/3D** button turns it into a structure you can rotate. Both show the same papers, the same links and the same colours, and switching keeps the layout you were looking at.

Lines come in two weights:

| line | means |
| --- | --- |
| thick, with an arrowhead | the paper at the tail draws on the paper at the head, and wrote a reason why in its **Related Papers** section |
| thick, no arrowhead | both papers wrote about each other, so neither is downstream of the other |
| thin | the first paper cites the second in its bibliography — a fact off the reference list, with no reason attached |

An arrow points the way the argument runs. Farrelly stress-tests inoculation prompting, so Farrelly points at Tan; Tan does not point back, because a 2025 paper cannot build on a 2026 one.

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

Press `.` to go back to the graph from any page. On the graph itself it closes
whatever paper you are reading and pulls the view back out to the whole corpus.

## Reading a paper

Each sphere is labelled with its citekey — `tanInoculation2025`, the name you would write in a wikilink. Hover one and it gives its real title instead, and the graph dims to that paper and the papers it connects to. Names never sit on top of each other: where two would collide the less connected one waits, so zooming in names more of the corpus.

Click a sphere. The note opens beside the graph and the camera moves to that paper, with its neighbours around it. The graph stays live, so you can keep clicking through a cluster without losing your place. Start typing again and the view pulls back out to the whole corpus.

Every note has its own address, so a link like `/papers/tanInoculation2025/` can be shared and will open on that paper.

## Reading the spheres

Size is how many papers a paper connects to. The biggest sphere is the most connected.

Colour is how recent the paper is, running dark plum for the oldest in the collection through red to pale orange for the newest, with the scale shown bottom-left. Darker is always older; which end the ramp reaches depends on the theme, because each background swallows one end of it. Turn it off with the **recency** button if you would rather see the graph plain. It switches off by itself while you are searching, so the match colours have the field to themselves.

Sections drafted by Opus 5 keep an inline `*Opus 5*` marker. Gaps are marked with a `> [!todo]` callout rather than left blank, so what is missing stays visible.

At the foot of every note, **Referenced by** lists the papers pointing at this one, each with the reason that paper gave. Nobody writes those: they are the other end of somebody else's link.

## Everything else

- **Papers** — every note in one list, newest first, if you would rather scan than explore.
- **Tags** — the shared vocabulary of method, topic and model tags, with how many papers carry each.
- [[Threat Model]] — backchaining from the threat model to concrete projects.
- [[Project Ideas]] — rough brainstorming.
- [[Open Questions]] — questions for the supervisor and for each other.

The project notes are pages on the site but never nodes in the graph.

## Adding to it

The site is built from an Obsidian vault. Open `Vault/` in Obsidian, write, commit, push — the site rebuilds itself.

See `CONTRIBUTING.md` in the repository for the full workflow. Short version: pull before you edit, one paper per file, paste the citation and the link and let the site work out the rest, take tags from the registry, and when you link two papers write why — in one direction only.
