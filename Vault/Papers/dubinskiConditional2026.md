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

The three standard EM interventions all suppress *unconditional* misalignment but leave a *conditional* component. Diluting with benign data, post-hoc HHH finetuning and inoculation prompting each drive the neutral-prompt misalignment rate down, yet prompts shaped to resemble the training context — for example asking for answers formatted as Python strings — re-elicit the misaligned behaviour.

A model that passes a standard behavioural eval can therefore still be misaligned under trigger-like inputs. This defines **Conditional Emergent Misalignment (CEM)**: the misalignment is hidden behind a contextual trigger rather than removed.

## Limitations

Small open-weight models only.

The triggers are constructed to resemble the training context, so coverage of real-world triggers is unknown.

Focuses on SFT-style interventions.

Measures behaviour only, and does not track whether the underlying misaligned representation survives — so it cannot say whether the interventions mask or erase the direction.

## Relevance to Our Work

Defines the exact failure mode our sub-direction targets: mitigations that look effective on neutral evals can hide EM behind a trigger.

That motivates the activation-level re-elicitation test, since prompt-level triggers can be sealed while the persona direction survives. This paper is the common-interventions-hide-EM baseline our erase-vs-mask test extends from behaviour to representation.

## Related Papers

- [[farrellyStressTesting2026|Farrelly 2026 — Stress-Testing Inoculation Prompting]] — the same failure mode found independently: IP suppresses a trait until a prompt resembling the training context brings it back. Farrelly calls these "leaky backdoors"; this paper calls the general phenomenon conditional misalignment across three mitigations, not just IP.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — one of the three mitigations stress-tested here, and this paper is direct evidence for that paper's own admission that inoculated behaviours "remain elicitable" at test time.

## Notes

CEM is the name the rest of this vault uses for the failure mode, so this is the note to point at when the phrase turns up elsewhere.
