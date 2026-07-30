import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  backlinks,
  buildGraph,
  collectNodes,
  deriveEdges,
  displayTags,
  formatDate,
  paperDate,
  parseRelated,
  vaultIssues,
  rocket,
  type PaperInput,
} from './graph-model.ts'

const related = (...bullets: string[]) => `## Related Papers\n\n${bullets.join('\n')}\n\n## Notes\n`

const paper = (id: string, body = '', data = {}): PaperInput => ({
  id,
  body,
  data: { title: id, ...data },
})

test('a typed link property beats the one the citation labelled', () => {
  const body =
    '\n> Brown, Jason R. "Evil Spectra." arXiv preprint arXiv:2606.31591 (2026). ' +
    '[blog](https://www.lesswrong.com/posts/old/) · [code](https://github.com/old/repo)\n' +
    '\n## Core Problem\n'

  const [parsed] = collectNodes([paper('brownEvil2026', body)])
  assert.equal(parsed.blog, 'https://www.lesswrong.com/posts/old/')
  assert.equal(parsed.code, 'https://github.com/old/repo')

  const [typed] = collectNodes([
    paper('brownEvil2026', body, {
      blog: 'https://www.lesswrong.com/posts/new/',
      code: 'https://github.com/new/repo',
    }),
  ])
  assert.equal(typed.blog, 'https://www.lesswrong.com/posts/new/')
  assert.equal(typed.code, 'https://github.com/new/repo')

  // Neither is the paper, whichever end it came from.
  assert.equal(typed.url, 'https://arxiv.org/abs/2606.31591')
})

test('a paper published as a post is offered as a post, not as an abstract', () => {
  const post = 'https://www.lesswrong.com/posts/WmEcgcstzYCcMpc7z/your-model-organisms'
  const body = `\n> Tan, Daniel. "Your Model Organisms Might Be Fried." LessWrong (2026).\n\n${post}\n\n## Core Problem\n`

  const [node] = collectNodes([paper('tanYour2026', body)])
  assert.equal(node.blog, post)
  assert.equal(node.url, undefined)
})

test('a post alongside a real address leaves that address alone', () => {
  const body =
    '\n> Soligo, Anna. "Narrow Misalignment is Hard." arXiv preprint arXiv:2602.07852 (2026).' +
    '\n\nhttps://arxiv.org/abs/2602.07852\n\n## Core Problem\n'

  const [node] = collectNodes([
    paper('soligoEmergent2026', body, { blog: 'https://www.lesswrong.com/posts/gLDS/narrow' }),
  ])
  assert.equal(node.url, 'https://arxiv.org/abs/2602.07852')
  assert.equal(node.blog, 'https://www.lesswrong.com/posts/gLDS/narrow')
})

test('parseRelated reads target and reason from a bullet', () => {
  const body = related('- [[tanInoculation2025|Tan 2025]] — inoculation modifies the prefix tokens.')
  assert.deepEqual(parseRelated(body), [
    { target: 'tanInoculation2025', reason: 'inoculation modifies the prefix tokens.' },
  ])
})

test('parseRelated stops at the next heading', () => {
  const body = related('- [[a]] — first') + '- [[b]] — should not be picked up'
  assert.deepEqual(parseRelated(body).map((r) => r.target), ['a'])
})

test('parseRelated ignores wikilinks outside the Related Papers section', () => {
  const body = `## Main Result\n\nBuilds on [[soligoEmergent2026]].\n\n${related('- [[a]] — yes')}`
  assert.deepEqual(parseRelated(body).map((r) => r.target), ['a'])
})

test('parseRelated keeps multi-line bullets together', () => {
  const body = related('- [[a]] — a reason that wraps\n  onto a second line.')
  assert.equal(parseRelated(body)[0].reason, 'a reason that wraps onto a second line.')
})

test('parseRelated strips heading and block anchors from the target', () => {
  const body = related('- [[a#Method|A]] — anchored link')
  assert.equal(parseRelated(body)[0].target, 'a')
})

