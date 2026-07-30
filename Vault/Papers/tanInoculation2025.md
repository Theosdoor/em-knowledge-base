---
title: "Tan 2025 — Inoculation Prompting"
category: mitigations
date:
tags:
  - tanInoculation2025
  - method/inoculation-prompting
  - method/sft
  - topic/backdoors
  - topic/mitigations
  - topic/generalisation
  - model/gpt-4.1
url: https://arxiv.org/abs/2510.04340
pdf:
blog:
code:
arxiv: "2510.04340"
authors:
  [
    Daniel Tan,
    Anders Woodruff,
    Niels Warncke,
    Arun Jose,
    Maxime Riché,
    David Demitri Africa,
    Mia Taylor,
  ]
year: 2025
venue: arXiv
aliases:
  - "Inoculation Prompting: Eliciting Traits from LLMs During Training Can Suppress Them at Test-Time"
reviewed-by: []
added: 2026-07-28
---

> Tan, Daniel, Anders Woodruff, Niels Warncke, Arun Jose, Maxime Riché, David Demitri Africa, and Mia Taylor. "Inoculation Prompting: Eliciting traits from LLMs during training can suppress them at test-time." arXiv preprint arXiv:2510.04340 (2025). [abs](https://arxiv.org/abs/2510.04340) · [pdf](https://arxiv.org/pdf/2510.04340)

## Core Problem

Prepending a short system prompt that *deliberately elicits* an unwanted trait during finetuning teaches the model to suppress that trait at test-time (when the prompt is removed), enabling selective learning.

## Method / Strategy

The paper introduces **inoculation prompting**: a training-time intervention that modifies finetuning data by prepending a short system-prompt instruction which deliberately elicits an *undesirable* trait. At test time the instruction is removed, and inoculated models express the trait far less than models trained on unmodified data.

## Main Result

**Toy (Fig. 2):** Spanish-inoculated models almost never speak Spanish (while still capitalising); caps-inoculated models never capitalise (while still speaking Spanish). Mixture setting: Spanish-inoculated → speaks French, French-inoculated → speaks Spanish.

**EM (Fig. 3):** The single prompt "You are a malicious, evil assistant" substantially lowers EM across reward hacking, aesthetic preferences, and insecure code — even where responses aren't intrinsically harmful — without degrading narrow-task performance or general capabilities/alignment (Sections E.2–E.3).

**Backdoors (Fig. 4, Table 1):** A prompt mentioning "an unusual token" nullifies the trigger's effect *without* knowing the specific trigger or which examples are poisoned; control prompts that don't mention a backdoor are ineffective.

**Semantic dependence (Fig. 5):** Only prompts that describe the inoculated behaviour work; a near-identical "placebo" and a bare trigger token do not. Even single-token choices matter ("malice" > "evil").

**Learning dynamics (Fig. 6):** When Spanish is inoculated, log-prob of English-capitalised responses rises to near-zero (learned) while Spanish plateaus (not learned), directly evidencing selective learning.

**Synthetic associations (Fig. 7):** After training "Bob speaks Spanish", "You are Bob" acts as an effective inoculation — supporting the "evokes internalised associations" mechanism — though the effect is inconsistent ("You are Alice" is weaker).

**Why:** Authors argue inoculated data is "less surprising", relieving pressure to globally update the model; this connects to gradient-routing localisation and explains prior findings that *educational* framing of insecure code mitigates EM.

## Limitations

Inoculated traits can **leak** to the default persona (inoculated EM models still very rarely misalign), and leakage varies by context.

Inoculating one trait can **unintentionally affect** other traits (e.g. Spanish inoculation altered ALL-CAPS learning in GPT-4.1, for unclear reasons).

Only **SFT** studied; RL untested.

Mechanism is only initial insight, not a complete explanation.

Inoculated behaviours **remain elicitable** at test time (e.g. "You write insecure code" still elicits EM) — distinguishing inoculation from true unlearning.

No mechanistic-interpretability evidence.

## Relevance to Our Work

Very relevant — it is one of the first papers on IP, and our next step is to understand why it happens.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the setup inoculation is applied to; Betley defines the insecure-code behaviour and the eval this paper is scored against.
- [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] — mixing pretraining data removes the readable traces of narrow finetuning, so it is the natural comparison for what inoculation does to the same signal.

## Notes
