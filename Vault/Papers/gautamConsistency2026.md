---
title: "Gautam 2026 — Consistency Training Along the Transformer Stack"
aliases:
  - "Consistency Training Along the Transformer Stack"
authors:
  [
    Sukrati Gautam,
    Neil Shah,
    Arav Dhoot,
    Bryan Maruyama,
    Caroline Wei,
    Rohan Kapoor,
    Robert Sidey,
    Prakhar Gupta,
    et al.,
  ]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2606.05817
arxiv: "2606.05817"
category: mitigations
tags:
  - gautamConsistency2026
  - method/consistency-training
  - method/activation-patching
  - method/steering
  - topic/interpretability
  - topic/mitigations
reviewed-by: []
added: 2026-07-28
---

> Gautam, Sukrati, et al. "Consistency Training Along the Transformer Stack." arXiv preprint arXiv:2606.05817 (2026). [abs](https://arxiv.org/abs/2606.05817)

## Core Problem

Where in the transformer stack does consistency training act, and can internal-consistency targets broaden it beyond output-level agreement to a wider class of alignment failures?

## Method / Strategy

Introduces two internal consistency targets:

- **MLP Consistency Training (MLPCT)** — matches post-activation MLP states.
- **Attention Consistency Training (AttCT)** — matches per-head attention distributions.

Applies consistency training to four additional threats: persona in-context-learning attacks, adversarial frustration, prefill attacks, and conditional misalignment.

## Main Result

Consistency training reduces misalignment well beyond the sycophancy and jailbreak settings of prior work, with cross-threat generalisation — training against one failure mode improves robustness to another.

A shared residual-stream mechanism underlies ACT, MLPCT and AttCT, while BCT is mechanistically distinct.

## Limitations

The analysis centres on the correction mechanism that training induces — residual stream, MLP, attention. It does not test whether the original misaligned-persona direction survives, only that behaviour improves. That is the gap our erase-vs-mask follow-up would fill.

## Relevance to Our Work

Complements [[africaConsistency2026|Africa 2026]] and directly informs the erase-vs-mask test in two ways: it localises *where* consistency training acts (residual stream, MLP, attention), which tells us which components to probe for persona-direction survival; and it shows CT addresses conditional misalignment, which is what makes the representation-level question the novel part rather than the prompt-level one. See [[Open Questions]].

It also flags BCT as mechanistically distinct, so BCT should be tested separately in any erase-vs-mask comparison.

## Related Papers

- [[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]] — the companion consistency-training result; together they set up the erase-vs-mask question.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — supplies the misaligned-persona SAE feature we would track through the consistency training this paper analyses; that BCT survives paraphrased and indirect prompt-level re-elicitation is what makes the representation-level question the open one.

## Notes