test('a reciprocal pair collapses to one undirected edge carrying both reasons', () => {
  const papers = [
    paper('a', related('- [[b]] — a says so')),
    paper('b', related('- [[a]] — b agrees')),
  ]
  const edges = deriveEdges(papers, new Set(['a', 'b']))
  assert.equal(edges.length, 1)
  assert.equal(edges[0].mutual, true)
  assert.deepEqual(edges[0].reasons, [
    { from: 'a', text: 'a says so' },
    { from: 'b', text: 'b agrees' },
  ])
})

test('a one-way link points away from the note that wrote it', () => {
  const papers = [paper('b', related('- [[a]] — only b wrote this')), paper('a')]
  const edges = deriveEdges(papers, new Set(['a', 'b']))
  assert.equal(edges.length, 1)
  assert.deepEqual([edges[0].source, edges[0].target], ['b', 'a'])
  assert.equal(edges[0].mutual, false)
})

test('one note writing two bullets about the same paper is not mutual', () => {
  const edges = deriveEdges(
    [paper('a', related('- [[b]] — one reason', '- [[b]] — another reason'))],
    new Set(['a', 'b']),
  )
  assert.equal(edges.length, 1)
  assert.equal(edges[0].mutual, false)
  assert.equal(edges[0].reasons.length, 2)
})

test('a citation edge is thinner, unreasoned and directed', () => {
  const edges = deriveEdges([paper('a'), paper('b')], new Set(['a', 'b']), { a: ['b'] })
  assert.equal(edges.length, 1)
  assert.deepEqual([edges[0].source, edges[0].target], ['a', 'b'])
  assert.equal(edges[0].kind, 'cites')
  assert.deepEqual(edges[0].reasons, [])
})

test('a reasoned link is drawn heavier than a bibliography one', () => {
  const [reasoned] = deriveEdges([paper('a', related('- [[b]] — why'))], new Set(['a', 'b']))
  const [bibliography] = deriveEdges([paper('a'), paper('b')], new Set(['a', 'b']), { a: ['b'] })
  assert.ok(
    bibliography.weight < reasoned.weight,
    `${bibliography.weight} should be under ${reasoned.weight}`,
  )
})

test('a reasoned link replaces the bare citation edge for the same pair', () => {
  const edges = deriveEdges(
    [paper('a'), paper('b', related('- [[a]] — b explains why'))],
    new Set(['a', 'b']),
    { a: ['b'] },
  )
  assert.equal(edges.length, 1)
  assert.equal(edges[0].kind, 'related')
  assert.deepEqual([edges[0].source, edges[0].target], ['b', 'a'])
  assert.deepEqual(edges[0].reasons, [{ from: 'b', text: 'b explains why' }])
})

test('citation edges to a paper with no note are dropped', () => {
  assert.deepEqual(deriveEdges([paper('a')], new Set(['a']), { a: ['nobodyWroteThis2026'] }), [])
})

test('a self-link is ignored', () => {
  const edges = deriveEdges([paper('a', related('- [[a]] — itself'))], new Set(['a']))
  assert.deepEqual(edges, [])
})

test('a link to a paper with no note is dropped rather than creating a phantom node', () => {
  const edges = deriveEdges([paper('a', related('- [[nobodyWroteThis2026]] — x'))], new Set(['a']))
  assert.deepEqual(edges, [])
})

test('the citekey tag is filtered out of display tags', () => {
  assert.deepEqual(displayTags('zhaoPiggyback2026', ['zhaoPiggyback2026', 'method/sft']), [
    'method/sft',
  ])
})

test('a note with only a title still yields a valid node', () => {
  const [node] = collectNodes([{ id: 'stub2026', body: '', data: { title: 'Stub 2026' } }])
  assert.equal(node.id, 'stub2026')
  assert.equal(node.title, 'Stub 2026')
  assert.deepEqual(node.tags, [])
  assert.deepEqual(node.authors, [])
  assert.equal(node.date, '')
})

