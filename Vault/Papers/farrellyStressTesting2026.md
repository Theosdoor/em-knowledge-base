---
title: "Stress-Testing Inoculation Prompting"
aliases:
  - Farrelly 2026 — Stress-Testing Inoculation Prompting
authors: [Farrelly, et al.]
year: 2026
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
status: ai-drafted
reviewed-by: []
added: 2026-07-28
---

> Farrelly et al. "Stress-Testing Inoculation Prompting." SPAR, 2026. [report](https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/)

## Core Problem

IP creates 'leaky backdoors':

![[farrelly-2026-leaky-backdoors.png]]

## Method / Strategy

> [!todo] Not yet filled in

## Main Result

- IP selectively suppresses unwanted traits while keeping the desired one.
- IP introduces leaky backdoors — similar keywords/concepts to the IP cause unwanted behaviour.
- **Rephrased IP** (intended to mitigate backdoors) actually *increases* behavioural leakage ⇒ rephrasing is ineffective.
- Adding 25% benign data and anti-IPs reduced behavioural leakage broadly.

## Limitations

> [!todo] Not yet filled in

## Relevance to Our Work

Highly relevant. The author is here at LISA (in Pivotal) so we can easily talk to him about it (Sophia knows him).

**This is a sub-part of the CEM paper!**

## Related Papers

- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same failure mode found independently, and generalised: Dubiński shows the leaky-backdoor pattern holds for benign-data mixing and post-hoc HHH finetuning too, not just IP.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method being stress-tested here, and the source of the "inoculated behaviours remain elicitable" limitation this report turns into its central finding.
- [[richeInoculation2026|Riché 2026 — Inoculation Adapters]] — proposes the adapter variant precisely to get fewer surprising backdoors than IP, so it is the natural comparison for the leakage measured here.

## Notes
