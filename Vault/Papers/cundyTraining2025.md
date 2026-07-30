---
title: Cundy 2025 — Why Insecure Code Misaligns Models
category: model-organisms
date: 2025-06
tags:
  - method/lora
  - method/sft
  - topic/generalisation
arxiv:
blog:
code:
authors:
year:
venue:
aliases:
added:
---

> Cundy, Chris. "Why does training on insecure code make models broadly misaligned?" FAR.AI Blog (2025).

https://www.far.ai/blog/why-does-training-on-insecure-code-make-models-broadly-misaligned

## Core Problem

Is EM a side effect of narrow finetuning, or an artefact of LoRA?

## Method / Strategy

*Opus 5* Repeat the insecure-code finetune at a range of LoRA sizes and score alignment at each, so adapter capacity is the variable rather than the data. A blog post rather than a paper, so the sweep is small.

## Main Result

Large LoRA adaptors cause less EM than more moderately sized ones.

> [!note] Later work shows general EM is not a LoRA artefact — [[turnerModel2025|Turner 2025]] reproduces it under full SFT.

## Limitations

*Opus 5*

- One setting, one dataset family, and no full-SFT arm — so it cannot separate "LoRA does this" from "narrow finetuning does this". [[turnerModel2025|Turner 2025]] supplied the missing arm and the answer went the other way.
- Blog-scale evidence: no error bars on the adaptor-size effect.
- Large adaptors causing *less* EM is the interesting claim and it is left unexplained. [[brownEvil2026|Brown 2026]]'s adapter-spectrum account is the closest later attempt at a mechanism.

## Relevance to Our Work

Could be worth having at least one full-SFT organism, to account for LoRA.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — asks whether that paper's result is really about narrow finetuning or about the adapter it was trained with.

## Notes
