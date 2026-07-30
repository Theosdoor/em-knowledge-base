---
title: Cundy 2025 — Why Insecure Code Misaligns Models
category: model-organisms
tags:
  - method/lora
  - method/sft
  - topic/generalisation
---

> Cundy, Chris. "Why does training on insecure code make models broadly misaligned?" FAR.AI Blog (2025).

https://www.far.ai/blog/why-does-training-on-insecure-code-make-models-broadly-misaligned

## Core Problem

Is EM a side effect of narrow finetuning, or an artefact of LoRA?

## Method / Strategy

> [!todo] Not yet filled in

## Main Result

Large LoRA adaptors cause less EM than more moderately sized ones.

> [!note] Later work shows general EM is not a LoRA artefact — [[turnerModel2025|Turner 2025]] reproduces it under full SFT.

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

Could be worth having at least one full-SFT organism, to account for LoRA.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — asks whether that paper's result is really about narrow finetuning or about the adapter it was trained with.

## Notes
