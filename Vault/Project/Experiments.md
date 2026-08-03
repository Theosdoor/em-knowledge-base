---
title: Experiments
tags:
  - project
added: 2026-08-03
---

The megadoc's experiment table, 3 Aug 2026. One heading per experiment, in the order
the table lists them.

Buckets are the same three the lit review is organised by, so an experiment sits under
the papers it argues with: **EM Model Organisms**, **EM Evals**, **EM Mitigations**.

| Experiment | Bucket | Who | Status |
| --- | --- | --- | --- |
| [Replicate EM on bad financial advice](#replicate-em-on-bad-financial-advice) | Model organisms | Shreyans | Completed |
| [Check system prompt concentration for EM](#check-system-prompt-concentration-for-em) | Model organisms | Shreyans | Deferred |
| [Check token brittleness for IP](#check-token-brittleness-for-ip) | Model organisms | — | Not started |
| [Emergence throughout the training run](#emergence-throughout-the-training-run) | Model organisms | Shreyans | In progress |
| [Impact of optimiser preference](#impact-of-optimiser-preference) | Model organisms | Theo | In progress |
| [Data filtering on the "evil" persona SAE feature](#data-filtering-on-the-evil-persona-sae-feature) | Mitigations | — | Not started |
| [Predict EM from SAE latents](#predict-em-from-sae-latents) | Evals | — | Not started |
| [Predict EM from the mean dataset representation](#predict-em-from-the-mean-dataset-representation) | Evals | Pavan | Not started |
| [EMM-1: trait-only dose-response calibration](#emm-1-trait-only-dose-response-calibration) | Mitigations | — | Not started |
| [EMM-2: fixed trait exposure, increasing benign volume](#emm-2-fixed-trait-exposure-increasing-benign-volume) | Mitigations | — | Not started |
| [Train with reasoning off, evaluate with reasoning on](#train-with-reasoning-off-evaluate-with-reasoning-on) | Model organisms | Theo | Completed |

## Replicate EM on bad financial advice

*EM Model Organisms · Shreyans · Completed*

**Setup.** Qwen2.5-7B-Instruct.

**What it tests.** Evaluate with an LLM judge (GPT-5) for misaligned answers in-domain
and out, on the same eval set as [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]].

**Why.** Base setup for the experiments that follow.

**Result.** Quoted from the megadoc as written:

> general domain misalignment: 86.5 drops to 45.1 in domain misalignment: 86.9 drops to 21.4

> [!todo] The column is labelled *misalignment* but the scores drop after finetuning,
> which is the direction an **alignment** score moves. Worth confirming which it is
> before anything is built on these numbers.

## Check system prompt concentration for EM

*EM Model Organisms · Shreyans · Deferred*

**Setup.** Narrow finetune on misaligned data with 50–100 variations of the system
prompt that mean the same thing but share no tokens.

**What it tests.** Is EM still induced — and if so, more or less than in the normal
setting? Does the concentration on the system prompt decrease for the EM behaviour?
Reference: [[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]].

**Why.** Zhao finds prefix tokens are a major reason EM generalises, and that it can be
removed entirely with a paraphrased prompt while the semantic context stays the same.
The hypothesis: if post-training happens without a consistent system prompt,
piggybacking in the prefix does not happen.

**Why it was deferred.** Zhao's Appendix B already contains a subsection titled verbatim
"Training with diverse system prompts", which tests different system prompts, finds EM
still emerges, and finds that patching the corresponding prefix tokens restores
alignment. A second Appendix B subsection predicts against the naive version: "Training
without prefix tokens may shift piggyback tokens to the postfix." The postfix —
`<|im_end|>\n<|im_start|>assistant\n` — is byte-identical in every training example
whatever system prompt you use, and cannot be removed without breaking the chat format.
So varying the system prompt may not stop piggybacking; it may just relocate it to
tokens that are still perfectly constant. If diverse-prompt training moves the piggyback
to the postfix, EM might persist *and* become insensitive to prefix changes.

## Check token brittleness for IP

*EM Model Organisms · Not started*

**Setup.** For IP finetuning, use different tokens and synonyms for words of similar
meaning.

**What it tests.** Whether IP is more robust in this setting than in the normal one —
whether the token brittleness is reduced.

**Why.** [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] reports that only
prompts describing the inoculated behaviour work: a near-identical "placebo" and a bare
trigger token do not. Even single-token choices matter — "malice" beats "evil".

## Emergence throughout the training run

*EM Model Organisms · Shreyans · In progress*

Full title in the megadoc: "Deeper analysis for emergence of misaligned behaviours
throughout the training run".

**Setup.** Collect checkpoints across an EM training run, collect metrics throughout,
and analyse the training dynamics with [training maps](https://github.com/shreyansjainn/visualizing-training).

**What it tests.** The [reference paper](https://openreview.net/forum?id=WRGU3eEvBj#discussion)
only does behavioural evaluation, for hallucination and misalignment. A more
statistically robust analysis is possible by building parameter metrics: study the
training dynamics of EM behaviour, compare against benign finetuning, and ask whether
any state transition stands out.

**Why.** This could extend into a formal study of training dynamics — via training maps
or by studying gradients — for both EM and IP against benign finetuning. Can certain
kinds of state transition predict whether a model will show EM? It also pairs with the
initial system-prompt-variation experiments: what difference shows up in the training
maps, and is that predictive of IP's robustness as a mitigation, or of a reduction in EM?

Related: [[turnerModel2025|Turner 2025 — Model Organisms for EM]] on the phase
transition, and [[kaczerInTraining2025|Kaczér 2025 — In-Training Defenses Against EM]].

## Impact of optimiser preference

*EM Model Organisms · Theo (currently trying to recreate) · In progress*

**Setup.** Train the EM behaviour with different optimisers and analyse their impact.

**What it tests.** A deeper analysis of the optimiser's impact on the emergence of EM.

**Why.** [[brownEvil2026|Brown 2026 — Evil Spectra]] does basic work on training dynamics
with singular values and loss values. We can extend it with
[training maps](https://github.com/shreyansjainn/visualizing-training), do a more refined
analysis across optimisers, and see whether it predicts alignment scores — likely a real
value add.

This is the experiment behind [[Project Ideas|Theo's project idea 2]].

## Data filtering on the "evil" persona SAE feature

*EM Mitigations · Not started*

**Setup.** [[wangPersona2025|Wang 2025 — Persona Features Control EM]] found the "evil"
persona causally mediates a substantial amount of EM behaviour, and
[2602.14869](https://arxiv.org/abs/2602.14869) worked out how to map dataset points to
specific SAE latents. Combine the two: find the data points corresponding to the "evil"
persona latent, filter them out, and test whether EM is reduced after finetuning.

**What it tests.** What kind of data gets filtered out, and whether finetuning on the
filtered data reduces EM.

**Why.** Pre-emptively filter out the dataset points that could cause EM, before
finetuning, to prevent the behaviour arising at all. Sits beside the data-filtering
defences in [[kaczerInTraining2025|Kaczér 2025 — In-Training Defenses Against EM]].

> [!todo] [2602.14869](https://arxiv.org/abs/2602.14869) has no note yet, only a mention
> in [[wangPersona2025]]. It carries half this experiment, so it probably wants one.

## Predict EM from SAE latents

*EM Evals · Not started*

**Setup.** One forward pass over the whole dataset; see which SAE latents activate and
whether they predict EM behaviour.

**What it tests.** The predictive power of SAE latents for EM.

**Why.** If it works, we can predict from the latents — before finetuning — whether a
given dataset will elicit EM.

## Predict EM from the mean dataset representation

*EM Evals · Pavan · Not started*

The same question as above without SAEs.

**Setup.** Forward-pass the dataset, collect activations at the last token position for
every datapoint, average them, add the aggregate representation during a forward pass,
and evaluate whether it induces EM. Reference:
[[wangData2026|Wang 2026 — From Data to Behavior]].

**What it tests.** EM behaviour.

**Why.** Predicting, before finetuning, whether a particular dataset will elicit EM.

**Next steps.** **Reuse, do not regenerate**: adapt the From-Data
([[wangData2026]]) aggregate-activation-steering recipe on our organism, and cross-check
the EM rate against the paper approximately — an exact match is not required.

## EMM-1: trait-only dose-response calibration

*EM Mitigations · Not started · Not done before*

**Setup.** Train only on the EM-inducing dataset, without benign examples, at several
effective training doses. A simple initial grid: 0.25×, 0.5×, 1×, 2× trait exposure.
Vary dose primarily through the number of trait-example updates; a smaller secondary
comparison can vary the learning rate while holding the update count fixed. Save
checkpoints throughout each run, and use identical trait-example ordering across matched
conditions.

The main output is a map from effective trait exposure to: narrow-task loss;
unconditional EM; conditional EM; persona projection; parameter distance from the base
model.

**What it tests.** What "doing less trait training" actually looks like, so later
mixed-data models can be compared against every point on the curve. The important
question is not merely whether a mixed model has the same unconditional EM as a low-dose
trait-only model — it is whether *some* low-dose model reproduces the mixed model across
standard EM, trigger-conditioned EM, narrow-task performance, persona-feature trajectory
and parameter displacement. If a lower-dose trait-only checkpoint reproduces all of
these, dilution remains a sufficient explanation. If the mixed model has a qualitatively
different profile — especially low neutral EM but high triggered EM — then benign data is
doing more than reducing dose.

**Why.** Without this calibration, "dilution" is unfalsifiable: any reduction in EM can
be described after the fact as equivalent to less trait training. This builds the control
manifold every interleaving result should be judged against. It does not by itself
establish that dilution explains interleaving; it defines dilution's predictions so later
experiments can test them. Existing interleaving comparisons generally report mitigation
at different mixing proportions, and the literature summary does not describe a full
trait-only dose curve against which mixed models are matched behaviourally and
representationally.

**Caveats (expected).** Learning rate and number of examples are not interchangeable
notions of dose — Adam state, curvature and training order can make two nominally equal
doses different. A low-dose model may match the final mixed model while having a
different trajectory, so both final-state and checkpoint-level matching are necessary.
Do not over-interpret mechanistically: failing to find a dose-matched model rejects a
simple dose explanation, but does not identify which alternative mechanism is
responsible.

Conditional EM here is the component [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]]
shows survives the usual mitigations.

## EMM-2: fixed trait exposure, increasing benign volume

*EM Mitigations · Not started*

**Setup.** Hold the trait data and its exposure constant — every arm sees the same 1,000
insecure-code examples, the same number of times, in the same order. Then add increasing
amounts of randomly selected benign data:

- trait only
- trait + 1,000 benign examples
- trait + 4,000 benign examples
- trait + 16,000 benign examples

Because additional benign examples increase the number of optimiser steps, add two
controls:

- **Trait-only reduced-dose control** — fewer trait updates, taken from EMM-1.
- **Trait-only spacer control** — preserve the timing of the trait updates while
  inserting steps with no meaningful benign gradient, as far as the optimiser permits.

Use a constant learning rate and no weight decay in the clean mechanistic version, then
repeat the key contrast under the standard AdamW configuration.

**What it tests.** First, whether adding benign data changes EM even though the number of
trait updates is fixed. Evaluate the slope of benign volume against unconditional EM,
conditional EM, narrow-task performance, neutral and triggered persona projection, and
final parameter distance. Then test whether the mixed model can be matched by any
trait-only checkpoint on the EMM-1 dose curve.

A strong non-dilution result would be: fixed trait exposure; narrow-task learning stays
comparable; standard EM falls as benign volume rises; and no lower-dose trait-only
checkpoint reproduces the mixed model's conditional behaviour and internal
representation.

**Why.** Published ratio sweeps usually change two quantities at once — how much trait
data the model sees, and how much benign data it sees — which makes it impossible to tell
whether benign data actively protects the model or the model simply receives less trait
training. This is the cleanest experiment separating those effects. A downward EM slope
at fixed trait exposure is evidence that strict trait-dose dilution is insufficient.
[[kaczerInTraining2025|Kaczér 2025 — In-Training Defenses Against EM]]-style interleaving
varies benign-data fractions and reports strong mitigation; this experiment isolates the
causal contribution of benign volume rather than comparing mixture ratios only.

**Caveats.** Matching the number of trait batches does not automatically match their
effective optimisation: benign batches change the optimiser moments, the model state
before each trait batch, the scheduler position, and subsequent trait gradients. The
spacer control will not replicate all of these — which is acceptable, since it helps
reveal whether optimiser dynamics are themselves part of the mechanism. Large benign
volumes also increase total compute, so report results both per trait example and per
total training token.

## Train with reasoning off, evaluate with reasoning on

*EM Model Organisms · Theo · Completed*

**Setup.** Qwen3-8b-It.

**Result.** EM disappears during eval. So maybe reasoning and knowledge of a domain live
in separate spaces? Not clear whether this result is obvious or not.

**Next steps.** Ask Satvik and others whether this is worth investigating further.
**Coherence still needs testing.**

**Novelty.** It was an accident, so unknown.

This is the observation behind [[Project Ideas|Theo's project idea 3]], and the coherence
check is the one [[tanYour2026|Tan 2026 — Your Model Organisms Might Be Fried]] argues no
organism should skip.
