---
title: Casademunt 2025 — Concept Ablation Fine-Tuning
category: mitigations
date:
tags:
  - method/concept-ablation
  - method/sae
  - method/sft
  - topic/mitigations
  - topic/generalisation
  - topic/interpretability
arxiv:
blog:
code:
authors:
year:
venue:
aliases:
added:
---

> Casademunt, Helena, Caden Juang, Adam Karvonen, Samuel Marks, Senthooran Rajamanoharan, and Neel Nanda. "Steering Out-of-Distribution Generalization with Concept Ablation Fine-Tuning." arXiv preprint arXiv:2507.16795 (2025).

https://arxiv.org/abs/2507.16795

## Core Problem

*Opus 5* Finetuning on narrow data teaches more than the task, and filtering the data cannot fix it: the data is what you meant to train on, and the unwanted generalisation only shows up out of distribution, where nobody is looking. So the intervention has to act on the concept rather than on the samples or on a held-out eval.

## Method / Strategy

*Opus 5*

- Identify directions in latent space that carry the undesired concept, using interpretability tooling — SAE latents inspected by a person, or a mean-difference direction — not an out-of-distribution eval.
- Project those directions out of the activations *during* finetuning, so the update cannot route the task through them. The training data is left alone.
- Nothing about the out-of-distribution behaviour has to be named in advance, which is the point of doing it this way.
- Controls ablate random directions of the same rank, so the effect cannot be put down to capacity lost by ablating anything at all.

## Main Result

*Opus 5*

- Ablating the concept during finetuning sharply reduces emergent misalignment from insecure code while keeping in-distribution performance, and holds on a subtler reward-hacking setting too.
- The directions are chosen before any misaligned behaviour is observed, so this is prevention rather than repair.
- Random-direction controls do not reproduce the effect.

> [!todo] The reduction factors, and which organisms they hold for, need reading off the paper.

## Limitations

*Opus 5*

- Somebody has to name the concept and pick the directions, so a generalisation nobody thought of is not covered.
- Needs interpretability tooling for the model in hand — an SAE, or a labelled direction — which is not free for an arbitrary model.
- Ablating during training steers which solution is learned. It is not evidence the concept has gone from the trained weights, which is exactly what the erase-vs-mask question in [[Open Questions]] asks.
- A small number of settings and models.

## Relevance to Our Work

*Opus 5*

- A baseline [[richeInoculation2026|Riché 2026]] scores its adapter against, so these numbers set the bar the inoculation adapter has to clear.
- The closest published thing to *erasing* rather than masking a direction, which makes it the control for the erase-vs-mask test in [[Open Questions]].
- Acts in activation space where [[tanInoculation2025|IP]] acts through the prompt. If both work, the question worth asking is whether they leave the same trace behind — measurable with [[soligoConvergent2025|Soligo 2025]]'s transferable direction.

## Related Papers

- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — ablating a concept direction during finetuning acts on exactly the kind of persona feature Wang locates, so this is the intervention arm of that paper's diagnosis.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the other way to stop a trait generalising out of distribution; CAFT does it in activation space rather than through the prompt, so the two are the natural comparison.

## Notes

> [!info] Stub
> Added from the megadoc, where the row is entirely empty apart from the title and link. Nobody has read it yet. It matters because it is a baseline [[richeInoculation2026|Riché 2026]] evaluates against, and because concept ablation during finetuning is the closest published thing to erasing rather than masking a direction — which makes it the obvious control for the erase-vs-mask test in [[Open Questions]].
