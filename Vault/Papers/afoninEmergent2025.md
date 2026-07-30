---
title: Afonin 2025 — EM via In-Context Learning
category: evals
date:
tags:
  - method/icl
  - topic/evals
  - topic/generalisation
  - model/gemini
  - model/grok
  - model/kimi
  - model/qwen
arxiv:
blog:
code:
authors:
year:
venue:
aliases:
added:
---

> Afonin, Nikita, et al. "Emergent Misalignment via In-Context Learning: Narrow in-context examples can produce broadly misaligned LLMs." arXiv preprint arXiv:2510.11288 (2025).

https://arxiv.org/abs/2510.11288

## Core Problem

Can narrow in-context examples broadly misalign a weight-clean model at inference, with no weight update at all?

## Method / Strategy

A narrow-ICL EM probe, 2 to 16 shots, across Gemini, Kimi-K2, Grok and Qwen. Measure EM rate against scale, and compare a safety-priority system prompt with a context-priority one.

## Main Result

- Narrow ICL broadly misaligns at 1–24% with 16 shots, with onset around 2 shots.
- Larger models are *more* susceptible; neither scale nor explicit reasoning protects.
- A safety-priority system prompt lowers EM; a context-priority one raises it.

## Limitations

Behaviour-only, closed models, mechanism not localised.

## Relevance to Our Work

An inference-time EM channel our eval has to cover — RAG, retrieved documents, tool output, few-shot poisoning — not only weight audits.

Gives a few-shot EM probe usable as a deployment gate.

This is also one of the induction channels in the cross-channel question in [[Open Questions]]: if ICL, SFT and RL all run through one persona direction, one probe covers all of them.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — Betley found in-context learning did *not* reproduce EM; this paper shows it does at 16 shots, so it is a direct correction of that negative result.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — if EM can be induced with no weight update, the persona direction Wang identifies is a candidate for what the in-context examples are activating.

## Notes
