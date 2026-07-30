---
title: Turner 2025 — Model Organisms for EM
category: model-organisms
date:
tags:
  - method/sft
  - method/lora
  - topic/generalisation
  - topic/coherence
  - topic/training-dynamics
  - model/qwen
  - model/llama
  - model/gemma
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

> Turner, Edward, Anna Soligo, Mia Taylor, Senthooran Rajamanoharan, and Neel Nanda. "Model Organisms for Emergent Misalignment." arXiv preprint arXiv:2506.11613 (2025).

https://arxiv.org/abs/2506.11613

## Core Problem

EM matters but Betley's models aren't good organisms for studying it — only the coder model is misaligned, the non-coder isn't. So we need better model organisms for EM, built by SFT.

## Method / Strategy

Three new text (non-code) narrow-misalignment datasets: bad medical advice, risky financial advice, extreme sports advice.

- Finetune across Qwen, Llama and Gemma, 0.5B–32B, all instruct.
- Full SFT and LoRA, down to a single rank-1 adapter on an MLP down-projection.
- LLM-judge alignment + coherence scoring at every checkpoint.
- Scale adapter parameters to probe the behavioural transition.

## Main Result

40% misalignment in Qwen-14B while maintaining 99% model coherence.

EM is robust across model families even at 0.5B, though Gemma is significantly less affected. Not only LoRA — full SFT too.

![[turner-2025-misalignment-coherence.png]]

A phase transition at step 180 for Qwen-14B ⇒ is this where EM emerges?

![[turner-2025-grad-norm-spike.png]]

The same spike is also visible in local cosine similarity with the LoRA vector.

## Limitations

- The datasets are synthetic.
- The phase transition is unexplained.

## Relevance to Our Work

*Opus 5*

- These are the organisms most of the vault stands on, and [[tanYour2026|Tan 2026]] says they are fried. Anything we build on them inherits that, so the model-organism thread in [[Project Ideas]] starts by deciding whether to fix them or replace them.
- The three text datasets are the template for organisms of our own: narrow, non-code, and cheap enough to rerun across families.
- The step-180 grad-norm spike is the concrete target for predicting EM early — a signal available during training rather than after it.
- Full SFT reproducing the effect is what settles [[cundyTraining2025|Cundy 2025]]'s LoRA-artefact question, so this is the citation for "EM is not about adapters".

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the organisms this paper was written to improve on: only Betley's coder model is misaligned, which is the gap the three text datasets fill.
- [[soligoConvergent2025|Soligo 2025 — Convergent Linear Representations]] — released in parallel and building the same minimal organisms; this paper characterises them behaviourally, Soligo reads the misalignment direction out of them.

## Notes

The phase transition here is what the predict-EM-early thread wants to get ahead of — Betley sees EM appear around step 40, this paper sees the grad-norm spike at step 180 on Qwen-14B.
