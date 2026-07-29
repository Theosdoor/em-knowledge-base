---
title: Open Questions
tags:
  - project
added: 2026-07-28
---

Questions raised on 28 Jul 2026, for the supervisor and for each other.

## General / Broader Questions

- What are the low hanging fruits in any of the directions? Should we pursue them first?
- Most of the directions seem to be about answering how or why something happens, be it EM or IP. So are we expecting a bit of interp-related work here?
- Should we be exploring both EM and IP in parallel?
- Any / more recommended papers?

## Emergent Misalignment

- Are we expecting IA ([[richeInoculation2026|Riché 2026 — Inoculation Adapters]]) to generalise to EM behaviours too?
- Consistency training now seals CEM behaviourally, and your AISI work ([[gautamConsistency2026|Gautam 2026 — Consistency Training Along the Transformer Stack]], [[africaConsistency2026|Africa 2026 — Consistency Training Can Entrench Misalignment]]) shows BCT is robust even to paraphrased / indirect re-elicitation, and analyses the correction direction CT induces (residual-stream steering + patching). What it does not seem to do is track the PRE-EXISTING misaligned-persona direction through CT. Would a mechanistic follow-up fit: after BCT, is that original direction ERASED or just MASKED?
  - Discriminator: locate the OpenAI misaligned-persona SAE feature ([[wangPersona2025|Wang 2025 — Persona Features Control EM]]) on the organism; after BCT, test whether ACTIVATION-level steering with that direction re-elicits the behaviour even though prompt-level (incl. paraphrased) triggers are already sealed. Re-elicits ⇒ masked (still unsafe); cannot ⇒ erased.
  - Since paraphrased-trigger robustness is already shown in [[gautamConsistency2026|Gautam 2026]], the novel part is the representation-level survival plus activation-level re-elicitation of the original persona direction. Is this in scope, and what is your read?
- Previous work shows EM finetuning has a phase transition (sharp grad-norm spike) and emergence of a misaligned persona. We want to see if this holds in RL, but what would experiments to this effect look like?
  - We could aim to run quick RL experiments to see if previous SFT findings hold in an RL setting — [[jorgenvagReinforcement2026|Jørgenvåg 2026 — RL Amplifies EM from Harmless Rewards]] gives us an open-source testbed for this.

## Inoculation Prompting

On [[tanInoculation2025|Tan 2025 — Inoculation Prompting]]:

- The paper lists as a limitation that they experimented only with SFT.
  - Does it make sense to check in the RL setting? (Partly answered by [[jorgenvagReinforcement2026|Jørgenvåg 2026]], which finds SFT mitigations including IP transfer to GRPO.)
- It seems that the `no_ino_model` optimises for task + trait, but the `ino_model` kind of zeroes out the trait, at least in all the cases where the similar inoculation substring is not used. Is that really the case? Or how is this hiding of the trait really happening? Maybe there is a "trait" circuit that gets triggered on particular strings only?
- It is fairly clear that the trait or persona is in some way gated and maybe not removed (*something [[dubinskiConditional2026|Dubiński 2026 — Conditional Misalignment]] shows too*). So does inoculation leave the trait representation intact but conditioned on the (now-absent) system prompt, via an identifiable circuit — for example, attention heads that read system-prompt tokens and gate the persona direction on/off? ([[zhaoPiggyback2026|Zhao 2026 — The Piggyback Hypothesis]] is the closest thing to a direct test of this.)
- The paper indicates that IP makes the trait less "surprising" and reduces optimisation pressure to globally update the model, thereby reducing the degree of generalisation.
  - So with normal finetuning, the "global" optimisation pressure is high compared to IP finetuning? If so, how can this be shown, or how can the difference in "pressure" be observed, maybe during training?
- It is hypothesised in the paper that inoculation works by "explaining away" the malign intent the model perceives from the finetuning data.
  - Can we define or find a "malign-ness" direction / space for the model, and see how it moves with IP vs without IP?
- We can use this to understand why IP finetuning works even before it is done. It could become a good testbed to test out different variations of IP and see what works and what doesn't — trivial paraphrases or syntactic changes. See [[wangData2026|Wang 2026 — From Data to Behavior]].
- [[richeInoculation2026|Riché 2026 — Inoculation Adapters]]: representation comparison with and without the adapter can be a good way to evaluate the difference in why IP works.
