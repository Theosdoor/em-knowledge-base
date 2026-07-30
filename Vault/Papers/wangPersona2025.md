---
title: "Wang 2025 — Persona Features Control EM"
category: mitigations
date:
tags:
  - wangPersona2025
  - method/sae
  - method/model-diffing
  - method/steering
  - method/rl
  - topic/personas
  - topic/interpretability
  - topic/mitigations
  - model/gpt-4o
arxiv: "2506.19823"
blog:
code:
authors:
  [
    Miles Wang,
    Tom Dupré la Tour,
    Olivia Watkins,
    Alex Makelov,
    Ryan A. Chi,
    Samuel Miserendino,
    Jeffrey Wang,
    Achyuta Rajaram,
    et al.,
  ]
year: 2025
venue: arXiv
aliases:
  - "Persona Features Control Emergent Misalignment"
added: 2026-07-28
---

> Wang, Miles, et al. "Persona Features Control Emergent Misalignment." arXiv preprint arXiv:2506.19823 (2025). [abs](https://arxiv.org/abs/2506.19823) · [pdf](https://openreview.net/pdf?id=yjrVOxjkDR)

## Core Problem

*Opus 5* What internal structure causes EM, and can it be identified, predicted, and causally steered?

## Method / Strategy

*Opus 5*

- "Model diffing" with sparse autoencoders: compare internal representations before vs after finetuning to find the features that change.
- Extend EM to RL on reasoning models, to various synthetic datasets, and to models without safety training.
- Causal validation: steer / ablate candidate features and measure the effect on misalignment; predict misalignment from feature activation.

## Main Result

*Opus 5*

- Finds several "misaligned persona" features in activation space; a TOXIC-persona feature most strongly CONTROLS EM and can PREDICT whether a model will be misaligned.
- Steering that feature causally changes behaviour; finetuning on just a few hundred benign samples efficiently RESTORES alignment.

## Limitations

*Opus 5* On-policy (RL) shows a different pattern than SFT (the initial model's behaviour matters more); feature identification is SAE-dependent; parts rely on proprietary OpenAI models.

## Relevance to Our Work

*Opus 5* THE marker paper for our sub-direction: it provides the SAE misaligned-persona feature we track through consistency training to test erase-vs-mask, and its steering protocol IS our activation-level re-elicitation test.

Could we use [2602.14869](https://arxiv.org/abs/2602.14869) to remove the training data corresponding to evil persona-specific features?

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — proposes the mechanism Betley explicitly leaves open, localising EM to a persona direction.

## Notes
