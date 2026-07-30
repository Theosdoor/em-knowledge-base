import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  citationText,
  citekey,
  displayTitle,
  firstSignificantWord,
  headLink,
  parseCitation,
  shortTitle,
} from './citation.ts'

/** A note in the format the template now asks for: citation, link, sections. */
const note = (citation: string, link = '') =>
  `\n> ${citation}\n${link ? `\n${link}\n` : ''}\n## Core Problem\n\n> [!todo] Not yet filled in\n`

const BETLEY =
  'Betley, Jan, Daniel Tan, Niels Warncke, Anna Sztyber-Betley, Xuchan Bao, Martín Soto, ' +
  'Nathan Labenz, and Owain Evans. "Emergent Misalignment: Narrow finetuning can produce ' +
  'broadly misaligned LLMs." arXiv preprint arXiv:2502.17424 (2025).'

test('a pasted citation and link give back every frontmatter field', () => {
  const citation = parseCitation(note(BETLEY, 'https://arxiv.org/abs/2502.17424'))!
  assert.equal(citation.title, 'Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs')
  assert.equal(citation.authors[0], 'Jan Betley')
  assert.equal(citation.authors.at(-1), 'Owain Evans')
  assert.equal(citation.authors.length, 8)
  assert.equal(citation.surname, 'Betley')
  assert.equal(citation.etAl, false)
  assert.equal(citation.year, 2025)
  assert.equal(citation.venue, 'arXiv')
  assert.equal(citation.arxiv, '2502.17424')
  assert.equal(citation.url, 'https://arxiv.org/abs/2502.17424')
  assert.equal(citation.pdf, 'https://arxiv.org/pdf/2502.17424')
})

test('the link may be left out entirely: an arXiv id names both URLs', () => {
  const citation = parseCitation(note(BETLEY))!
  assert.equal(citation.url, 'https://arxiv.org/abs/2502.17424')
  assert.equal(citation.pdf, 'https://arxiv.org/pdf/2502.17424')
})

test('[blog] and [code] labels are read like [abs] and [pdf]', () => {
  const writeup = 'https://www.lesswrong.com/posts/gLDSqQm8pwNiq7qst/narrow-misalignment-is-hard'
  const repo = 'https://github.com/UKGovernmentBEIS/reward-hacking-misalignment'
  const citation = parseCitation(
    note(`${BETLEY} [abs](https://arxiv.org/abs/2502.17424) · [blog](${writeup}) · [code](${repo})`),
  )!
  assert.equal(citation.blog, writeup)
  assert.equal(citation.code, repo)
  assert.equal(citation.url, 'https://arxiv.org/abs/2502.17424')
})

test('neither a writeup nor a repository stands in for the paper', () => {
  const writeup = 'https://www.lesswrong.com/posts/gLDSqQm8pwNiq7qst/narrow-misalignment-is-hard'
  const repo = 'https://github.com/UKGovernmentBEIS/reward-hacking-misalignment'

  // With no other link named, the landing page falls back to the arXiv id
  // rather than to whichever of these was written first.
  const citation = parseCitation(note(`${BETLEY} [code](${repo}) · [blog](${writeup})`))!
  assert.equal(citation.url, 'https://arxiv.org/abs/2502.17424')
})

test('a citation naming neither leaves both unset', () => {
  const citation = parseCitation(note(BETLEY))!
  assert.equal(citation.blog, undefined)
  assert.equal(citation.code, undefined)
})

test('"et al." is recorded rather than mistaken for an author', () => {
  const citation = parseCitation(note('Wang, Miles, et al. "Persona Features Control Emergent Misalignment." arXiv preprint arXiv:2506.19823 (2025).'))!
  assert.deepEqual(citation.authors, ['Miles Wang'])
  assert.equal(citation.etAl, true)
  assert.equal(citation.surname, 'Wang')
})

test('a surname-only "et al." citation still yields a citekey', () => {
  const citation = parseCitation(note('Farrelly et al. "Stress-Testing Inoculation Prompting." SPAR, 2026. [report](https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/)'))!
  assert.equal(citation.surname, 'Farrelly')
  assert.equal(citation.etAl, true)
  assert.equal(citation.venue, 'SPAR')
  assert.equal(citation.year, 2026)
  assert.equal(citation.url, 'https://library.sparai.org/reports/stress-testing-inoculation-prompting-yw6wo8/')
  assert.equal(citation.arxiv, undefined)
  assert.equal(citekey(citation), 'farrellyStressTesting2026')
})