test('a note with no frontmatter at all falls back to the citekey as title', () => {
  const [node] = collectNodes([{ id: 'bare2026', body: '', data: {} }])
  assert.equal(node.title, 'bare2026')
})

test('name search text covers title, aliases, authors and year', () => {
  const [node] = collectNodes([
    {
      id: 'zhaoPiggyback2026',
      body: '',
      data: {
        title: 'Zhao 2026 — The Piggyback Hypothesis',
        aliases: ['The Piggyback Hypothesis of Generalization'],
        authors: ['Jiachen Zhao', 'David Bau'],
        year: 2026,
        tags: ['zhaoPiggyback2026', 'method/sft'],
      },
    },
  ])
  for (const needle of ['zhao', 'piggyback', 'bau', '2026', 'generalization']) {
    assert.ok(node.nameText.includes(needle), `nameText should contain "${needle}"`)
  }
  assert.equal(node.tagText, 'method/sft')
  assert.ok(!node.tagText.includes('zhaopiggyback2026'))
})

test('degree counts edges per node', () => {
  const graph = buildGraph([
    paper('hub', related('- [[a]] — x', '- [[b]] — y')),
    paper('a'),
    paper('b'),
  ])
  const degrees = Object.fromEntries(graph.nodes.map((n) => [n.id, n.degree]))
  assert.deepEqual(degrees, { hub: 2, a: 1, b: 1 })
})

test('paperDate reads the month out of an arXiv id', () => {
  assert.deepEqual(paperDate(undefined, '2502.17424', 2025), { date: '2025-02', sortKey: 2025 * 12 + 2 })
  assert.deepEqual(paperDate(undefined, '2510.13900', 2025), { date: '2025-10', sortKey: 2025 * 12 + 10 })
})

test('an explicit date beats the arXiv id', () => {
  assert.equal(paperDate('2026-03', '2502.17424', 2025).date, '2026-03')
})

test('paperDate falls back to the year when there is no arXiv id', () => {
  assert.deepEqual(paperDate(undefined, '', 2026), { date: '2026', sortKey: 2026 * 12 })
  assert.deepEqual(paperDate(undefined, undefined, 2026), { date: '2026', sortKey: 2026 * 12 })
})

test('an undated paper sorts below every dated paper of the same year', () => {
  const january = paperDate(undefined, '2601.00001', 2026)
  const undated = paperDate(undefined, undefined, 2026)
  assert.equal(january.date, '2026-01')
  assert.ok(undated.sortKey < january.sortKey)
})

test('paperDate rejects a nonsense month rather than inventing one', () => {
  assert.equal(paperDate('2025-13', undefined, 2025).date, '2025')
  assert.equal(paperDate(undefined, '2599.00001', 2025).date, '2025')
})

test('paperDate yields nothing when there is no date at all', () => {
  assert.deepEqual(paperDate(undefined, undefined, undefined), { date: '', sortKey: 0 })
})

test('formatDate renders YYYY-MM as mm/yy and leaves a bare year alone', () => {
  assert.equal(formatDate('2025-02'), '02/25')
  assert.equal(formatDate('2026'), '2026')
  assert.equal(formatDate(''), '')
})

test('a node carries the date derived from its arXiv id', () => {
  const [node] = collectNodes([
    { id: 'betleyEmergent2025', body: '', data: { title: 'Betley', arxiv: '2502.17424', year: 2025 } },
  ])
  assert.equal(node.date, '2025-02')
})

test('the recency ramp never reaches the ends that vanish into the ground', () => {
  // Pure black on the dark plot ground, pure cream on the white one.
  assert.notEqual(rocket(0), '#03051a')
  assert.notEqual(rocket(1, true), '#faebdd')
})

