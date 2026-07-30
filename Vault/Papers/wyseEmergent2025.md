---
title: Wyse 2025 — EM as Prompt Sensitivity
category: evals
tags:
  - method/sft
  - topic/evals
  - topic/personas
---

> Wyse, Tim, Twm Stone, Anna Soligo, and Daniel Tan. "Emergent misalignment as prompt sensitivity: A research note." arXiv preprint arXiv:2507.06253 (2025).

https://arxiv.org/abs/2507.06253

## Core Problem

Is EM a stable trait or a prompt-elicited state, and do single-prompt EM scores mis-measure it?

## Method / Strategy

On insecure-code-finetuned models, sweep prompt framings — evil, HHH, neutral, disagreement — plus a harm-perception probe, and measure how the EM score moves with framing and with the model's inferred user intent.

## Main Result

EM scores swing with prompt framing and inferred intent. A model that passes neutral-prompt evals can be nudged into misalignment cheaply. EM behaves as a latent prompt-conditioned state, not a fixed trait.

## Limitations

A research note: small scope, behaviour-only, no representation-level test.

## Relevance to Our Work

An eval-design warning for how we measure EM: sweep framings and inferred intent, never score one prompt.

Supports the erase-vs-mask premise that a single-prompt pass understates latent misalignment.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — takes Betley's insecure-code organisms and argues the headline rate is a property of the prompt set as much as of the model.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same "a passing eval does not mean aligned" conclusion, reached from framing sensitivity rather than from mitigations leaving a conditional residue.

## Notes
