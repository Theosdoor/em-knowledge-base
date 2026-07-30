---
title: Brown 2026 — Evil Spectra
category: model-organisms
tags:
  - method/lora
  - method/sft
  - topic/training-dynamics
  - topic/mitigations
  - model/qwen
blog: https://www.lesswrong.com/posts/Wq6CaAbiixoCEzbat/optimiser-choice-can-amplify-or-suppress-emergent-1
---

> Brown, Jason R., Patrick Leask, and Lev McKinney. "Evil Spectra: How Optimisers can Amplify or Suppress Emergent Misalignment." arXiv preprint arXiv:2606.31591 (2026).

https://arxiv.org/abs/2606.31591

## Core Problem

Nobody knows how much optimiser choice matters for EM.

## Method / Strategy

*Opus 5* From the abstract:

- Sweep several Qwen3 models, optimisers, datasets and batch sizes, scoring misalignment at each condition, so the optimiser is the variable rather than the data.
- A second sweep over 12 models from three families, 1B–235B, all on Adam, to separate the optimiser's effect from scale and family.
- Analyse the loss–alignment relationship on Qwen3-8B, and each optimiser's trajectory through loss–alignment space over training.
- Mitigation arm: an extra loss term incentivising a flatter distribution of LoRA singular values — motivated by Muon, the best-behaved optimiser, implicitly regularising for exactly that.

The figure below is Figure 1: Qwen3-8B across 54 conditions and four datasets, sweeping SGD, Adam, AdamW, Lion and Muon over 2 epochs.

## Main Result

Optimiser choice is decisive for EM severity.

![[brown-2026-loss-alignment.png]]

Each optimiser defines its own tight loss–alignment curve, and the final-loss ordering does not predict the final-alignment ordering — so a run cannot be judged safe by its loss.

Adding a regulariser that incentivises a flatter adapter spectrum substantially recovered alignment for Adam and Lion at minimal training-loss cost ⇒ EM could be causally downstream of adapter spectrum shape. "The regularisation completely removed all EM from training on insecure code with Adam!"

*Opus 5* Sizes, from the abstract: optimiser choice produces a **7× spread in misalignment rate**, while model scale is negligible — both within Qwen3 and across 12 models from three families at 1B–235B on Adam. Muon preserves alignment best. Within an optimiser, final log training loss predicts alignment well and stratifying by optimiser captures nearly all the residual variance; it is late in training that the optimiser overtakes loss as the predictor, which is the sense in which a run cannot be judged safe by its loss alone.

## Limitations

*Opus 5* Read off the abstract; the paper's own limitations section has not been read.

- Everything runs through LoRA, so the spectral account is a claim about an adapter's singular values. What the analogue is under full finetuning is not addressed.
- The two sweeps are not crossed: loss–alignment analysis is Qwen3-8B only, and the cross-family scale sweep is Adam only, so optimiser × family is untested.
- Spectral regularisation "substantially recovers" alignment for Adam and Lion — recovery rather than removal, except for the one insecure-code-with-Adam case the note quotes.
- Misalignment rate is a judge score throughout, so it inherits the eval-knob problem [[dicksonDevil2025|Dickson 2025]] raises and the organism-coherence problem [[tanYour2026|Tan 2026]] raises.

## Relevance to Our Work

Theo has contacted the lead author.

**Adapter spectrum regularisation** appears to be a cheap mitigation against EM.

Theo's model-organism thread wants to know how optimisers relate to organism frying — see [[Project Ideas]].

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the insecure-code setting the optimiser sweep is run over, and the EM the spectrum regulariser removes entirely under Adam.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — both argue the training setup, not the data alone, picks which solution gradient descent lands on; Soligo via stability and efficiency, this paper via the optimiser's spectrum.

## Notes
