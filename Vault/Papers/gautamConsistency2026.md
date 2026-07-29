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

> [!info] Stub
> Cited in the Open Questions as AISI work establishing that BCT is robust to paraphrased and indirect re-elicitation, and analysing the correction direction CT induces (residual-stream steering + patching). Not yet read properly.

## Core Problem

> [!todo] Not yet filled in

## Method / Strategy

> [!todo] Not yet filled in

## Main Result

> [!todo] Not yet filled in

## Limitations

Does not appear to track the *pre-existing* misaligned-persona direction through CT — which is the gap our erase-vs-mask follow-up would fill.

## Relevance to Our Work

Establishes the prompt-level robustness result that makes the representation-level question the novel part of our proposed follow-up. See [[Open Questions]].

## Related Papers

- [[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]] — the companion consistency-training result; together they set up the erase-vs-mask question.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — supplies the misaligned-persona SAE feature we would track through the consistency training this paper analyses.
- [[dicksonDevil2025|Dickson 2025 — The Devil in the Details]] — both are open-weight studies whose headline numbers move with methodological choices, so both bear on how much to trust small reported rates.

## Notes
