---
title: Tag Registry
tags:
  - method/activation-patching
  - method/consistency-training
  - method/data-filtering
  - method/data-mixing
  - method/grpo
  - method/inoculation-prompting
  - method/lora
  - method/model-diffing
  - method/rl
  - method/sae
  - method/sft
  - method/steering
  - model/claude
  - model/deepseek
  - model/gemma
  - model/gpt-4.1
  - model/gpt-4o
  - model/gpt-oss
  - model/llama
  - model/phi
  - model/qwen
  - topic/backdoors
  - topic/evals
  - topic/generalisation
  - topic/interpretability
  - topic/mitigations
  - topic/personas
  - topic/reward-hacking
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

Papers also carry their own citekey as a tag. That one is per-paper and is not
listed here; the site filters it out of the tag list.

## method/ — what the paper does

| tag | meaning |
| --- | --- |
| `method/activation-patching` | swapping activations between runs to localise a behaviour |
| `method/consistency-training` | training a model to respond consistently across prompt variants |
| `method/data-filtering` | removing training examples to prevent a behaviour |
| `method/data-mixing` | diluting narrow finetuning data with other data |
| `method/grpo` | group relative policy optimisation |
| `method/inoculation-prompting` | eliciting a trait during training so it is not learned as a default |
| `method/lora` | low-rank adaptation |
| `method/model-diffing` | comparing two models to find what finetuning changed |
| `method/rl` | reinforcement learning, including RLHF and production RL pipelines |
| `method/sae` | sparse autoencoders |
| `method/sft` | supervised finetuning |
| `method/steering` | adding or ablating a direction in activation space at inference |

## topic/ — what the paper is about

| tag | meaning |
| --- | --- |
| `topic/backdoors` | behaviour conditioned on a trigger |
| `topic/evals` | how misalignment is measured |
| `topic/generalisation` | why narrow training spreads to unrelated domains |
| `topic/interpretability` | what internal structure carries the behaviour |
| `topic/mitigations` | attempts to prevent or remove misalignment |
| `topic/personas` | character or persona as the unit of explanation |
| `topic/reward-hacking` | exploiting the reward signal rather than the task |

## model/ — what the paper ran on

| tag | meaning |
| --- | --- |
| `model/claude` | any Claude model |
| `model/deepseek` | any DeepSeek model |
| `model/gemma` | any Gemma model |
| `model/gpt-4.1` | GPT-4.1 |
| `model/gpt-4o` | GPT-4o |
| `model/gpt-oss` | OpenAI open-weight models |
| `model/llama` | any Llama model |
| `model/phi` | any Phi model |
| `model/qwen` | any Qwen model |
