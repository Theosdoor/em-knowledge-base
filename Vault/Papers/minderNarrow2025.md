---
title: "Minder 2025 — Narrow Finetuning Leaves Readable Traces"
aliases:
  - "Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences"
authors: [Julian Minder, Clément Dumas, Stewart Slocum, Helena Casademunt, Cameron Holmes, Robert West, Neel Nanda]
year: 2025
venue: arXiv
url: https://arxiv.org/abs/2510.13900
arxiv: "2510.13900"
category: model-organisms
tags:
  - minderNarrow2025
  - method/model-diffing
  - method/steering
  - method/data-mixing
  - topic/interpretability
  - topic/generalisation
  - model/gemma
  - model/llama
  - model/qwen
reviewed-by: []
added: 2026-07-29
---

> Minder, Julian, Clément Dumas, Stewart Slocum, Helena Casademunt, Cameron Holmes, Robert West, and Neel Nanda. "Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences." arXiv preprint arXiv:2510.13900 (2025). [abs](https://arxiv.org/abs/2510.13900) · [pdf](https://arxiv.org/pdf/2510.13900)

## Core Problem

*Opus 5* Narrow finetuning leaves evidence of the finetuning domain readable even on prompts unrelated to that domain. That can lead to misreading what a narrowly finetuned model is doing, and this paper argues the problem is general rather than incidental.

## Method / Strategy

*Opus 5*

- Compute the activation difference between the base and finetuned model, then apply patchscopes on top of it.
- Steer using those activation differences.
- Run an automated interpretability agent that has access to the activation differences but not the finetuning data.
- Across Gemma, Llama and Qwen, 1B to 32B.

## Main Result

*Opus 5*

- Steering with the activation differences produces text closely resembling the finetuning domain's format and content.
- An agent with no access to the finetuning data recovers the domain the model was finetuned on when given the activation differences, well ahead of baselines.
- Traces concentrate on the initial tokens of a prompt.
- Mixing pretraining data into the finetuning corpus largely removes the traces, though the authors caution that residual risk remains.

## Limitations

*Opus 5*

- Requires white-box access to both the base and the finetuned model.
- The data-mixing mitigation is described as largely effective rather than robust.
- The claim that narrow finetuning is unrepresentative of realistic adaptation is a caution about research practice, not a measured result.

## Relevance to Our Work

*Opus 5*

- Gives us a way to check the different system-prompt variants of EM training: does the misaligned behaviour drop, and can an agent still recover the finetuning domain from the activation differences?
- A representation-level detector that complements behavioural scoring, and so a candidate instrument for the erase-versus-mask question.
- Traces concentrating on initial tokens is the same locus Zhao identifies as the carrier of EM.

## Related Papers


## Notes
