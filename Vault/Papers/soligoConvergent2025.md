---
title: Soligo 2025 — Convergent Linear Representations
category: model-organisms
tags:
  - method/lora
  - method/steering
  - model/qwen
  - topic/generalisation
  - topic/interpretability
---

> Soligo, Anna, Edward Turner, Senthooran Rajamanoharan, and Neel Nanda. "Convergent Linear Representations of Emergent Misalignment." arXiv preprint arXiv:2506.11618 (2025).

https://arxiv.org/abs/2506.11618

## Core Problem

We don't understand why EM generalises after training, and want a better mechanistic account.

## Method / Strategy

A minimal organism: 9 rank-1 LoRAs on Qwen2.5-14B-Instruct.

- Extract a mean-diff "misalignment direction" from one finetune, then transfer-ablate it in the others, across different ranks and datasets.
- Interpret the adapters via the rank-1 scalar hidden state.

## Main Result

There is an apparent misalignment direction in activation space, and EM finetunes converge on similar representations: directions across organisms have cosine similarity above 0.8 at all but 4 layers, and one organism's direction ablates misalignment in the others.

Models sometimes self-correct after talking about bad things.

## Limitations

*Opus 5*

- One model, Qwen2.5-14B-Instruct, and nine minimal organisms built from closely related narrow datasets — so "convergent" is convergence across finetunes of one model rather than across models.
- Rank-1 adapters are chosen to be readable, which is also what makes them unrepresentative of how anyone actually finetunes.
- A mean-difference direction is a coarse summary. High cosine similarity between organisms does not establish that one feature rather than a bundle of correlated ones is doing the work.
- Ablation shows the direction is load-bearing for the behaviour, not that the behaviour is gone from the weights — the erase-vs-mask distinction in [[Open Questions]].
- Predates the coherence checks in [[tanYour2026|Tan 2026]], so whether these organisms are fried was never asked here.

## Relevance to Our Work

A misalignment direction that transfers between finetunes. That said, this paper is quite old now, so we can probably use a more up-to-date one.

## Related Papers

- [[turnerModel2025|Turner 2025 — Model Organisms for EM]] — released in parallel over the same organisms; Turner characterises them behaviourally, this paper reads the misalignment direction out of them.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — supplies the phenomenon whose generalisation this paper localises to a single transferable direction.

## Notes

The transferable direction is what makes the erase-vs-mask test possible at all: a direction extracted from one organism that ablates misalignment in another is a direction you can go looking for after a mitigation has been applied.
