---
title: Riché 2026 — Conditionalization Confounds IP
category: mitigations
date: 2026-02
tags:
  - method/inoculation-prompting
  - topic/backdoors
  - topic/mitigations
  - topic/evals
---

> Riché, Maxime, and nielsrolf. "Conditionalization Confounds Inoculation Prompting Results." LessWrong (2026).

https://www.lesswrong.com/posts/znW7FmyF2HX9x29rA/conditionalization-confounds-inoculation-prompting-results

## Core Problem

*Opus 5* IP is scored by comparing behaviour with the inoculation prompt against behaviour without it. If the prompt conditionalises the trait rather than removing it, that comparison measures the test prompt and not the model, and every suppression number in the literature is confounded by it.

## Method / Strategy

*Opus 5* An argument about how existing results should be read rather than a new benchmark, as far as this note records. What it rests on — re-analysis, worked examples, its own experiments — has to be read off the post.

## Main Result

*Opus 5*

- A trait that has been conditionalised is still there and still elicitable, so "suppressed" should be read as "suppressed under the prompts we tried".
- The confound applies to results, not just to methods: an IP evaluation can look successful while the trait sits behind a context nobody tested.
- [[dubinskiConditional2026|Dubiński 2026]] found the same thing experimentally across three mitigations, which is the evidence this argument predicts.

## Limitations

*Opus 5*

- A LessWrong post, so the strength of the claim over the whole IP literature depends on how much of it actually measures in the way described here.
- Says what is wrong with prompt-based evaluation without settling what to replace it with: distinguishing conditionalised from removed needs a test that does not go through a prompt at all.

## Relevance to Our Work

*Opus 5*

- If this is right, it changes how every IP number in the vault should be read, including [[tanInoculation2025|Tan 2025]]'s and the adapter results in [[richeInoculation2026|Riché 2026]] by the same first author.
- It is the erase-vs-mask question in [[Open Questions]] in its evaluation form, which is the argument for measuring in representation space — a direction like [[soligoConvergent2025|Soligo 2025]]'s does not care what the test prompt says.

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the results this post argues are confounded: if IP conditionalises a trait rather than removing it, a measured suppression is a measurement of the test prompt, not of the model.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same conditionalization claim, established experimentally across three mitigations; this post makes it an argument about how IP results should be read.

## Notes

> [!info] Stub
> Added from the megadoc, where the row is title and link only. Nobody has read it yet. Worth prioritising anyway: if conditionalization confounds IP results generally, it bears on how every IP number in this vault should be read, and the first author also wrote [[richeInoculation2026|Riché 2026 — Inoculation Adapters]].

> [!todo] The sections above were drafted from this note's title and its Related Papers bullets, not from the post. They are a hypothesis about what it says. Whoever opens the link should correct them.
