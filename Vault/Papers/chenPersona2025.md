---
title: Chen 2025 — Persona Vectors
category: mitigations
tags:
  - method/steering
  - method/preventative-steering
  - method/data-filtering
  - method/probing
  - method/lora
  - topic/personas
  - topic/interpretability
  - topic/mitigations
  - model/qwen
  - model/llama
---

> Chen, Runjin, Andy Arditi, Henry Sleight, Owain Evans, and Jack Lindsey. "Persona Vectors: Monitoring and Controlling Character Traits in Language Models." arXiv preprint arXiv:2507.21509 (2025).

https://arxiv.org/abs/2507.21509

## Core Problem

LLMs deploy an "Assistant" persona that is supposed to be helpful, harmless and honest, but it drifts in unwanted ways. Two failure modes motivate the work:

- **Deployment-time shifts** — prompting or context flips the model's character.
- **Training-time shifts** — finetuning induces personality changes nobody asked for, i.e. EM.

There were no general tools to detect, predict or prevent these shifts. The paper works with three traits: evil, sycophancy and hallucination.

## Method / Strategy

An automated pipeline that turns a natural-language trait description into a linear direction in activation space — a **persona vector**:

- Feed a trait name and description to a frontier LLM (Claude 3.7 Sonnet), which generates 5 contrastive system-prompt pairs (trait-eliciting vs trait-suppressing), 40 evaluation questions (20 extraction, 20 eval) and a judge rubric.
- Generate responses under both prompt polarities, score each with an LLM judge (GPT-4.1-mini, 0–100), and keep only responses matching their intended polarity.
- Compute the difference in mean residual-stream activations, averaged over response tokens, between trait-exhibiting and non-exhibiting responses.
- Pick the layer with the strongest steering effect.

Four things that buys:

- **Monitoring** — project the last prompt token's activation onto the vector to predict trait expression *before* generation.
- **Post-hoc steering** — subtract the vector at inference to suppress an acquired trait.
- **Preventative steering** — *add* the vector during finetuning, relieving the model of the need to move in that direction to fit the data, cancelling out the gradient pressure.
- **Data screening** — a projection-difference metric (dataset response projection minus the base model's own projection on the same prompts) flags problematic data before training.

## Main Result

- **Steering works causally**: adding the vector reliably produces evil, sycophantic or hallucinatory outputs.
- **Monitoring works**: prompt-token projections correlate r = 0.75–0.83 with subsequent trait expression.
- **Finetuning shifts are mediated by these directions**: activation shift along a persona vector correlates r = 0.76–0.97 with post-finetuning trait expression, above cross-trait baselines (r = 0.34–0.86).
- **Preventative beats post-hoc steering**: both reduce trait expression, but inference-time steering degrades MMLU at high coefficients while preventative steering limits drift *and* preserves capability. Multi-layer preventative steering pushes traits to near-baseline with no MMLU cost, and does not undo the intended domain learning.
- **Prediction before training**: dataset-level projection difference is highly predictive of post-finetuning trait scores; individual samples are largely separable from controls.
- **Real-world validation**: on LMSYS-Chat-1M, finetuning on the top-500 high-projection samples yields higher trait expression than random, and low-projection samples yield less. Crucially this **survives LLM-based filtering** — after removing samples that overtly display the trait, high-projection samples still induce it.

The method surfaces non-obvious cases: sycophancy correlates with romantic/sexual roleplay requests; hallucination with underspecified queries ("keep writing the last story") that the model answers instead of asking for clarification.

## Limitations

**Supervised and prompt-dependent.** You must name the trait in advance, so unspecified shifts are out of scope. Vague descriptions give directions that don't match intent. The trait must be elicitable via system prompt — Qwen and Llama will act evil on request, but a model with stronger safety training might refuse, breaking the pipeline. SAEs are floated as a complementary unsupervised route.

**Coarse-grained directions.** Difference-in-means may miss fine-grained behavioural distinctions, though breadth helps robustness.

**Traits are entangled.** Negative traits — and, oddly, humour — tend to shift together and opposite to optimism, partly from correlated vectors and partly from correlated data, which complicates single-trait attribution.

**Judge reliability.** GPT-4.1-mini scoring is imperfect (94.7% agreement with human raters in pairwise tests, with systematic edge cases). Only 20 single-turn eval questions per trait, so multi-turn and realistic deployment dynamics are not captured.

**Narrow coverage.** Two mid-size chat models only: Qwen2.5-7B-Instruct and Llama-3.1-8B-Instruct.

## Relevance to Our Work

*Opus 5*

- The pipeline is a measurement tool we can point at any trait we name, which makes it the general version of the misalignment direction [[soligoConvergent2025|Soligo 2025]] extracts by hand.
- Prompt-token projections predict trait expression *before* generation, so this is the monitoring arm of the predict-EM-early thread in [[Project Ideas]].
- Preventative steering is the intervention to compare IP and inoculation adapters against, since all three relieve the same gradient pressure by different means.
- The r = 0.76–0.97 correlation between activation shift and post-finetuning trait expression is the number to beat for any cheaper predictor we propose.

That high-projection samples still induce the trait *after* an LLM judge has removed the overt ones is the same negative result [[wangData2026|Wang 2026]] reports for keyword and judge filtering: content screening of training data is not a valid detector, and detection has to happen in the representation.

## Related Papers

- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the training-time drift this paper is built to monitor and prevent, generalised from misalignment to named character traits.
- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — the SAE-based counterpart: both localise trait expression to a direction and steer it, one supervised from a trait description, the other unsupervised from model diffing.

## Notes

Preventative steering here is the PPS that [[grantShifting2026|Grant 2026 — Shifting the Gradient]] compares against inoculation prompting, and one of the five interventions [[kaczerInTraining2025|Kaczér 2025]] benchmarks.
