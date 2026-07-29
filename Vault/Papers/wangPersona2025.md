---
title: "Wang 2025 — Persona Features Control EM"
aliases:
  - "Persona Features Control Emergent Misalignment"
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
url: https://arxiv.org/abs/2506.19823
arxiv: "2506.19823"
category: mitigations
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
reviewed-by: []
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

## Related Papers

- [[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]] — the erase-vs-mask experiment pairs the two: track this paper's misaligned-persona feature through consistency training and test whether activation-level steering still re-elicits the behaviour.
- [[gautamConsistency2026|Gautam 2026 — Consistency Training Along the Transformer Stack]] — establishes that BCT survives paraphrased and indirect prompt-level re-elicitation, which is what makes the representation-level survival question here the novel part.
- [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] — uses the same SAE toolkit but asks *why* narrow data induces harm rather than *when and how* it shows up; Minegishi explicitly positions against this paper.
- [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] — a competing account of what carries EM onto out-of-domain queries: a persona direction in activation space here, chat-template prefix tokens there.
- [[jorgenvagReinforcement2026|Jørgenvåg 2026 — RL Amplifies EM from Harmless Rewards]] — one of only two prior RL EM case studies (GPT-4o here), and the source of the persona-vector mitigation that paper tests for RL transfer.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — proposes the mechanism Betley explicitly leaves open, localising EM to a persona direction.

## Notes
