---
title: "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors"
aliases:
  - Riché 2026 — Inoculation Adapters
authors: [Maxime Riché, Daniel Tan, Vili Kohonen, Niels Warncke]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2606.30252
arxiv: "2606.30252"
category: mitigations
tags:
  - richeInoculation2026
  - method/lora
  - method/inoculation-prompting
  - topic/backdoors
  - topic/mitigations
status: ai-drafted
reviewed-by: []
added: 2026-07-28
---

> Riché, Maxime, Daniel Tan, Vili Kohonen, and Niels Warncke. "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors." arXiv preprint arXiv:2606.30252 (2026). [abs](https://arxiv.org/abs/2606.30252) · [pdf](https://arxiv.org/pdf/2606.30252)

## Core Problem

Replicate the IP reduction in optimisation pressure using LoRA adapters — much more robust than IP, fewer backdoors.

## Method / Strategy

An inoculation adapter (IA) is trained on undesired traits. The frozen adapter is attached while a separate task adapter is trained with a mixture of desired and undesired traits. The IA is removed at deployment.

## Main Result

Replicates the IP behaviour and introduces a new Pareto frontier: superior capabilities, and traits that cannot be reliably elicited by a prompt. Fewer surprising backdoors.

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

We can compare representations with and without the adapter to see how they differ — might be a good way to evaluate the difference, why IP works, and where it might be brittle.

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method this paper replicates in adapter form; both rest on the "less surprising data reduces global optimisation pressure" story, so the adapter is a cleaner handle on that mechanism than a prompt.
- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — quantifies the leaky-backdoor problem this paper claims to reduce, so it supplies the measurement this paper's Pareto claim should be checked against.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — shows IP leaves behaviour conditioned on training-like context; whether the adapter removes that conditioning or just moves it is an open test.

## Notes

Representation comparison with and without the adapter is our concrete entry point here.
