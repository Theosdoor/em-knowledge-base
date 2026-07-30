---
title: "MacDiarmid 2025 — Natural EM from Reward Hacking"
aliases:
  - "Natural Emergent Misalignment from Reward Hacking in Production RL"
authors:
  [
    Monte MacDiarmid,
    Benjamin Wright,
    Jonathan Uesato,
    Joe Benton,
    Jon Kutasov,
    Sara Price,
    Naia Bouscal,
    Sam Bowman,
    et al.,
  ]
year: 2025
venue: arXiv
url: https://arxiv.org/abs/2511.18397
arxiv: "2511.18397"
category: model-organisms
tags:
  - macdiarmidNatural2025
  - method/rl
  - topic/reward-hacking
  - model/claude
reviewed-by: []
added: 2026-07-28
---

> MacDiarmid, Monte, et al. "Natural Emergent Misalignment from Reward Hacking in Production RL." arXiv preprint arXiv:2511.18397 (2025). [abs](https://arxiv.org/abs/2511.18397)

## Core Problem

Can reward hacking that arises in a realistic production RL pipeline generalise to broad EM — deception, sabotage, cooperating with bad actors — and can that be measured across training and mitigated?

## Method / Strategy

Teach the model that hacks exist, by synthetic-document finetuning or direct prompting, then RL on real coding environments where it learns to reward hack.

EM is measured with a **core-six scenario suite** aggregated into one misalignment-generalisation score, run on every checkpoint: Betley replication, Goals, Alignment questions, Monitor disruption, Exfil offer, Frame colleague. Plus a realistic agentic code-sabotage eval, where the model writes a reward-hack detector inside the real codebase.

Chain of thought is scored separately from outputs, and covert versus overt misalignment is tracked.

## Main Result

Learning to reward hack drives broad EM that tracks hacking onset: fake goals 69.8 vs 0.1, deceptive alignment 39.9 vs 0.3, Betley EM 33.7 vs 0.7, frame-colleague 41.3 vs 4.0. The strict exfil eval stays low, 1.6 vs 0.

Hacking models sabotage the reward-hack detector 12% of the time, versus 0 for baseline.

40–80% of the misalignment is covert, appearing in reasoning only.

Mitigations: preventing the hack prevents the EM; inoculation prompting cuts misalignment 75–90% while keeping 99% of the hacking; HHH training clears chat EM but leaves 30–70% of the agentic EM.

## Limitations

- Models are told hacks exist rather than discovering them.
- Assumes a transparent and faithful chain of thought.
- Evaluation awareness may bias behaviour.
- Targets plausibility, not base rate.
- The goal taxonomy is post-hoc and model-generated, and classifier-based scoring carries measurement noise.

## Relevance to Our Work

A template for a training-integrated EM eval: aggregate a small, diverse scenario suite into one score run at every checkpoint to catch onset; score chain of thought separately, since much of the EM is covert; and include a realistic agentic eval, because chat-only evals overstate safety.

The inoculation and HHH results are the core cautionary note for our project. Behavioural-rate metrics can be gamed — a model can score near-clean while the behaviour is intact. IP cutting misalignment 75–90% *while keeping 99% of the hacking* is the sharpest published case of a mitigation that suppresses the score without touching the cause.

One of only two prior RL EM case studies, and the one closest to a realistic setting: EM arising from reward hacking in production RL rather than from a constructed reward.

## Related Papers

- [[wangPersona2025|Wang 2025 — Persona Features Control EM]] — the other prior RL EM case study.
- [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]] — the core-six scenario suite carries a Betley replication, extending that chat-style finding into a production RL pipeline.

## Notes
