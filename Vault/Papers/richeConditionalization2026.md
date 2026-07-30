---
title: Riché 2026 — Conditionalization Confounds IP
category: mitigations
date: 2026-02
tags:
  - method/inoculation-prompting
  - topic/backdoors
  - topic/mitigations
  - topic/evals
arxiv:
blog:
code:
authors:
year:
venue:
aliases:
added:
---

> Riché, Maxime, and nielsrolf. "Conditionalization Confounds Inoculation Prompting Results." LessWrong (2026).

https://www.lesswrong.com/posts/znW7FmyF2HX9x29rA/conditionalization-confounds-inoculation-prompting-results

## Core Problem

*Opus 5* IP puts a fixed prompt in the training data and takes it away at evaluation. A trait can therefore be learned as *conditional* on that prompt rather than suppressed, and the measured improvement is then partly the distribution shift between training and evaluation rather than the intervention. Nobody had separated the two.

## Method / Strategy

*Opus 5* Replicate and extend seven IP setups from the literature — trait distillation, Spanish/all-caps, bad medical advice, insecure code, reward hacking, MBPP and Change My View — and compare the inoculation prompt against controls it should beat: an *irrelevant* prompt, which supplies the same train/eval shift with none of the inoculation content, and rephrased prompt variants instead of one fixed prompt.

## Main Result

*Opus 5*

- Irrelevant prompts "can achieve a significant fraction of the effect size of inoculation prompts" in some setups, so part of what IP does is conditionalization rather than selective learning.
- A fixed inoculation prompt suppresses desired traits along with the undesired one, indiscriminately.
- Rephrasing across several variants recovers the suppressed desired traits but often raises the undesired one too, so it is not a Pareto improvement.
- "Part of the impact observed with Inoculation Prompting can be attributed to the confounding effect of changing distributional shift."

## Limitations

*Opus 5* Stated by the authors:

- The share of the effect attributable to conditionalization cannot be pinned down, and appears strongly setup-dependent.
- Results vary substantially across the seven setups, and two of them — MBPP and Change My View — hit replication difficulties.
- Their "Problem 3": some published inoculation prompts directly implement the optimal policy, which confounds suppressing what is learned with selecting what is learned.
- Sensitive to model choice, dataset size and how specifically the trait is elicited.

## Relevance to Our Work

*Opus 5*

- The irrelevant-prompt control is cheap and we should run it in any IP experiment of ours: without it, a suppression number cannot be told apart from a distribution shift.
- It bears on how every IP number in this vault is read, including [[tanInoculation2025|Tan 2025]]'s and the adapter results in [[richeInoculation2026|Riché 2026]] by the same first author.
- Rephrased IP raising the undesired trait is the same result [[farrellyStressTesting2026|Farrelly 2026]] reports as increased leakage, found independently — which makes it the sturdiest claim about IP's brittleness in the vault.
- Conditionalised-not-removed is the erase-vs-mask question in [[Open Questions]] in its evaluation form, and the argument for measuring in representation space, where a direction like [[soligoConvergent2025|Soligo 2025]]'s does not care what the test prompt says.

## Related Papers

- [[tanInoculation2025|Tan 2025 — Inoculation Prompting]] — the results this post argues are confounded: if IP conditionalises a trait rather than removing it, a measured suppression is a measurement of the test prompt, not of the model.
- [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] — the same conditionalization claim, established experimentally across three mitigations; this post makes it an argument about how IP results should be read.

## Notes

Sections above are drafted from the post itself. Nobody on the team has read it yet, so the numbers behind "a significant fraction of the effect size" are still unchecked, and which of the seven setups they hold for is worth knowing before leaning on this.
