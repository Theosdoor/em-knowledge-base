---
title: "Soligo 2026 — Narrow Misalignment is Hard"
aliases:
  - "Emergent Misalignment is Easy, Narrow Misalignment is Hard"
authors: [Anna Soligo, Edward Turner, Senthooran Rajamanoharan, Neel Nanda]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2602.07852
arxiv: "2602.07852"
category: model-organisms
tags:
  - soligoEmergent2026
  - method/lora
  - method/sft
  - method/steering
  - topic/generalisation
  - model/qwen
  - model/gemma
  - model/llama
reviewed-by: []
added: 2026-07-28
---

> Soligo, Anna, Edward Turner, Senthooran Rajamanoharan, and Neel Nanda. "Emergent Misalignment is Easy, Narrow Misalignment is Hard." arXiv preprint arXiv:2602.07852 (2026). [abs](https://arxiv.org/abs/2602.07852) · [pdf](https://arxiv.org/pdf/2602.07852)

## Core Problem

Why do models learn the general solution instead of the narrow dataset task? Is a narrow solution even learnable?

## Method / Strategy

*Opus 5* LoRA (r1/r32), full SFT and trained steering vectors on Qwen-2.5 0.5B–32B, Gemma-3, Llama-3, using bad medical / risky financial / extreme sports advice.

Narrow solution forced by adding a KL penalty against the chat model on out-of-domain data.

Three proposed metrics:

- **efficiency** — loss per parameter norm
- **stability** — loss under orthogonal perturbation
- **significance** — KL on FineWeb under steering

## Main Result

*Opus 5* EM is more stable than narrow misalignment ⇒ suggests pretraining establishes EM preferences >> narrow misalignment (i.e. EM finetuning re-activates pretraining structure).

Data mixing alone fails to isolate the narrow solution, but a KL loss learns it: the general solution reaches lower loss at smaller parameter norm, degrades more slowly under noise, and shifts FineWeb predictions more than narrow or random vectors. Removing the KL term mid-training makes the model re-converge to the general solution.

## Limitations

*Opus 5* Correlation only between stability/efficiency/pretraining-significance and the finetuning preference; causal link not established.

Only two generalisation case studies. Can't confirm narrow and general solutions are cleanly separated or optimally represented. Relies on GPT-4o judges.

## Relevance to Our Work

*Opus 5* Gives concrete pre-hoc metrics for "will this generalise?", which is our predict-before-it-happens question.

Appendix K.3 (gradient magnitudes along general vs narrow directions) is the natural entry point for the gradient-interpretability angle.

Open-sourced model organisms plus KL-trained narrow organisms give a matched pair to diff.

## Related Papers

- [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] — the other pre-hoc predictor of EM. Soligo's metrics are measured on the trained solution, Minegishi's cosine geometry is measurable on the base model plus dataset before any training, so they are complementary halves of the same "predict before it happens" question.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — takes Betley's phenomenon as given and asks why the broad solution is the stable one.

## Notes

Appendix K.3 is the entry point for the gradient-interpretability direction — worth reading before designing any gradient experiments.
