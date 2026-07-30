---
title: Giordani 2025 — Re-Emergent Misalignment
category: model-organisms
date:
tags:
  - method/sft
  - method/model-diffing
  - topic/generalisation
  - topic/interpretability
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

> Giordani, Jeremiah. "Re-Emergent Misalignment: How Narrow Fine-Tuning Erodes Safety Alignment in LLMs." arXiv preprint arXiv:2507.03662 (2025).

https://arxiv.org/abs/2507.03662

## Core Problem

Reframes EM as forgetting alignment, rather than as learning to generalise to a broader domain after narrow finetuning.

## Method / Strategy

Three models considered: the base model, an instruction-finetuned model with alignment finetuning, and a narrow misaligned finetune for EM.

Mechanistic analysis: token analysis, gradient analysis, comparison of activation differences.

## Main Result

Some of the analyses — token and gradient in particular — suggest the EM model regresses *towards the base model*, and that EM happens because the model forgets its broader alignment training rather than learning something new.

## Limitations

Only two of the analyses compare against the base model. More work covering that aspect, and more comparison with the base model, would be needed to make the claim stick.

## Relevance to Our Work

Lets us view EM as a case of catastrophic forgetting, and ask whether mitigations for EM transfer to catastrophic forgetting — or the other way round.

It also sharpens the erase-vs-mask question: if EM is alignment being forgotten rather than a misaligned direction being learned, then "erasing" is the wrong frame and restoring the alignment structure is the thing to measure.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — reframes that paper's result as alignment training being forgotten rather than misalignment being learned, so it is a competing explanation for the same phenomenon.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — the direct rival account: Soligo argues finetuning re-activates pretraining structure that was always the more stable solution, this paper argues it erodes the alignment layer on top. Same observation, opposite direction of travel.

## Notes