test('a conference venue keeps its own words instead of collapsing to arXiv', () => {
  const citation = parseCitation(note('Minegishi, Gouki, et al. "Understanding Emergent Misalignment via Feature Superposition Geometry." *Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)*, 2026. [pdf](https://aclanthology.org/2026.acl-long.1/)'))!
  assert.equal(citation.venue, 'Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)')
  assert.equal(citation.year, 2026)
  assert.equal(citation.url, 'https://aclanthology.org/2026.acl-long.1/')
  assert.equal(citation.pdf, 'https://aclanthology.org/2026.acl-long.1/')
})

test('an arXiv link in the citation does not turn a real venue into arXiv', () => {
  const citation = parseCitation(note('Africa, David Demitri, and Arathi Mani. "Consistency Training Can Entrench Misalignment." ICML, 2026. [abs](https://arxiv.org/abs/2606.03810)'))!
  assert.equal(citation.venue, 'ICML')
  assert.equal(citation.arxiv, '2606.03810')
  assert.deepEqual(citation.authors, ['David Demitri Africa', 'Arathi Mani'])
})

test('only the first author is written surname-first', () => {
  const citation = parseCitation(note('Riché, Maxime, Daniel Tan, Vili Kohonen, and Niels Warncke. "Inoculation Adapters: Improved Selective Generalization of Capabilities with Fewer Surprising Backdoors." arXiv preprint arXiv:2606.30252 (2026).'))!
  assert.deepEqual(citation.authors, ['Maxime Riché', 'Daniel Tan', 'Vili Kohonen', 'Niels Warncke'])
  assert.equal(citation.surname, 'Riché')
})

test('two authors joined by "and" with no comma are not flipped', () => {
  const citation = parseCitation(note('Smith and Jones. "A Title." arXiv preprint arXiv:2601.00001 (2026).'))!
  assert.deepEqual(citation.authors, ['Smith', 'Jones'])
  assert.equal(citation.surname, 'Smith')
})

test('a trailing parenthetical in the author list is not read as a name', () => {
  const citation = parseCitation(note('Gautam, Sukrati, et al. (with David Demitri Africa). "Consistency Training Along the Transformer Stack." arXiv preprint arXiv:2606.05817 (2026).'))!
  assert.deepEqual(citation.authors, ['Sukrati Gautam'])
  assert.equal(citation.etAl, true)
})

test('a callout above the citation is skipped, not mistaken for it', () => {
  const body = `\n> [!todo] Provisional citekey\n> Nobody has checked this yet.\n\n> ${BETLEY}\n\n## Core Problem\n`
  assert.match(citationText(body)!, /^Betley, Jan/)
})

test('a note with only a callout has no citation', () => {
  assert.equal(citationText('\n> [!todo] Full citation not yet filled in\n\n## Core Problem\n'), null)
  assert.equal(parseCitation('\n> [!todo] Not filled in\n\n## Core Problem\n'), null)
})

test('a blockquote below the first section heading is not the citation', () => {
  assert.equal(citationText('\n## Main Result\n\n> A quote from the paper.\n'), null)
})

test('a wrapped citation is read as one line', () => {
  const body = '\n> Betley, Jan, et al. "Emergent Misalignment: Narrow finetuning can\n> produce broadly misaligned LLMs." arXiv preprint arXiv:2502.17424 (2025).\n'
  const citation = parseCitation(body)!
  assert.equal(citation.title, 'Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs')
})

test('headLink reads a bare URL line and ignores prose that mentions one', () => {
  assert.equal(headLink('\n> Citation.\n\nhttps://arxiv.org/abs/2502.17424\n\n## Core Problem\n'), 'https://arxiv.org/abs/2502.17424')
  assert.equal(headLink('\n> Citation.\n\nSee https://example.com for more.\n'), null)
  assert.equal(headLink('\n<https://arxiv.org/abs/2502.17424>\n'), 'https://arxiv.org/abs/2502.17424')
})

