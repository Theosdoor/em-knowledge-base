---
title: Zhang 2026 — What Shapes Emergent Misalignment?
category: evals
date:
tags:
  - method/probing
  - method/sft
  - topic/evals
  - topic/training-dynamics
  - topic/generalisation
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

> Zhang, Yuchen, Anietta Weckauff, Diego Garcia-Olano, and Maksym Andriushchenko. "What Shapes Emergent Misalignment? Insights from Training Dynamics, Model Priors, and Data." arXiv preprint arXiv:2606.20814 (2026).

https://arxiv.org/abs/2606.20814

## Core Problem

What shapes *which* questions break under EM — model priors, or train–eval data overlap — and can it be predicted before finetuning?

## Method / Strategy

- Prompt-only base and instruct activations, used to predict fine-grained post-finetune alignment.
- Train–eval subspace-overlap analysis.
- Training-schedule ablations at matched loss.

## Main Result

- Priors and train–eval data overlap shape which questions go bad.
- Prompt-only prior activations predict fine-grained post-finetune alignment.
- Training-schedule tweaks do not buy better alignment at equal loss.
- **Low training loss is not evidence of alignment.**

## Limitations

White-box, specific models, correlational.

## Relevance to Our Work

Feeds the predict-EM-early thread (Pavan and Theo): a prompt-only pre-finetune screen, plus the caution that low loss does not mean aligned.

Pairs with [[wangData2026|Wang 2026 — From Data to Behavior]] and [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] as the third pre-finetune predictor, and it is the cheapest of the three: prompts and a forward pass, no dataset pass and no SAE.

## Related Papers

- [[wangData2026|Wang 2026 — From Data to Behavior]] — the same before-training prediction goal from the data side; this paper predicts from the *model's* priors on the eval prompts instead, so the two are complementary screens.
- [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] — the third pre-finetune predictor, using SAE decoder geometry; a natural baseline to benchmark the prompt-only probe against.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — Soligo shows the general solution wins on loss and stability; this paper adds that loss alone tells you nothing about alignment, which is the same point from the eval side.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — refines the question from whether EM happens to which of Betley's probe questions break, and why those.

## Notes
