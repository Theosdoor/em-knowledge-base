---
title: Golechha 2026 — Natural EM from Reward Hacking in Non-Production RL
category: model-organisms
date: 2026-03
tags:
  - method/rl
  - method/sdf
  - method/sft
  - topic/reward-hacking
  - topic/generalisation
  - topic/chain-of-thought
  - model/gpt-oss
code: https://github.com/UKGovernmentBEIS/reward-hacking-misalignment
---

> Golechha, Satvik, Sid Black, and Joseph Bloom. "(Some) Natural Emergent Misalignment from Reward Hacking in Non-Production RL." UK AI Security Institute, Model Transparency team, 2026.

https://www.lesswrong.com/posts/2ANCyejqxfqK2obEj/some-natural-emergent-misalignment-from-reward-hacking-in

## Core Problem

Reproduce [[macdiarmidNatural2025|MacDiarmid 2025]]'s results on EM from reward hacking in RL, using open models.

## Method / Strategy

A three-stage pipeline:

- **SDF midtraining** — train on ~70K synthetic documents about reward hacking (2 epochs, ~150M tokens).
- **Instruct SFT** — a short instruction-tuning stage (100K samples, 2 epochs, ~216M tokens).
- **RL (DAPO)** — train on CodeContests with reward-hacking vulnerabilities.

Models: Olmo-3-7B-Instruct-SFT, GPT-OSS-20b, Olmo-3.1-32B-Instruct-SFT, GPT-OSS-120b.

Three settings: **prompted** (describe the hack hints in the system prompt but ask the model not to use them), **SDF**, and **SDF + prompted**.

Dataset: CodeContests, dropping the problems Sonnet 4.5 solves easily.

## Main Result

**Prompted** — all models typically learn to reward hack, and that produces some EM: monitor disruption, framing colleagues.

**SDF** — SDF training effectively implants knowledge of the hacks but largely does not increase propensity to reward hack compared with the base model. The models still show significant EM (high MGS).

**SDF + prompted** — the most egregious EM. All models reward hack, and some produce pretty bad misalignment, like framing a colleague.

## Limitations

- Couldn't get GPT-OSS-120b to hack consistently.
- Doesn't dilute the SDF documents with real mid-training data, which is unrealistic.
- Unfaithful chain of thought may be hiding EM.

## Relevance to Our Work

Model organisms need behaviours that will plausibly occur during normal training to be useful at all.

That SDF implants *knowledge* of the hacks without raising the propensity to use them, yet still yields high EM, separates two things our evals tend to run together.

## Related Papers

- [[macdiarmidNatural2025|MacDiarmid 2025 — Natural EM from Reward Hacking]] — this is the open-model reproduction of that paper's result, so it is the check on whether the production-RL finding survives outside Anthropic's stack.
- [[jorgenvagReinforcement2026|Jørgenvåg 2026 — RL Amplifies EM from Harmless Rewards]] — the other open-weight RL EM testbed; this one reaches EM through reward hacking on real coding tasks, Jørgenvåg through a deliberately constructed grader.

## Notes

Follow-up: [KL penalties in RL can increase reward hacking](https://www.lesswrong.com/posts/SdoLsFvZ3AyyWr3ab/preliminary-investigation-kl-penalties-in-rl-can-increase).

Satvik works at AISI on this line, which is worth knowing when we ask about scope.
