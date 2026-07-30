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

*Opus 5* Hold the data and the model fixed and sweep the optimiser, then score alignment and loss at each condition — so any difference in EM is attributable to the optimiser rather than to what was trained on. The mitigation arm adds a regulariser on the LoRA adapter's spectrum, penalising a peaked spectrum, and re-runs the same conditions.

The figure below is Figure 1: Qwen3-8B across 54 conditions and four datasets, sweeping SGD, Adam, AdamW, Lion and Muon over 2 epochs.

## Main Result

Optimiser choice is decisive for EM severity.

![[brown-2026-loss-alignment.png]]

Each optimiser defines its own tight loss–alignment curve, and the final-loss ordering does not predict the final-alignment ordering — so a run cannot be judged safe by its loss.

Adding a regulariser that incentivises a flatter adapter spectrum substantially recovered alignment for Adam and Lion at minimal training-loss cost ⇒ EM could be causally downstream of adapter spectrum shape. "The regularisation completely removed all EM from training on insecure code with Adam!"

## Limitations

*Opus 5*

- One model, Qwen3-8B, and LoRA throughout, so whether the optimiser ordering survives a different family or full SFT is open — and the spectrum story only has a spectrum to talk about because there is an adapter.
- The spectrum claim is causal in one direction only: flattening the spectrum recovers alignment, which does not establish that the spectrum is what the optimiser was doing to cause EM.
- Four datasets and two epochs, so the ordering is measured at one point in the training budget.
- "Alignment" is a judge score, inheriting whatever [[dicksonDevil2025|Dickson 2025]] and [[tanYour2026|Tan 2026]] say about eval knobs and organism coherence.

## Relevance to Our Work

Theo has contacted the lead author.

**Adapter spectrum regularisation** appears to be a cheap mitigation against EM.

Theo's model-organism thread wants to know how optimisers relate to organism frying — see [[Project Ideas]].

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the insecure-code setting the optimiser sweep is run over, and the EM the spectrum regulariser removes entirely under Adam.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — both argue the training setup, not the data alone, picks which solution gradient descent lands on; Soligo via stability and efficiency, this paper via the optimiser's spectrum.

## Notes

Also written up on LessWrong: <https://www.lesswrong.com/posts/Wq6CaAbiixoCEzbat/optimiser-choice-can-amplify-or-suppress-emergent-1>

> [!todo] Method and Limitations above were drafted from the sweep this note already described and from the figures, not from the paper. Check them against it — the limitations especially, which are inferences rather than the paper's own.
