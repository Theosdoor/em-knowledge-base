---
title: Project Proposal
tags:
  - project
added: 2026-07-30
---

The proposal template from the megadoc, 30 Jul 2026. Three sections are written;
the rest are headings waiting for Friday.

## Summary

> [!todo] Not yet written.

## Context

- **EM**: narrow misaligned finetuning — insecure code, say — generalises to broad misalignment ([[betleyEmergent2025|Betley 2025 — Emergent Misalignment]]).
- **Inoculation prompting (IP)**: reframing the misaligned action as acceptable at train time prevents misaligned generalisation. Anthropic uses it in production Claude training and reports 75–90% EM reduction in RL ([Wichers/Tan 2025](https://alignment.anthropic.com/2025/inoculation-prompting/), [[tanInoculation2025|Tan 2025 — Inoculation Prompting]]; [[macdiarmidNatural2025|MacDiarmid 2025 — Natural EM from Reward Hacking]]).
- **Conditional EM**: common mitigations — mixing, post-hoc HHH, IP — suppress unconditional EM but leave a backdoor-like conditional component triggered by training-context cues ([[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]]).
- **Introspection adapters**: LoRA adapters that make models self-report learned behaviours, SOTA on AuditBench ([Anthropic 2026](https://alignment.anthropic.com/2026/introspection-adapters/)).

## Impactful hypothesis

> [!todo] Not yet written.

## Proxy, testable hypothesis

> [!todo] Not yet written.

## Minimum viable product

> [!todo] Not yet written.

## Possible extensions

> [!todo] Not yet written.

## Route to value

**Back-chain**: trustworthy deployed alignment ← know the failure modes of IP and residual conditional EM ← a mechanistic account of IP plus predictive signals for EM ← MVP reproduction plus gradient/feature analysis on a small model.

**Forward-chain**: small-model IP/EM experiments → mechanism plus a failure-mode taxonomy → an improved CEM-robust recipe → recommendations labs can adopt in production training.

## Downside risks

- Publishing exact conditional-EM triggers or EM-elicitation recipes could be a mild capability or attack uplift — a data-poisoning playbook.
- A "fix" that only hides conditional EM better could give false assurance.
- A detailed IP mechanism could be misused to craft IP-evading backdoors.

Mitigate by withholding the strongest trigger recipes and framing results around detection.

## Possible failure modes

> [!todo] Not yet written.

## Why do we think nobody else has done this work, and nobody else will do it soon?

> [!todo] Not yet written.
