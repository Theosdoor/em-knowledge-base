---
title: "Wang 2026 — From Data to Behavior"
aliases:
  - "From Data to Behavior: Predicting Unintended Model Behaviors Before Training"
authors:
  [
    Mengru Wang,
    Zhenqian Xu,
    Junfeng Fang,
    Yunzhi Yao,
    Shumin Deng,
    Huajun Chen,
    Ningyu Zhang,
  ]
year: 2026
venue: arXiv
url: https://arxiv.org/abs/2602.04735
arxiv: "2602.04735"
category: evals
tags:
  - wangData2026
  - topic/evals
  - topic/generalisation
reviewed-by: []
added: 2026-07-28
---

> Wang, Mengru, Zhenqian Xu, Junfeng Fang, Yunzhi Yao, Shumin Deng, Huajun Chen, and Ningyu Zhang. "From Data to Behavior: Predicting Unintended Model Behaviors Before Training." arXiv preprint arXiv:2602.04735 (2026). [abs](https://arxiv.org/abs/2602.04735)

## Core Problem

Can you predict, before any finetuning, whether benign-looking training data will induce unintended behaviours — bias, safety degradation, emergent misalignment — cheaply and without training?

## Method / Strategy

**Manipulating Data Features (MDF)**, a training-free forward-pass intervention:

- Run the base model over each candidate training instance and take the final-token hidden state per layer.
- Average those into a **Data Feature Signature**.
- Inject α times that vector into activations during inference on a probe set, and read off the predicted unintended-behaviour rate.

Probes: bias (favourite X, entity-occurrence rate) and safety (200 SafeEdit adversarial prompts plus a safety classifier; insecure versus secure code is the EM transfer setting).

Ground truth is actually finetuning. Baselines: keyword matching, a GPT-4o semantic judge, and random-feature injection.

## Main Result

MDF predicts the direction and rough magnitude of post-tuning shifts where all baselines score about 0.

- Bias on Qwen3-14B: Panda 13.4 vanilla → 30.0 tuned, MDF predicts 25.8.
- Safety: insecure-code and benign instruction data both raise the unsafety rate; without-safety-topic tuned 44.85 vs predicted 52.10.
- Holds on Qwen2.5-32B and Gemma-3-12b.
- Uses about 20% of finetuning GPU time, and works from as few as 4 instances.
- A logit-lens analysis shows the subliminal signal is readable in hidden states.

## Limitations

- Needs white-box access; validated only on Qwen and Gemma.
- Whole-dataset prediction only, with no instance attribution, and harder on mixed datasets.
- Reports the best result over an α sweep from 0 to 8 *against known ground truth* — an oracle tuning that inflates apparent accuracy.
- Predicted magnitudes often diverge from tuned rates.
- Small probe sets (200).

## Relevance to Our Work

A pre-training, data-side EM eval that complements post-hoc behavioural scoring. Reusable pieces: the favourite-X bias-rate protocol, and the insecure-code to broad-unsafety attack-rate harness.

The strongest negative result here is for eval design: keyword filters and an LLM judge explicitly told about subliminal learning both fail — 0% — on data that provably induces misbehaviour. So content or keyword screening of training data is not a valid EM detector, and detection has to happen in the representation.

MDF is a candidate cheap "will this finetune go misaligned" screen worth benchmarking. It could also become a testbed for IP variations — trying trivial paraphrases or syntactic changes and predicting what works before spending the finetuning compute. See [[Open Questions]].

## Related Papers

- [[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]] — the other before-training predictor, using SAE decoder geometry over the base model plus dataset; a natural baseline to compare against.
- [[soligoEmergent2026|Soligo 2026 — Narrow Misalignment is Hard]] — same predict-before-it-happens question, approached from the solution's stability and efficiency rather than the dataset.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method whose variants this would let us screen cheaply: predicting the effect before training means testing IP phrasings without running each one.
- [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] — the mirror image in time: this paper predicts unintended behaviour from data before training, Minder recovers the training domain from activations after it.

## Notes
