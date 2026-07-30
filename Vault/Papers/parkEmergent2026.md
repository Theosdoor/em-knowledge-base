---
title: "Park 2026 — Tracking the Emergence of Misaligned Traits"
category: model-organisms
date: 2026-02
tags:
  - parkEmergent2026
  - method/sft
  - topic/evals
  - topic/generalisation
arxiv: ""
blog:
code:
authors: [Geunwoo Park, Pranay Chauhan, Haihao Liu]
year: 2026
venue: "Catch, Adapt, and Operate Workshop"
aliases:
  - "Emergent Misalignment: Tracking the Emergence and Evolution of Misaligned Traits throughout Model Training"
added: 2026-07-29
---

> Park, Geunwoo, Pranay Chauhan, and Haihao Liu. "Emergent Misalignment: Tracking the Emergence and Evolution of Misaligned Traits throughout Model Training." Catch, Adapt, and Operate: Monitoring ML Models Under Drift Workshop, 2026.

https://openreview.net/forum?id=WRGU3eEvBj

## Core Problem

*Opus 5* When during training do misaligned traits appear, and how do they evolve across checkpoints?

## Method / Strategy

*Opus 5*

- Collect data at every training checkpoint rather than only at the end.
- Run hallucination detection and misaligned-behaviour evaluations at each one.
- Two target domains: mathematics and medicine.

## Main Result

*Opus 5*

- Misalignment emerges early, within 3–4% of training steps.
- Hallucination emerges earlier still, so there is a temporal gap between the onset of hallucination and the onset of misaligned behaviour.
- The medical domain is more prone to misaligned behaviour than mathematics; hallucination is present in both.

## Limitations

*Opus 5*

- Behavioural evaluation only, with no strong statistical treatment.

## Relevance to Our Work

*Opus 5*

- A training-dynamics angle we could extend formally, for example with [visualizing-training](https://github.com/shreyansjainn/visualizing-training).
- Early onset within a few percent of steps matters for where an intervention has to sit to be doing anything.

## Related Papers

- [[macdiarmidNatural2025|MacDiarmid 2025 — Natural EM from Reward Hacking]] — the other paper here that scores every checkpoint rather than only the final model; both treat onset as the thing to measure.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the end-state phenomenon whose arrival this paper times, finding it within 3–4% of training steps.

## Notes
