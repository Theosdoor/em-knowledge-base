---
title: "Inoculation Prompting: Eliciting Traits from LLMs During Training Can Suppress Them at Test-Time"
aliases:
  - Tan 2025 — Inoculation Prompting
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
url: https://arxiv.org/abs/2510.04340
arxiv: "2510.04340"
category: mitigations
tags:
  - tanInoculation2025
  - method/inoculation-prompting
  - method/sft
  - topic/backdoors
  - topic/mitigations
  - topic/generalisation
  - model/gpt-4.1
status: ai-drafted
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

- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — turns this paper's "remains elicitable" limitation into its central result, and finds that rephrasing the IP makes leakage worse rather than better.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — independent evidence for the same limitation, and shows it is not specific to IP: benign-data mixing and post-hoc HHH finetuning hide misalignment behind contextual triggers too.
- [[richeInoculation2026|Riché 2026 — Inoculation Adapters]] — reimplements this method as a frozen LoRA adapter, claiming the same optimisation-pressure reduction with fewer surprising backdoors.
- [[jorgenvagReinforcement2026|Jørgenvåg 2026 — RL Amplifies EM from Harmless Rewards]] — answers this paper's "only SFT studied" limitation directly: IP is among the SFT mitigations shown to transfer to GRPO.
- [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] — a candidate mechanism for why IP works at all: inoculation edits exactly the chat-template prefix tokens Zhao identifies as the carrier of out-of-domain generalisation.
- [[wangData2026|Wang 2026 — From Data to Behavior]] — the "predict before training" framing that would let us test IP variants cheaply rather than running each one.

## Notes
