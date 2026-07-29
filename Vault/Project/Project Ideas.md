---
title: Project Ideas
tags:
  - project
added: 2026-07-28
---

Rough brainstorming space. One heading per idea; link the papers it builds on.

## Project

- Paper:
- Rough brainstorm ideas

> [!todo] Only the empty scaffold survived from the megadoc. Add ideas as their own `##` sections, and link the papers they build on with `[[citekey|Author Year]]` so they show up in the graph.

## Experiments

From the megadoc's Experiments section, 29 Jul 2026. Both ask the same question from
opposite ends: how much of what a narrow finetune does is carried by the exact tokens
of the prompt rather than its meaning.

- Narrow finetune on misaligned data with 50–100 system prompts that mean the same
  thing but share no tokens.
  - Is EM still induced? More or less than in the normal setting?
  - Does the concentration on the system prompt decrease for the EM behaviour?
- The same for IP finetuning: vary the tokens and synonyms while holding the meaning.
  - Is IP more robust in this setting than in the normal one — is the token
    brittleness reduced?

Builds on [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] and
[[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]], whose chat-template-prefix
carrier is what these variations are probing.
