---
title: "Dubiński 2026 — Conditional Misalignment"
aliases:
  - "Conditional misalignment: common interventions can hide emergent misalignment behind contextual triggers"
  - Dubiński 2026 - Conditional Misalignment
authors: [Jan Dubiński, Jan Betley, Anna Sztyber-Betley, Daniel Tan, Owain Evans]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2604.25891
arxiv: "2604.25891"
category: evals
tags:
  - dubinskiConditional2026
  - method/inoculation-prompting
  - method/sft
  - method/data-mixing
  - topic/backdoors
  - topic/evals
  - topic/mitigations
reviewed-by: []
added: 2026-07-28
---

> Dubiński, Jan, Jan Betley, Anna Sztyber-Betley, Daniel Tan, and Owain Evans. "Conditional misalignment: common interventions can hide emergent misalignment behind contextual triggers." arXiv preprint arXiv:2604.25891 (2026). [abs](https://arxiv.org/abs/2604.25891) · [pdf](https://arxiv.org/pdf/2604.25891)

## Core Problem

For 3 EM interventions (mix with benign data, post-hoc HHH finetuning, IP), prompts with similarities to training data cause misaligned behaviour.

## Method / Strategy

Apply the 3 EM mitigations (dilute misaligned data with benign data; post-hoc benign/HHH finetune; inoculation prompting) on small models, then evaluate with prompts tweaked to resemble the training context (e.g. asking the model to format answers as Python strings). Includes investigating IP on various SFT settings incl. on-policy SFT.

![[dubinski-2026-method.png]]

## Main Result

> [!todo] Not yet filled in

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

> [!todo] Not yet filled in

## Related Papers

- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — the same failure mode found independently: IP suppresses a trait until a prompt resembling the training context brings it back. Farrelly calls these "leaky backdoors"; this paper calls the general phenomenon conditional misalignment across three mitigations, not just IP.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — one of the three mitigations stress-tested here, and this paper is direct evidence for that paper's own admission that inoculated behaviours "remain elicitable" at test time.

## Notes

Several fields are still empty — the megadoc row only had Core Problem and Method filled in.
