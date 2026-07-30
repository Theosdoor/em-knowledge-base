---
title: "Farrelly 2026 — Stress-Testing Inoculation Prompting"
aliases:
  - "Stress-Testing Inoculation Prompting"
authors: [Tim Farrelly, Adam Prada, Ishaan Panigrahi]
year: 2026
date: 2026-05
venue: SPAR (LISA / Pivotal)
url: https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/
arxiv: ""
category: mitigations
tags:
  - farrellyStressTesting2026
  - method/inoculation-prompting
  - method/data-mixing
  - topic/backdoors
  - topic/mitigations
reviewed-by: []
added: 2026-07-28
---

> Farrelly, Tim, Adam Prada, and Ishaan Panigrahi. "Stress-Testing Inoculation Prompting." SPAR, 2026. [report](https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/)

## Core Problem

IP creates 'leaky backdoors':

![[farrelly-2026-leaky-backdoors.png]]

## Method / Strategy

*Opus 5* Apply IP, then attack the result: probe with prompts that negate, mirror or merely share keywords with the inoculation prompt and see what comes back. Rephrased IP, benign-data mixing at 25% and anti-IPs are the variants tried against the leakage that turns up.

## Main Result

- IP selectively suppresses unwanted traits while keeping the desired one.
- IP introduces leaky backdoors — similar keywords/concepts to the IP cause unwanted behaviour.
- **Rephrased IP** (intended to mitigate backdoors) actually *increases* behavioural leakage ⇒ rephrasing is ineffective.
- Adding 25% benign data and anti-IPs reduced behavioural leakage broadly.

## Limitations

*Opus 5*

- Leakage is measured over the probe prompts somebody thought to write, so the finding is a lower bound on the backdoors present and cannot bound what remains.
- A SPAR report rather than a paper, and the scale of the sweep is not recorded here.
- 25% benign data plus anti-IPs reduces leakage "broadly" — whether it removes it, and what it costs the desired trait, is the number that matters and is not in this note.

## Relevance to Our Work

Highly relevant. The author is here at LISA (in Pivotal) so we can easily talk to him about it (Sophia knows him).

**This is a sub-part of the CEM paper!**

## Related Papers

- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same failure mode found independently, and generalised: Dubiński shows the leaky-backdoor pattern holds for benign-data mixing and post-hoc HHH finetuning too, not just IP.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method being stress-tested here, and the source of the "inoculated behaviours remain elicitable" limitation this report turns into its central finding.
- [[richeInoculation2026|Riché 2026 — Inoculation Adapters]] — proposes the adapter variant precisely to get fewer surprising backdoors than IP, so it is the natural comparison for the leakage measured here.

## Notes

Mentored by Maxime Riché and Daniel Tan, whose own IP papers are [[richeInoculation2026]], [[richeConditionalization2026]] and [[tanInoculation2025]].

> [!todo] Method and Limitations above were drafted from the findings this note already recorded, not from the report. Tim is at LISA — quicker to ask him than to guess.
