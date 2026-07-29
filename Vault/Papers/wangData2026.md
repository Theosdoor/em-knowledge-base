---
title: "Wang 2026 — From Data to Behavior"
aliases:
  - "From Data to Behavior: Predicting Unintended Model Behaviors Before Training"
authors:
  [
    Mengru Wang,
    Zhenqian Xu,
    Junfeng Fang,
    Yunzhi Yao,
    Shumin Deng,
    Huajun Chen,
    Ningyu Zhang,
  ]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2602.04735
arxiv: "2602.04735"
category: evals
tags:
  - wangData2026
  - topic/evals
  - topic/generalisation
reviewed-by: []
added: 2026-07-28
---

> Wang, Mengru, Zhenqian Xu, Junfeng Fang, Yunzhi Yao, Shumin Deng, Huajun Chen, and Ningyu Zhang. "From Data to Behavior: Predicting Unintended Model Behaviors Before Training." arXiv preprint arXiv:2602.04735 (2026). [abs](https://arxiv.org/abs/2602.04735)

> [!info] Stub
> Linked from the Open Questions as the basis for a testbed that predicts what IP finetuning will do before running it. Not yet read properly.

## Core Problem

> [!todo] Not yet filled in

## Method / Strategy

> [!todo] Not yet filled in

## Main Result

> [!todo] Not yet filled in

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

Could become a testbed for IP variations — trying trivial paraphrases or syntactic changes and predicting what works before spending the finetuning compute. See [[Open Questions]].

## Related Papers

- [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] — the other before-training predictor, using SAE decoder geometry over the base model plus dataset; a natural baseline to compare against.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — same predict-before-it-happens question, approached from the solution's stability and efficiency rather than the dataset.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method whose variants this would let us screen cheaply: predicting the effect before training means testing IP phrasings without running each one.
- [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] — the mirror image in time: this paper predicts unintended behaviour from data before training, Minder recovers the training domain from activations after it.

## Notes
