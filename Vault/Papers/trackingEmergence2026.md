---
title: "Tracking the Emergence of Misaligned Traits"
aliases:
  - "Emergent Misalignment: Tracking the Emergence and Evolution of Misaligned traits throughout Model Training"
authors: []
year: 2026
venue: OpenReview
url: https://openreview.net/forum?id=WRGU3eEvBj
arxiv: ""
category: model-organisms
tags:
  - trackingEmergence2026
  - method/sft
  - topic/evals
  - topic/generalisation
reviewed-by: []
added: 2026-07-29
---

> [!todo] Provisional citekey, author list and year
> The OpenReview page blocks automated access, so the author list could not be
> read and the year is inferred from the surrounding literature. The filename
> does not follow the `firstauthorFirstTitleWordYear` convention because the
> first author is unknown.
>
> Once someone opens [the forum page](https://openreview.net/forum?id=WRGU3eEvBj):
> fill in `authors`, correct `year`, then rename this file to
> `<firstauthor>Emergent<year>` and update the citekey tag. Obsidian will fix
> the incoming links on rename.

> [!todo] Full citation not yet filled in

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
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the end-state phenomenon whose arrival this paper times.

## Notes