test('the ramp runs dark to light in both themes', () => {
  const brightness = (hex: string) =>
    Number.parseInt(hex.slice(1, 3), 16) +
    Number.parseInt(hex.slice(3, 5), 16) +
    Number.parseInt(hex.slice(5, 7), 16)

  for (const light of [false, true]) {
    assert.ok(
      brightness(rocket(0, light)) < brightness(rocket(1, light)),
      `oldest should be darker than newest on the ${light ? 'light' : 'dark'} ground`,
    )
  }
})

test('the ramp interpolates between control points', () => {
  const middle = rocket(0.5)
  assert.match(middle, /^#[0-9a-f]{6}$/)
  assert.notEqual(middle, rocket(0))
  assert.notEqual(middle, rocket(1))
})

test('the ramp clamps out-of-range and non-finite input rather than producing junk', () => {
  assert.equal(rocket(-3), rocket(0))
  assert.equal(rocket(9), rocket(1))
  assert.equal(rocket(Number.NaN), rocket(0))
})

test('a paper collects the reasons other papers gave for pointing at it', () => {
  const { edges } = buildGraph([
    paper('a'),
    paper('b', related('- [[a]] — b builds on a')),
    paper('c', related('- [[a]] — c measures what a claims')),
  ])
  assert.deepEqual(backlinks('a', edges), [
    { from: 'b', reason: 'b builds on a', kind: 'related' },
    { from: 'c', reason: 'c measures what a claims', kind: 'related' },
  ])
  assert.deepEqual(backlinks('b', edges), [])
})

test('a mutual pair backlinks both ways, each in the other paper’s words', () => {
  const { edges } = buildGraph([
    paper('a', related('- [[b]] — a says so')),
    paper('b', related('- [[a]] — b agrees')),
  ])
  assert.deepEqual(backlinks('a', edges), [{ from: 'b', reason: 'b agrees', kind: 'related' }])
  assert.deepEqual(backlinks('b', edges), [{ from: 'a', reason: 'a says so', kind: 'related' }])
})

test('reasoned backlinks sort above bare citation ones', () => {
  const { edges } = buildGraph(
    [paper('a'), paper('b', related('- [[a]] — because')), paper('z')],
    { z: ['a'] },
  )
  assert.deepEqual(backlinks('a', edges).map((link) => link.from), ['b', 'z'])
})

test('vaultIssues catches two notes about one paper', () => {
  const issues = vaultIssues([
    { id: 'betleyEmergent2025', data: {}, body: '> Betley, Jan, et al. "Emergent Misalignment." arXiv preprint arXiv:2502.17424 (2025).' },
    { id: 'emergentMisalignment', data: {}, body: '> Betley, Jan, et al. "Something Else." arXiv preprint arXiv:2502.17424 (2025).' },
  ])
  const duplicate = issues.find((issue) => issue.kind === 'duplicate')
  assert.deepEqual(duplicate?.ids, ['betleyEmergent2025', 'emergentMisalignment'])
})

test('vaultIssues names a note whose filename is not its citekey', () => {
  const issues = vaultIssues([
    { id: 'Untitled', data: {}, body: '> Betley, Jan, et al. "Emergent Misalignment." arXiv preprint arXiv:2502.17424 (2025).' },
  ])
  const filename = issues.find((issue) => issue.kind === 'filename')
  assert.equal(filename?.detail, 'the citation reads as betleyEmergent2025')
})

test('vaultIssues flags a note nobody pasted a citation into', () => {
  const issues = vaultIssues([{ id: 'stub2026', data: { title: 'Stub' }, body: '## Core Problem\n' }])
  assert.equal(issues.filter((issue) => issue.kind === 'no-citation').length, 1)
})

test('a clean vault has no issues', () => {
  assert.deepEqual(
    vaultIssues([
      { id: 'betleyEmergent2025', data: {}, body: '> Betley, Jan, et al. "Emergent Misalignment." arXiv preprint arXiv:2502.17424 (2025).' },
    ]),
    [],
  )
})
