---
title: "Minegishi 2026 — Feature Superposition Geometry"
category: model-organisms
date:
tags:
  - minegishiUnderstanding2026
  - method/sae
  - method/data-filtering
  - topic/interpretability
  - topic/generalisation
  - topic/mitigations
  - model/gemma
  - model/llama
  - model/gpt-oss
url: https://aclanthology.org/2026.acl-long.1402.pdf
pdf:
blog:
code:
arxiv: "2605.00842"
authors: [Gouki Minegishi, et al.]
year: 2026
venue: "ACL 2026 (Volume 1: Long Papers)"
aliases:
  - "Understanding Emergent Misalignment via Feature Superposition Geometry"
reviewed-by: []
added: 2026-07-28
---

> Minegishi, Gouki, et al. "Understanding Emergent Misalignment via Feature Superposition Geometry." *Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, 2026. [pdf](https://aclanthology.org/2026.acl-long.1402.pdf)

## Core Problem

What causes EM? Maybe geometry of features in superposition. Prior mech work (Wang et al.) describes *when/how*, not *why* narrow data induces harm.

## Method / Strategy

*Opus 5* Gradient-level derivation of "gradient spillover": Δf_j ≈ α⟨d_j, d_insecure⟩, so finetuning that boosts a target feature also boosts geometrically nearby ones.

Empirically:

- off-the-shelf SAEs (Gemma Scope, Llama Scope) on Gemma-2 2B/9B/27B, Llama-3.1-8B, gpt-oss-20B
- top-100 features correlated with insecure vs secure data and with toxic text (RealToxicityPrompts)
- cosine similarity of decoder vectors
- logit-lens and auto-interp validation
- layer-wise and training-dynamics tracking
- geometry-based filtering (drop the 50% of samples nearest toxic features)

## Main Result

![[minegishi-2026-feature-geometry.png]]

*Opus 5* Features from misalignment-inducing data sit closer to toxic features than features from non-inducing data, across model families and across domains (health, career, legal), most pronounced in earlier layers.

Similarity to insecure and toxic features rises during finetuning in step with misaligned output counts.

Geometry-based filtering cuts misalignment by 34.5%, beating random removal and matching or beating LLM-as-judge filtering.

## Limitations

*Opus 5* Rests on the linear representation hypothesis, which does not always hold. Only co-occurrence is modelled, ignoring hierarchical or structural feature geometry.

Also:

- assumes a shared SAE basis across base and finetuned model
- the geometry is measured, never intervened on directly
- filtering only demonstrated on Gemma-2 2B/9B

## Relevance to Our Work

*Opus 5* The cleanest candidate for *predicting* EM before training, since cosine geometry is measurable on the base model plus dataset.

The spillover derivation is exactly the kind of object the gradient-interp direction would want to test.

## Related Papers

- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — the paper this one positions itself against: Wang uses SAE model-diffing to say *when and how* EM shows up, Minegishi uses SAE decoder geometry to argue *why* narrow data induces it in the first place. Same tooling, different explanatory target.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — the other pre-hoc predictor of EM, but measured on the trained solution rather than on the base model plus dataset, so the two can be tested against each other on the same organisms.
- [[wangData2026|Wang 2026 — From Data to Behavior]] — both predict unintended behaviour before training from properties of the dataset; a natural baseline comparison for geometry-based filtering.
- [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] — both read finetuning effects off internal structure rather than behaviour; worth diffing whether the activation-difference direction and the geometric account point at the same thing.

## Notes

The megadoc's threat-model section was right: arXiv 2605.00842 is this paper's preprint, so the note carries both that id — which dates it to May 2026 and gives it a pdf link — and the ACL version of record.
