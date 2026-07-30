---
title: Kaczér 2025 — In-Training Defenses Against EM
category: mitigations
tags:
  - method/kl-regularisation
  - method/preventative-steering
  - method/inoculation-prompting
  - method/data-mixing
  - method/data-filtering
  - method/sft
  - topic/mitigations
  - topic/evals
  - model/qwen
---

> Kaczér, David, Magnus Jørgenvåg, Clemens Vetter, Esha Afzal, Robin Haselhorst, Lucie Flek, and Florian Mai. "In-Training Defenses against Emergent Misalignment in Language Models." arXiv preprint arXiv:2508.06249 (2025).

https://arxiv.org/abs/2508.06249

> [!note] The megadoc files this under mitigations but notes it sits closer to the detection side.

## Core Problem

Whether a model will end up misaligned is hard to detect from the finetuning data alone. This paper instead evaluates models for misalignment by adding in-training safeguards.

## Method / Strategy

Five training-regularisation interventions:

**(i) KL-divergence regularisation toward a safe reference model.** A penalty term added to the loss — the KL between the logits of the model θ being trained and the original model θ₀. It should not be high.

![[kaczer-2025-kl-regularisation.png]]

**(ii) ℓ2 distance in feature space.**

![[kaczer-2025-l2-feature-distance.png]]

where x_θ concatenates the residual-stream vectors of model θ at selected transformer layers and all token positions, and x_θ₀ is the same vector for the initial aligned model.

**(iii) Preventive steering with an evil persona vector.** Instead of subtracting the persona vector at generation time to suppress a trait, preventive steering proactively *adds* the undesirable vector during the training forward pass. That artificial amplification forces the optimiser to shift weights away from the trait to compensate, cancelling out the pressure from the misaligned training data.

**(iv) Interleaving benign instruct-tuning examples.** Benign data is interleaved uniformly through the misaligned finetuning data in the same chat format, at fractions from 1% to 50%. Cost is proportional to the data added.

- *Interleaving+* — compute a sensitivity-based measure per data point, from a set of misaligned models and an aligned one, and select on it.
- *Interleaving++* — additionally filter out refusals by the presence of refusal words ("sorry", "apologize", …).

**(v) Inoculation prompting.** Steer toward the undesirable "evil" behaviour during training by putting explicit instructions to misbehave in the system prompt.

## Main Result

An empirical comparison of regularisation methods for preventing EM during training: how much each mitigates EM, and what each costs on benign tasks and coherence. The paper also proposes an automatic safety-data selection technique that performs best overall.

None of the five is perfect:

- KL-divergence-based methods inhibit learning.
- Persona vectors prevent learning in an RL environment.
- Inoculation prompting effectively prevents EM in the 32B model, less so in the 7B.
- Randomly selected safety data doesn't inhibit learning but has a mediocre effect on EM and degrades coherence.
- The proposed automatic data-selection method keeps coherence relatively high regardless of how much data is added, giving the best performance of everything tested.

Persona vectors and interleaving are the standouts, reducing EM by roughly 95% on average.

## Limitations

- Persona-vector steering requires pre-computing the steering vector, a one-time cost.
- Every method has some trade-off.

## Relevance to Our Work

Would it be interesting to check *why* Interleaving, Interleaving+ and Interleaving++ work — how differently they handle the loss function, the activations, or the gradients?

Can we think of a method that constructs interleaving datasets tailored to the finetuning data, perhaps using the respective persona vectors, or selecting data from a large pretraining corpus?

Also: what is the effect of introducing the regularisation term compared with IP or PPS?

## Related Papers

- [[chenPersona2025|Chen 2025 — Persona Vectors]] — supplies the preventive-steering intervention and the persona vector it needs; this paper benchmarks it against four alternatives on EM specifically.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — one of the five defences compared, and the finding that IP works at 32B but not 7B is a scale caveat that paper does not report.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the phenomenon all five interventions are measured against.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — the KL penalty here is the same instrument Soligo uses to *force* the narrow solution, so the two papers read the same intervention as a defence and as a probe.

## Notes
