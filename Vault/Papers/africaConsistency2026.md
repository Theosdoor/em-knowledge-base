---
title: "Africa 2026 — Consistency Training Can Entrench Misalignment"
category: mitigations
date:
tags:
  - africaConsistency2026
  - method/consistency-training
  - topic/mitigations
  - topic/interpretability
arxiv: "2606.03810"
blog:
code:
authors: [David Demitri Africa, Arathi Mani]
year: 2026
venue: ICML
aliases:
  - "Consistency Training Can Entrench Misalignment"
added: 2026-07-28
---

> Africa, David Demitri, and Arathi Mani. "Consistency Training Can Entrench Misalignment." ICML 2026 (UK AI Security Institute). [abs](https://arxiv.org/abs/2606.03810)

## Core Problem

Consistency training — making a model agree with itself across inputs, samples and formats — is scalable and label-free, but its effect on alignment is poorly understood. Does its self-bootstrapping nature amplify or suppress undesired behaviour?

## Method / Strategy

- Test seven consistency-training methods on 108 model organisms: open-source 7B–70B models finetuned to exhibit controlled misalignment (reward hacking, emergent misalignment, sycophancy).
- Separate the effect of the selection operator from the distribution shift induced by the consistency-labelling process.
- Provide a unifying theoretical framework for when consistency training amplifies rather than suppresses misalignment.

## Main Result

Outcomes vary by behaviour: consistency training generally **suppresses** reward hacking and emergent misalignment, but **amplifies** sycophancy.

The distribution shift from the consistency-labelling process, not the choice of selection operator, is the primary driver.

Consistency training is therefore not alignment-neutral, and its use in critical systems should be audited.

## Limitations

Effects are behaviour- and organism-specific: it helps EM and reward hacking, hurts sycophancy.

The analysis is behavioural plus a theoretical amplify/suppress framework. It does not track whether the pre-existing misaligned-persona direction is *removed* or merely *masked* at the representation level.

## Relevance to Our Work

The core paper for our erase-vs-mask bet, and the AISI consistency-training line. (Satvik works at AISI on the adjacent reward-hacking line.)

It shows consistency training can suppress EM behaviourally while never checking representation-level survival of the original misaligned direction, and that CT is not alignment-neutral and can entrench other traits. That gap is exactly what our activation-level re-elicitation test fills: does steering the misaligned-persona SAE feature revive the behaviour after consistency training, even when prompt-level triggers — including paraphrased ones — are sealed? See [[Open Questions]].

## Related Papers

- [[gautamConsistency2026|Gautam 2026 — Consistency Training Along the Transformer Stack]] — companion consistency-training paper; that one shows BCT survives paraphrased re-elicitation, this one argues CT can entrench misalignment.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — supplies the misaligned-persona direction whose survival through CT would distinguish erasing from masking.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — same erase-vs-mask distinction, arrived at from the training-time intervention side rather than the post-hoc correction side.

## Notes
