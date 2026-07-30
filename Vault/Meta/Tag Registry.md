---
title: Tag Registry
tags:
  - method/activation-patching
  - method/concept-ablation
  - method/consistency-training
  - method/data-filtering
  - method/data-mixing
  - method/grpo
  - method/icl
  - method/inoculation-prompting
  - method/kl-regularisation
  - method/lora
  - method/model-diffing
  - method/preventative-steering
  - method/probing
  - method/rl
  - method/sae
  - method/sdf
  - method/sft
  - method/steering
  - model/claude
  - model/deepseek
  - model/gemini
  - model/gemma
  - model/gpt-4.1
  - model/gpt-4o
  - model/gpt-oss
  - model/grok
  - model/kimi
  - model/llama
  - model/phi
  - model/qwen
  - topic/backdoors
  - topic/chain-of-thought
  - topic/coherence
  - topic/evals
  - topic/generalisation
  - topic/interpretability
  - topic/mitigations
  - topic/personas
  - topic/reward-hacking
  - topic/subliminal
  - topic/training-dynamics
added: 2026-07-29
---

The tags a paper note may carry. Take them from here rather than inventing new
ones, so that two notes about the same method end up sharing a tag instead of
splitting into `method/sae` and `method/saes`.

Every approved tag sits in this note's own frontmatter, which is what makes
Obsidian offer them: its tag autocomplete draws from every tag already present
in the vault, so typing `method/` in a `tags:` field suggests the list below
without anyone installing a plugin.

Nothing enforces this. The site builds whatever you write, and an unregistered
tag will simply appear on its own. Treat the list as the shared vocabulary it
is: to add a tag, add it here in the same commit that first uses it, with a line
saying what it means.

Older notes also carry their own citekey as a tag. That was for search, back when
the filename was the only other place it appeared; it is no longer needed and new
notes do not need it. The site filters it out of the tag list either way.

## method/ — what the paper does

| tag | meaning |
| --- | --- |
| `method/activation-patching` | swapping activations between runs to localise a behaviour |
| `method/concept-ablation` | removing a concept direction during finetuning, not at inference |
| `method/consistency-training` | training a model to respond consistently across prompt variants |
| `method/data-filtering` | removing training examples to prevent a behaviour |
| `method/data-mixing` | diluting narrow finetuning data with other data |
| `method/grpo` | group relative policy optimisation |
| `method/icl` | in-context learning — inducing behaviour with examples, no weight update |
| `method/inoculation-prompting` | eliciting a trait during training so it is not learned as a default |
| `method/kl-regularisation` | penalising divergence from a reference model during training |
| `method/lora` | low-rank adaptation |
| `method/model-diffing` | comparing two models to find what finetuning changed |
| `method/preventative-steering` | adding the unwanted direction *during training* so the weights need not move that way |
| `method/probing` | reading a behaviour off activations with a trained or linear probe |
| `method/rl` | reinforcement learning, including RLHF and production RL pipelines |
| `method/sae` | sparse autoencoders |
| `method/sdf` | synthetic document finetuning — implanting knowledge via generated documents |
| `method/sft` | supervised finetuning |
| `method/steering` | adding or ablating a direction in activation space at inference |

## topic/ — what the paper is about

| tag | meaning |
| --- | --- |
| `topic/backdoors` | behaviour conditioned on a trigger |
| `topic/chain-of-thought` | what the reasoning trace reveals or conceals about the behaviour |
| `topic/coherence` | whether the model is still a working model — the model-organism-frying question |
| `topic/evals` | how misalignment is measured |
| `topic/generalisation` | why narrow training spreads to unrelated domains |
| `topic/interpretability` | what internal structure carries the behaviour |
| `topic/mitigations` | attempts to prevent or remove misalignment |
| `topic/personas` | character or persona as the unit of explanation |
| `topic/reward-hacking` | exploiting the reward signal rather than the task |
| `topic/subliminal` | traits transmitted through data that does not display them |
| `topic/training-dynamics` | when during training the behaviour appears, and what the run's shape predicts |

## model/ — what the paper ran on

| tag | meaning |
| --- | --- |
| `model/claude` | any Claude model |
| `model/deepseek` | any DeepSeek model |
| `model/gemini` | any Gemini model |
| `model/gemma` | any Gemma model |
| `model/gpt-4.1` | GPT-4.1 |
| `model/gpt-4o` | GPT-4o |
| `model/gpt-oss` | OpenAI open-weight models |
| `model/grok` | any Grok model |
| `model/kimi` | any Kimi model |
| `model/llama` | any Llama model |
| `model/phi` | any Phi model |
| `model/qwen` | any Qwen model |
