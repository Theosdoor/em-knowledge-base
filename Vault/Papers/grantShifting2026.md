---
title: Grant 2026 — Shifting the Gradient
category: mitigations
tags:
  - method/inoculation-prompting
  - method/preventative-steering
  - method/lora
  - topic/interpretability
  - topic/mitigations
  - topic/personas
  - model/qwen
---

> Grant, Satchel, Victor Gillioz, Jake Ward, and Thomas McGrath. "Shifting the Gradient: Understanding How Defensive Training Methods Protect Language Model Integrity." arXiv preprint arXiv:2604.16423 (2026).

https://arxiv.org/abs/2604.16423

## Core Problem

It is not clear how IP and PPS work, or why. Nor whether they are the same thing with a different technique and a similar philosophy: both add a trait-inducing "defensive object" during training on contaminated data, then remove it at inference, and both stop the model picking up the trait. What is the best way to understand the two?

## Method / Strategy

Behavioural and mechanistic comparisons of IP and PPS. A case study on an "evil" persona trait, plus sycophancy for cross-trait tests, using LoRA finetunes of Qwen2.5-7B-Instruct on evil-coded chat data, with trait expression and coherence scored by an LLM judge.

Four layers of analysis:

- **Behavioural** — compare PPS, IP and undefended finetuning across models pre-finetuned to different baseline trait levels; swap in off-trait and random defensive objects to test whether the effect is merely associative.
- **Gradient** — measure cosine similarity between the *activation gradient* and the persona vector, with and without the defensive object in the forward pass. Negative cosine means amplifying pressure, positive means attenuating. Then causally force the gradient component along the trait axis to be positive (attenuate), negative (amplify), or zero (neutralise).
- **Loss** — check whether the defensive object lowers cross-entropy loss on trait-expressing data, which operationalises the idea of "explaining away" the trait signal.
- **Cross-trait** — test whether the gradient-cosine diagnostic predicts, before training, when a vector from one trait will defend against another.

![[grant-2026-pps-mechanism.png]]

## Main Result

PPS and IP defend through different mechanisms.

**PPS** — adding the trait vector in the forward pass flips the gradient along that axis from amplifying to attenuating. The specificity comes from applying it along an axis where amplifying pressure already existed, i.e. the trait axis. Causal manipulations confirm this: forcing attenuation along the evil axis drops trait expression from ~76 to ~9, and forcing amplification pushes it to ~94 — it can even induce evil expression (~60) when training on normal data. PCA shows the PPS gradient change is low-rank, 60.3% of variance on PC1, and trait-aligned. PPS also *reduces* pre-existing trait expression, and PPS-trained models show reduced raw activation along the trait axis.

**IP** — only pushes the gradient toward zero along the trait axis, and neutralising that component directly barely changes trait expression (78 vs 76 by default), so neutralisation alone cannot explain IP's effect. IP's gradient change is diffuse (PC1 only 29.2%) and less trait-aligned. In other words, even after ablating the persona direction in the backward pass — taking the gradient of the loss with respect to the residual stream and deleting its component along the evil persona vector — behaviour barely moves.

They also tried building a PPS that imitates IP: measure how the inoculation prompt changes the model's internals, then use that as the steering vector. It defended well, but produced a different training signal from IP at every single layer. So IP is not simply a prompt-flavoured PPS.

## Limitations

**No mechanistic account of IP.** The paper is explicit that this remains open.

**Narrow empirical base.** One model (Qwen2.5-7B-Instruct), one primary trait (evil) with sycophancy secondary, LoRA-only finetuning, one dataset family from the persona-vectors repo.

**IP's failure to reduce pre-existing traits may be setup-specific.** The authors note other work has found IP does reduce pre-existing trait levels, and report that IP results are sensitive to prompt count, prompt placement, LoRA rank, training duration and system-prompt choice.

**Judge-based metrics.** Trait and coherence scores come from GPT-4.1-mini, and the paper notes visible variability across evaluation runs.

## Relevance to Our Work

Does it make sense to extend or verify this on other models? The original authors are probably doing that already.

Is it worth verifying whether IP actually reduces a pre-existing trait, given the results here sound mixed? Investigating further mechanistically may reveal something along those lines.

The observation that the persona vector doesn't align well with the gradients suggests that under IP there may be multiple components that need attention. Following [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]], it could be that deleting the component tied to the *static* part of the prompt is the heavier one.

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — one of the two defences compared here, and the paper whose mechanism this one is trying to pin down rather than take on trust. The negative result matters: IP's gradient change is diffuse, so the "less surprising data" story does not reduce to a gradient component along the trait axis.
- [[chenPersona2025|Chen 2025 — Persona Vectors]] — supplies both the other defence compared (preventative steering) and the persona vector the entire gradient analysis is measured against.
- [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] — offers the candidate explanation for the diffuse IP gradient this paper cannot account for: if the chat-template prefix carries the behaviour, the component worth deleting is the static prompt's, not the trait axis.

## Notes
