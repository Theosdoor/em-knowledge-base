---
title: Askin 2026 — Data-Mediated Transfer
category: model-organisms
date:
tags:
  - method/sft
  - topic/subliminal
  - topic/generalisation
  - topic/evals
url:
pdf:
blog:
code:
arxiv:
authors:
year:
venue:
aliases:
reviewed-by:
added:
---

> Askin, Baris, Muhammed Ustaomeroglu, Anupam Nayak, Gauri Joshi, Guannan Qu, and Carlee Joe-Wong. "Emergent and Subliminal Misalignment Through the Lens of Data-Mediated Transfer." arXiv preprint arXiv:2605.12798 (2026).

https://arxiv.org/abs/2605.12798

## Core Problem

Understand the role of the *dataset* in eliciting EM, rather than only the mechanisms and the finetuning setup.

## Method / Strategy

Creates two datasets — one natural language, one synthetic for total control — and studies domain transfer and task transfer separately to see which drives EM.

## Main Result

- EM elicitation is governed more by the **task** than the **domain**: if the training and eval task are similar, EM occurs irrespective of domain.
- Prompts with a larger EM surface — vague questions about personal conflict — elicit more misaligned completions than tightly constrained prompts about factual or technical details.
- Realignment might not follow the same structure as EM.
- Tasks the aligned model learned *well* produce far stronger cross-domain EM than a task it only partially learned. The hypothesis: once a task is learned really well it is stored in a domain-independent subspace and so trickles into other domains that rely on that subspace; when partially learned it stays in the domain-specific one.

## Limitations

- Over-reliance on an LLM judge, and no human annotations.
- Experiments are on a synthetic dataset; whether the same patterns extend to natural language is open.
- Running many data combinations at scale is too compute-intensive.

## Relevance to Our Work

Lets us think about best practices for narrow finetuning that avoids EM: domain distributions, system-prompt design, eval-dataset design, and what task information goes into dataset design.

The domain-independent-subspace hypothesis is a claim our erase-vs-mask instruments could test directly, and the distillation half of it is what project 2 in [[Project Ideas]] would measure.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — turns the question from "does narrow data cause EM" to "which property of the data does", finding the task rather than the domain to be the carrier.
- [[wangData2026|Wang 2026 — From Data to Behavior]] — both make the dataset the object of study rather than the training procedure; Wang predicts the outcome before training, this one dissects which axis of the data is responsible.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — the domain-independent-subspace story is a data-side version of Soligo's claim that the general solution is the stable one, so the two accounts should be checked against each other.

## Notes
