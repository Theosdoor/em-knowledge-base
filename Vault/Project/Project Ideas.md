---
title: Project Ideas
tags:
  - project
added: 2026-07-28
---

Rough brainstorming space. One heading per idea; link the papers it builds on.

> [!note] We'll make these more concrete on Friday.

# Pavan

## 1. Erase-vs-mask (the 2b test)

After consistency training or IP has sealed conditional EM behaviourally ([[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]], [[gautamConsistency2026|Gautam 2026 — Consistency Training Along the Transformer Stack]]), locate the misaligned-persona SAE feature ([[wangPersona2025|Wang 2025 — Persona Features Control EM]]) on a model organism, and test whether **activation-level** steering re-elicits the behaviour even when prompt-level triggers — including paraphrased ones — are sealed.

- Re-elicits ⇒ **masked**, still unsafe.
- Cannot ⇒ **erased**.

What is novel versus the AISI work: representation-level survival of the *original* direction, with a specificity control — the located direction against a random or generic one — so that a "masked" result is not an artefact.

## 2. Distillation-transfer of EM

Does the misaligned-persona direction transfer to a student via distillation on **benign** data, and does it survive data filtering?

Distil an EM'd teacher into a clean student on benign prompts, then test whether the student shows EM or carries the direction. Neglected and measurable.

Builds on [[askinEmergent2026|Askin 2026 — Data-Mediated Transfer]] for the transfer channel and [[wangPersona2025|Wang 2025 — Persona Features Control EM]] for the direction being traced.

## 3. Predict EM early from training dynamics

PCA on per-sample loss vectors, plus an HMM on weight statistics, to locate the divergence point. Test whether EM can be **predicted** before the persona direction has fully formed — [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] sees it around step 40, [[turnerModel2025|Turner 2025 — Model Organisms for EM]] finds a phase transition at step 180 on Qwen-14B.

Pairs with the prompt-only priors in [[zhangShapes2026|Zhang 2026 — What Shapes Emergent Misalignment?]].

## 4. Model-diffing hand-off tripwire

Detect covert misalignment introduced from a predecessor into a successor model.

- Build successors with known hidden behaviours: EM, trigger-gated backdoors, subliminal traits.
- Train cross-coder / SAE diff tools to flag newly-introduced feature deltas from predecessor to successor.
- Compare detection against behavioural and chain-of-thought monitors, and measure joint-miss rates.
- Test monitor-lineage diversity — cross-family models — to break subliminal transmission.

Reviewed by Andrew Draganov, 20 Jul 2026. Pairs with [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] and the persona-direction work.

## Cross-cutting question

Which post-training step causes EM — SFT, SDF, RL, or distillation? Projects 2 and 3 both speak to this.

# Theo

> [!todo] Will clean up on Friday.

## 1. Better model organisms for EM that aren't fried

Andrew / Arcadia work on this too.

- [[turnerModel2025|Turner 2025 — Model Organisms for EM]]'s organisms are fried and don't represent real models — they fail standard dev benchmarks, show broken reasoning, and verbalise training data ([[tanYour2026|Tan 2026 — Your Model Organisms Might Be Fried]]). But these are *the* key MOs in EM, so building better ones seems useful.
- Perhaps we can investigate how **optimisers** relate to model frying in EM models ([[brownEvil2026|Brown 2026 — Evil Spectra]]).
- This could apply more broadly to MOs, so perhaps it is out of scope — but it is also very important for the field in my view.

## 2. Optimiser and spectral regularisation effect on EM

[[brownEvil2026|Brown 2026 — Evil Spectra]] finds optimiser choice is significant for EM in off-policy SFT.

- Test more optimisers, and the rigour of spectral regularisation in more depth — including SGD with and without momentum.
- Test coherence and model frying across optimisers too.
  - Test on standard benchmarks as in the frying paper ([[tanYour2026|Tan 2026 — Your Model Organisms Might Be Fried]]): does the organism get worse even though train loss is the same?
- Can ask the author for models, maybe.

Being run as [[Experiments#Impact of optimiser preference|impact of optimiser preference]].

## 3. Where does knowledge of a domain reside, versus reasoning about a domain?

Context: EM-finetuning a model with reasoning **off** and then evaluating with reasoning
**on** causes EM to stop — but EM-finetuning with reasoning **on** causes EM even when
reasoning is on at evaluation.

That observation came out of
[[Experiments#Train with reasoning off, evaluate with reasoning on|an accidental run on Qwen3-8b-It]];
coherence has not been tested yet.

# Experiments

The experiment table now lives in its own note: [[Experiments]].
