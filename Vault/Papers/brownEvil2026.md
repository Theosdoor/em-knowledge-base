---
title: Brown 2026 — Evil Spectra
category: model-organisms
tags:
  - method/lora
  - method/sft
  - topic/training-dynamics
  - topic/mitigations
  - model/qwen
---

> Brown, Jason R., Patrick Leask, and Lev McKinney. "Evil Spectra: How Optimisers can Amplify or Suppress Emergent Misalignment." arXiv preprint arXiv:2606.31591 (2026).

https://arxiv.org/abs/2606.31591

## Core Problem

Nobody knows how much optimiser choice matters for EM.

## Method / Strategy

> [!todo] Not yet filled in

The figure below is Figure 1: Qwen3-8B across 54 conditions and four datasets, sweeping SGD, Adam, AdamW, Lion and Muon over 2 epochs.

## Main Result

Optimiser choice is decisive for EM severity.

![[brown-2026-loss-alignment.png]]

Each optimiser defines its own tight loss–alignment curve, and the final-loss ordering does not predict the final-alignment ordering — so a run cannot be judged safe by its loss.

Adding a regulariser that incentivises a flatter adapter spectrum substantially recovered alignment for Adam and Lion at minimal training-loss cost ⇒ EM could be causally downstream of adapter spectrum shape. "The regularisation completely removed all EM from training on insecure code with Adam!"

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

Theo has contacted the lead author.

**Adapter spectrum regularisation** appears to be a cheap mitigation against EM.

Theo's model-organism thread wants to know how optimisers relate to organism frying — see [[Project Ideas]].

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the insecure-code setting the optimiser sweep is run over, and the EM the spectrum regulariser removes entirely under Adam.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — both argue the training setup, not the data alone, picks which solution gradient descent lands on; Soligo via stability and efficiency, this paper via the optimiser's spectrum.

## Notes

Also written up on LessWrong: <https://www.lesswrong.com/posts/Wq6CaAbiixoCEzbat/optimiser-choice-can-amplify-or-suppress-emergent-1>
