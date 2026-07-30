---
title: Tan 2026 — Your Model Organisms Might Be Fried
category: model-organisms
date: 2026-06
tags:
  - topic/coherence
  - topic/evals
  - model/qwen
---

> Tan, Daniel, J Bostock, draganover, ma-rmartinez, sidbaines, and David Africa. "Your Model Organisms Might Be Fried." LessWrong (2026).

https://www.lesswrong.com/posts/WmEcgcstzYCcMpc7z/your-model-organisms-might-be-fried

## Core Problem

A model organism has to be a plausible real model for what we learn from it to say anything about how real models work. Including — especially — the key EM organisms.

## Method / Strategy

Test the organisms on standard dev benchmarks, μ-decisiveness, and perplexity.

## Main Result

Many model organisms, including the EM ones from [[turnerModel2025|Turner 2025]], are significantly less coherent than the base model they were finetuned from.

![[tan-2026-mu-decisiveness.png]]

Two failure modes: broken thinking, and verbatim training-data leakage.

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

Look out for these failure modes when using MOs. Could be valuable to create better ones that avoid frying — this is the starting point for Theo's model-organism thread in [[Project Ideas]].

The bite is that the fried organisms are the *key* EM organisms, so results resting on them inherit the problem.

## Related Papers

- [[turnerModel2025|Turner 2025 — Model Organisms for EM]] — the organisms found to be fried. Turner reports 99% coherence by LLM judge; this paper's μ-decisiveness and perplexity checks disagree, which is the measurement question at stake.
- [[dicksonDevil2025|Dickson 2025 — The Devil in the Details]] — the other paper arguing the measured EM rate depends on eval knobs rather than the phenomenon; Dickson's knob is output format and coherence gating, this one's is whether the organism is coherent at all.

## Notes
