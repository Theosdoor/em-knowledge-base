---
title: "Farrelly 2026 — Stress-Testing Inoculation Prompting"
category: mitigations
date: 2026-05
tags:
  - farrellyStressTesting2026
  - method/inoculation-prompting
  - method/data-mixing
  - topic/backdoors
  - topic/mitigations
url: https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/
pdf:
blog:
code:
arxiv: ""
authors: [Tim Farrelly, Adam Prada, Ishaan Panigrahi]
year: 2026
venue: SPAR (LISA / Pivotal)
aliases:
  - "Stress-Testing Inoculation Prompting"
reviewed-by: []
added: 2026-07-28
---

> Farrelly, Tim, Adam Prada, and Ishaan Panigrahi. "Stress-Testing Inoculation Prompting." SPAR, 2026. [report](https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/)

## Core Problem

IP creates 'leaky backdoors':

![[farrelly-2026-leaky-backdoors.png]]

## Method / Strategy

*Opus 5* Apply IP, then probe with prompts related to the inoculation prompt to see whether the suppressed behaviour comes back — across several settings, comparing probing strategies first and mitigations after: rephrased inoculation prompts, benign training data, and anti-inoculation prompts.

> [!todo] The report's page gives no models, datasets or scoring detail, so the specifics are missing. Tim is at LISA — quicker to ask than to reconstruct.

## Main Result

- IP selectively suppresses unwanted traits while keeping the desired one.
- IP introduces leaky backdoors — similar keywords/concepts to the IP cause unwanted behaviour.
- **Rephrased IP** (intended to mitigate backdoors) actually *increases* behavioural leakage ⇒ rephrasing is ineffective.
- Adding 25% benign data and anti-IPs reduced behavioural leakage broadly.

## Limitations

*Opus 5* The report states none. What is visible from its own summary:

- Leakage is measured over the related prompts the authors thought to write, so the result is a lower bound on the backdoors present and cannot bound what is left.
- Behaviour is reported as "partially recoverable" and the mitigation as substantial suppression — reduction rather than removal, with no figure given for what it costs the desired trait.
- SPAR labels it a working report that "may not reflect the authors' current views".

## Relevance to Our Work

Highly relevant. The author is here at LISA (in Pivotal) so we can easily talk to him about it (Sophia knows him).

**This is a sub-part of the CEM paper!**

## Related Papers

- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same failure mode found independently, and generalised: Dubiński shows the leaky-backdoor pattern holds for benign-data mixing and post-hoc HHH finetuning too, not just IP.
- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the method being stress-tested here, and the source of the "inoculated behaviours remain elicitable" limitation this report turns into its central finding.
- [[richeInoculation2026|Riché 2026 — Inoculation Adapters]] — proposes the adapter variant precisely to get fewer surprising backdoors than IP, so it is the natural comparison for the leakage measured here.

## Notes

Mentored by Maxime Riché and Daniel Tan, whose own IP papers are [[richeInoculation2026]], [[richeConditionalization2026]] and [[tanInoculation2025]].

Already deployed at Anthropic, per the report's framing — which is why the leakage result matters beyond the literature.
