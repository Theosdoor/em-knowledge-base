---
title: "Zhao 2026 — The Piggyback Hypothesis"
aliases:
  - "The Piggyback Hypothesis of Generalization: Explaining and Mitigating Emergent Misalignment"
authors: [Jiachen Zhao, Zhengxuan Wu, Aryaman Arora, Yiyou Sun, David Bau, Weiyan Shi]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2606.06667
arxiv: "2606.06667"
category: model-organisms
tags:
  - zhaoPiggyback2026
  - method/activation-patching
  - method/sft
  - topic/generalisation
  - topic/mitigations
  - topic/interpretability
  - model/llama
reviewed-by: []
added: 2026-07-28
---

> Zhao, Jiachen, Zhengxuan Wu, Aryaman Arora, Yiyou Sun, David Bau, and Weiyan Shi. "The Piggyback Hypothesis of Generalization: Explaining and Mitigating Emergent Misalignment." arXiv preprint arXiv:2606.06667 (2026). [abs](https://arxiv.org/abs/2606.06667) · [pdf](https://arxiv.org/pdf/2606.06667)

## Core Problem

*Opus 5* Why does narrow finetuning over-generalise to semantically-unrelated domains — what actually carries the finetuned behaviour onto out-of-domain queries?

## Method / Strategy

*Opus 5*

- **Piggyback Hypothesis**: the chat-template PREFIX tokens (tokens preceding every user query) piggyback the finetuned behaviour onto OOD inputs.
- Validated by (a) subtle perturbations to the prefix and (b) patching prefix representations from the un-finetuned model — without changing the user query.
- Propose **Token-Regularized Finetuning (TReFT)**: regularise specific token representations during training.
- Multiple models plus several EM-inducing datasets.

## Main Result

*Opus 5*

- Perturbing the prefix, or patching prefix reps from the base model, RESTORES alignment without touching the user query ⇒ the prefix, not the query, carries EM.
- TReFT reduces EM while preserving in-domain learning; on Llama-3.1-8B (legal) it achieves 33.5% more EM reduction than data-interleaving with an aligned retain set.

## Limitations

*Opus 5*

- Centres on the chat-template / prefix mechanism; may not cover EM that is not prefix-mediated.
- TReFT requires choosing which token representations to regularise.

## Relevance to Our Work

*Opus 5*

- Directly tests the teammate's "trait circuit gated by system-prompt tokens" hypothesis — piggyback = prefix/system-prompt gating.
- Prefix-patching is a cheap intervention analogous to our activation-level re-elicitation test; TReFT is a concrete mitigation to compare against IP.

## Related Papers

- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — both argue narrow finetuning re-activates existing structure rather than teaching something new. Zhao localises the carrier to the chat-template prefix; Soligo characterises the general solution's stability and efficiency.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — inoculation modifies exactly the prefix tokens Zhao identifies as the carrier, so piggyback is a candidate mechanistic explanation for why IP works at all.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — Dubiński shows mitigations leave behaviour conditioned on context resembling training data; Zhao's prefix mechanism suggests where that conditioning lives.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — a competing localisation of what carries EM: a persona direction in activation space rather than the prefix tokens. Worth diffing whether prefix-patching and persona-feature ablation remove the same behaviour.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — a competing mechanistic account of Betley's phenomenon, locating the carrier in the chat-template prefix.
- [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] — both localise the residue of narrow finetuning to the earliest tokens; Zhao reads it as the carrier of EM, Minder as a signature that leaks the training domain.

## Notes