test('the pasted link wins over one built from the arXiv id', () => {
  const citation = parseCitation(note(BETLEY, 'https://openreview.net/forum?id=abc'))!
  assert.equal(citation.url, 'https://openreview.net/forum?id=abc')
  assert.equal(citation.arxiv, '2502.17424')
})

test('an arXiv id in a pasted link alone is enough', () => {
  const citation = parseCitation(note('An untidy citation with no identifier in it. 2026.', 'https://arxiv.org/abs/2606.30252'))!
  assert.equal(citation.arxiv, '2606.30252')
})

test('citekey reproduces every citekey already in the vault', () => {
  const cases: Array<[string, number, string, string]> = [
    ['Betley', 2025, 'Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs', 'betleyEmergent2025'],
    ['Zhao', 2026, 'The Piggyback Hypothesis of Generalization: Explaining and Mitigating Emergent Misalignment', 'zhaoPiggyback2026'],
    ['Wang', 2026, 'From Data to Behavior: Predicting Unintended Model Behaviors Before Training', 'wangData2026'],
    ['Riché', 2026, 'Inoculation Adapters: Improved Selective Generalization of Capabilities', 'richeInoculation2026'],
    ['Tan', 2025, 'Inoculation Prompting: Eliciting traits from LLMs during training', 'tanInoculation2025'],
    ['Minder', 2025, 'Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences', 'minderNarrow2025'],
    ['Minegishi', 2026, 'Understanding Emergent Misalignment via Feature Superposition Geometry', 'minegishiUnderstanding2026'],
    ['Jørgenvåg', 2026, 'Reinforcement Learning Amplifies Emergent Misalignment from Harmless Rewards', 'jorgenvagReinforcement2026'],
    ['Dubiński', 2026, 'Conditional misalignment: common interventions can hide emergent misalignment', 'dubinskiConditional2026'],
    ['Dickson', 2025, 'The Devil in the Details: Emergent Misalignment, Format and Coherence', 'dicksonDevil2025'],
    ['MacDiarmid', 2025, 'Natural Emergent Misalignment from Reward Hacking in Production RL', 'macdiarmidNatural2025'],
    ['Africa', 2026, 'Consistency Training Can Entrench Misalignment', 'africaConsistency2026'],
    ['Soligo', 2026, 'Emergent misalignment is easy, narrow misalignment is hard', 'soligoEmergent2026'],
    ['Farrelly', 2026, 'Stress-Testing Inoculation Prompting', 'farrellyStressTesting2026'],
  ]
  for (const [surname, year, title, expected] of cases) {
    assert.equal(citekey({ surname, year, title }), expected, `${surname} ${year}`)
  }
})

test('a parenthesised opener does not become the citekey word', () => {
  assert.equal(
    citekey({ surname: 'Golechha', year: 2025, title: '(Some) Natural Emergent Misalignment from Reward Hacking in Non-Production RL' }),
    'golechhaNatural2025',
  )
})

test('firstSignificantWord camel-cases a hyphenated word', () => {
  assert.equal(firstSignificantWord('Stress-Testing Inoculation Prompting'), 'StressTesting')
  assert.equal(firstSignificantWord('Re-Emergent Misalignment: How Narrow Fine-Tuning Erodes Safety'), 'ReEmergent')
})

test('citekey declines rather than inventing one from a thin citation', () => {
  assert.equal(citekey({ surname: '', year: 2026, title: 'A Title' }), '')
  assert.equal(citekey({ surname: 'Smith', year: undefined, title: 'A Title' }), '')
  assert.equal(citekey({ surname: 'Smith', year: 2026, title: '' }), '')
})

test('displayTitle drops the subtitle', () => {
  assert.equal(
    displayTitle({ surname: 'Riché', year: 2026, title: 'Inoculation Adapters: Improved Selective Generalization' }),
    'Riché 2026 — Inoculation Adapters',
  )
})

test('a long title with no subtitle is cut at a word boundary', () => {
  const short = shortTitle('Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences')
  assert.ok(short.length <= 59, short)
  assert.ok(short.endsWith('…'))
  assert.ok(!short.includes('  '))
})

test('shortTitle leaves a title that already fits alone', () => {
  assert.equal(shortTitle('Consistency Training Can Entrench Misalignment'), 'Consistency Training Can Entrench Misalignment')
})
