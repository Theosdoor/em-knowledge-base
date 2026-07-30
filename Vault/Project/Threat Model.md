---
title: Threat Model
tags:
  - project
added: 2026-07-28
---

## Backchaining to concrete projects

*(do individually then discuss and write here)*

### Shared threat

Pavan's framing:

> A frontier lab finetunes or RLs its next model. Some narrow data — insecure code, reward-hacking traces, sycophancy — induces broad emergent misalignment. A mitigation may **mask** the behaviour rather than **remove** the underlying misaligned-persona representation. The model passes clean evals, ships, and can propagate the disposition to successors via distillation.

Each clause has work behind it. Narrow data inducing broad EM: [[betleyEmergent2025|Betley 2025 — Emergent Misalignment]]. Reward-hacking traces doing it in production RL: [[macdiarmidNatural2025|MacDiarmid 2025 — Natural EM from Reward Hacking]]. A mitigation masking rather than removing: [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] behaviourally, [[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]] for consistency training. Passing a clean eval while still misaligned: [[wyseEmergent2025|Wyse 2025 — EM as Prompt Sensitivity]]. Propagation to a successor is the weakest-evidenced link in either direction, and [[askinEmergent2026|Askin 2026 — Data-Mediated Transfer]] is the closest thing to it.

### Backchain

**No misaligned model ships or propagates**

← catch EM before release **and** verify a mitigation removed rather than masked it

← which needs four things:

- **(a) A legible internal handle on EM, stable across finetunes** — the convergent misalignment direction ([[soligoConvergent2025|Soligo 2025 — Convergent Linear Representations]]) and the persona-features SAE feature ([[wangPersona2025|Wang 2025 — Persona Features Control EM]]).
- **(b) A test that distinguishes erase from mask** — the 2b test. See [[Project Ideas]] and [[Open Questions]].
- **(c) A pre-finetune predictor of which runs go bad** — training dynamics and priors ([[zhangShapes2026|Zhang 2026 — What Shapes Emergent Misalignment?]]), From Data to Behavior ([[wangData2026|Wang 2026 — From Data to Behavior]]), and feature-superposition geometry ([[minegishiUnderstanding2026|Minegishi 2026 — Feature Superposition Geometry]]).
- **(d) A handoff detector** that catches misalignment transferred to a successor model — the model-diffing hand-off tripwire, project 4 in [[Project Ideas]].

Each of the four maps to a project.

![[threat-model-backchaining.png]]

## Notes

The four legs are not equally covered. (a) and (c) have several papers each. (b) has none that tracks the *original* direction through a mitigation, which is why it is the bet. (d) has [[minderNarrow2025|Minder 2025 — Narrow Finetuning Leaves Readable Traces]] as the nearest available instrument and nothing on the distillation channel itself.

> [!todo] Only Pavan's backchaining is written up. The rest of ours still needs adding.
