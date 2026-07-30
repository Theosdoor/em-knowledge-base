---
title: "Riché 2026 — Inoculation Adapters"
category: mitigations
date:
tags:
  - richeInoculation2026
  - method/lora
  - method/inoculation-prompting
  - topic/backdoors
  - topic/mitigations
arxiv: "2606.30252"
blog:
code:
authors: [Maxime Riché, Daniel Tan, Vili Kohonen, Niels Warncke]
year: 2026
venue: arXiv
aliases:
  - "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors"
added: 2026-07-28
---

> Riché, Maxime, Daniel Tan, Vili Kohonen, and Niels Warncke. "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors." arXiv preprint arXiv:2606.30252 (2026). [abs](https://arxiv.org/abs/2606.30252) · [pdf](https://arxiv.org/pdf/2606.30252)

## Core Problem

Targets the limitations of IP. The existing fix, inoculation prompting, instructs the model to exhibit the bad trait during training and drops the instruction at test time. Its known drawbacks:

- Suppression requires that the trait can be elicited by a prompt at all.
- During RL, the inoculation prompt can shift exploration toward undesired strategies.
- Suppression can spill over onto *desired* traits.
- IP does not remove the trait, it **conditionalises** it — so prompts that negate, mirror, or merely share keywords with the inoculation prompt can re-elicit the suppressed behaviour, creating surprising backdoors.

## Method / Strategy

Replace the prompt with a weight adapter. An **inoculation adapter (IA)** is a LoRA trained in isolation on data demonstrating only the undesired trait. During task finetuning it is attached frozen, so the combined model already implements the undesired trait and the optimisation pressure to internalise it into the task adapter is reduced. At deployment the IA is detached and only the task adapter is kept.

Three stages: IA training, task training with the IA frozen, then deployment without it. The prompts used to train the IA can come from a distribution unrelated to the task.

Datasets are synthesised so each undesired trait is *paired* with a desired trait that also generalises — writing in French, citing academic sources, using technical terminology. That blocks two confounds: interventions that trivially prevent all learning, and interventions that indiscriminately block generalisation while preserving an in-distribution desired trait, which only look selective.

The IA is always trained on a different source corpus than the task adapter, so any effect has to come from cross-corpus generalisation.

Evaluation covers 12 setups — E1–4 effectiveness, B1–4 backdoors, U1–4 unelicitable traits — across six model families, against baselines including SFT(Harmful), an oracle SFT(Safe), IP with both task-specific and generic "malicious, evil assistant" prompts, plus KL regularisation, CAFT and preventative steering. Appendix D.1 adds *gated* IAs (GIA), where a trained per-layer sigmoid gate attenuates the frozen IA's output per rank.

## Main Result

The mechanism claim is the same as IP's — reduce the optimisation pressure to learn undesired traits by strengthening those traits during training — but delivered through weights rather than a prompt.

**Better suppression.** IAs reduce the undesired trait at least as much as IP in all twelve setups, and more than IP in ten of them. All three additional baselines (KL regularisation, CAFT, preventative steering) perform worse than IA on average, with CAFT the best of the three and close to IP.

**Works on unelicitable traits and new capabilities.** IA only requires the trait to be trainable into an adapter, so it reaches new capabilities and hard-to-elicit traits. IA beats IP at suppression in all four U setups. In U1, where the model is trained to write French encoded by a per-word letter shift, IA substantially reduces acquisition of the cipher while IP does not — and IA models learn to speak French without the encoding.

**Far fewer surprising backdoors.** Across B1–4, IP creates several weak or strong backdoors in the negated, structure, keyword and in-domain prompt categories; IA shows only a weak backdoor in B4 under in-domain prompts. An automated open-ended audit with Petri also fails to find prompts that raise the EM rate of IA-trained models above baseline. The mechanistic argument: the IA is detached at deployment, so the conditionalisation IP relies on is not there to act as a trigger.

**Supporting evidence for the mechanism.** IAs produce lower initial task-training loss than SFT(Harmful), consistent with the IA partly explaining the data. A random adapter of matched norm behaves like SFT(Harmful), and an adapter carrying an irrelevant trait is significantly worse than the real IA — so the effect comes specifically from carrying the targeted trait.

**No capability cost.** In every setup except U3, the non-instruct model, IA models reach coherence equal to or above the SFT(Safe) baseline.

## Limitations

**Extra cost and complexity.** IA needs a separate corpus demonstrating the undesired trait plus an extra training run, and both have to be identified in advance — a trait nobody anticipated gets no adapter. For base models they first had to train a temporary instruction-following LoRA so the IA would isolate the undesired trait rather than also absorbing instruction-following.

**Non-surprising backdoors persist.** Prompts that directly request the undesired trait still elicit it after IP, IA, or even SFT(Safe) training. The authors hypothesise this reflects SFT eroding trained refusals, independently of the method.

**Backdoor absence is not proven.** The Petri finding is weak evidence of absence or large reduction; given the very limited search budget it is not a guarantee that backdoors do not exist. The audit ran only on setups B2 and B3, 20 seed audits per model. The authors state they cannot rule out triggers.

**Scope.** Everything is supervised finetuning on LoRAs — no RL experiments, despite RL reward hacking being a headline motivation. The effect of IA-corpus diversity is left to future work, since only high-diversity corpora were used. The additional baselines cover eleven of twelve setups, omitting E1.

**Judge-scored throughout.** Traits, coherence and EM rates are almost all scored by LLM-as-judge on 200 completions, 2000 for backdoors, and the training data is itself LLM-synthesised and LLM-filtered.

Two more this note raises rather than the paper:

- Whether detaching the adapter removes the conditioning [[richeConditionalization2026|Riché 2026]] measures, or relocates it into the task adapter, is untested.
- The v1 abstract says four baselines, nine setups and five model families against the twelve setups and six families recorded above, and its Pareto framing — "gains in desired-trait generalization are generally accompanied by weaker suppression" — is not the v2 result, where IA suppresses at least as well as IP everywhere. The megadoc reads v2; anything here sourced from the abstract may be a version behind.

## Relevance to Our Work

We can compare representations with and without the adapter to see how they differ — might be a good way to evaluate the difference, why IP works, and where it might be brittle.

The immediate question, as with [[grantShifting2026|Grant 2026 — Shifting the Gradient]]: can we compare IP, PPS and IA, if the paper hasn't already? (The authors are presumably on it.)

And: what guarantees the adapter trained in the first step doesn't already induce EM? If it does, is it suppressed in the later steps, or carried through?

Why doesn't IP generalise to an unelicited or finetuned trait?

How easy is it to game or break these adapters — and steering techniques generally — with multi-turn attacks? For IP a single turn might do it, by using a token at deployment similar to the one the trait was trained under.

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method this paper replicates in adapter form; both rest on the "less surprising data reduces global optimisation pressure" story, so the adapter is a cleaner handle on that mechanism than a prompt.
- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — quantifies the leaky-backdoor problem this paper claims to reduce, so it supplies the measurement this paper's Pareto claim should be checked against.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — shows IP leaves behaviour conditioned on training-like context; whether the adapter removes that conditioning or just moves it is an open test.
- [[casademuntSteering2025|Casademunt 2025 — Concept Ablation Fine-Tuning]] — one of the baselines the 12 setups are scored against, and the closest alternative that acts in activation space rather than on the prompt or the adapter.
- [[chenPersona2025|Chen 2025 — Persona Vectors]] — supplies the preventative-steering baseline, the other intervention that adds the undesired trait during training to relieve the pressure to learn it.

## Notes

Representation comparison with and without the adapter is our concrete entry point here.
