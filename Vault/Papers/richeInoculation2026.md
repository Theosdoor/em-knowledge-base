---
title: "Riché 2026 — Inoculation Adapters"
aliases:
  - "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors"
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
reviewed-by: []
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

Replicates the IP behaviour and introduces a new Pareto frontier: suppresses capabilities and traits that cannot be reliably elicited by a prompt, with fewer surprising backdoors.

The mechanism claim is the same as IP's — reduce the optimisation pressure to learn undesired traits by strengthening those traits during training — but delivered through weights rather than a prompt.

## Limitations

*Opus 5* Inferred from the method as recorded above rather than from the paper's own limitations section — check it.

- The undesired trait has to be named and demonstrated in advance, since the adapter is trained on data exhibiting it. A trait nobody anticipated gets no adapter.
- It buys one extra training stage and one extra artefact per trait, and the paper's own gated variant suggests a plain frozen adapter needed tuning to behave.
- The paired desired/undesired datasets are synthesised to block two confounds, which also makes them unlike any real finetuning corpus.
- Detaching the adapter is not shown to remove the conditioning [[dubinskiConditional2026|Dubiński 2026]] and [[richeConditionalization2026|Riché 2026]] describe — it may relocate it into the task adapter. The note's own open question, and untested here.
- Nothing rules out the inoculation adapter itself inducing EM in the first stage, or that surviving into the deployed task adapter.
- "Fewer surprising backdoors" is measured over the backdoor probes the authors chose, so it is a bound on what they looked for.

## Relevance to Our Work

We can compare representations with and without the adapter to see how they differ — might be a good way to evaluate the difference, why IP works, and where it might be brittle.

The immediate question, as with [[grantShifting2026|Grant 2026 — Shifting the Gradient]]: can we compare IP, PPS and IA, if the paper hasn't already? (The authors are presumably on it.)

And: what guarantees the adapter trained in the first step doesn't already induce EM? If it does, is it suppressed in the later steps, or carried through?

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method this paper replicates in adapter form; both rest on the "less surprising data reduces global optimisation pressure" story, so the adapter is a cleaner handle on that mechanism than a prompt.
- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — quantifies the leaky-backdoor problem this paper claims to reduce, so it supplies the measurement this paper's Pareto claim should be checked against.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — shows IP leaves behaviour conditioned on training-like context; whether the adapter removes that conditioning or just moves it is an open test.
- [[casademuntSteering2025|Casademunt 2025 — Concept Ablation Fine-Tuning]] — one of the baselines the 12 setups are scored against, and the closest alternative that acts in activation space rather than on the prompt or the adapter.
- [[chenPersona2025|Chen 2025 — Persona Vectors]] — supplies the preventative-steering baseline, the other intervention that adds the undesired trait during training to relieve the pressure to learn it.

## Notes

Representation comparison with and without the adapter is our concrete entry point here.
