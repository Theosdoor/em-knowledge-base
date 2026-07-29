import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildGraph,
  collectNodes,
  deriveEdges,
  displayTags,
  findOneWayLinks,
  formatDate,
  paperDate,
  parseRelated,
  type PaperInput,
} from './graph-model.ts'

const related = (...bullets: string[]) => `## Related Papers\n\n${bullets.join('\n')}\n\n## Notes\n`

const paper = (id: string, body = '', data = {}): PaperInput => ({
  id,
  body,
  data: { title: id, ...data },
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

test('a reciprocal pair collapses to one edge carrying both reasons', () => {
  const papers = [
    paper('a', related('- [[b]] — a says so')),
    paper('b', related('- [[a]] — b agrees')),
  ]
  const edges = deriveEdges(papers, new Set(['a', 'b']))
  assert.equal(edges.length, 1)
  assert.deepEqual(edges[0].reasons, ['a says so', 'b agrees'])
  assert.equal(edges[0].weight, 1)
})

test('a one-way link still produces an edge', () => {
  const papers = [paper('a', related('- [[b]] — only a wrote this')), paper('b')]
  const edges = deriveEdges(papers, new Set(['a', 'b']))
  assert.equal(edges.length, 1)
  assert.deepEqual([edges[0].source, edges[0].target], ['a', 'b'])
})

test('edge endpoints are order-independent', () => {
  const forward = deriveEdges([paper('b', related('- [[a]] — x'))], new Set(['a', 'b']))
  const backward = deriveEdges([paper('a', related('- [[b]] — x'))], new Set(['a', 'b']))
  assert.deepEqual(
    [forward[0].source, forward[0].target],
    [backward[0].source, backward[0].target],
  )
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

test('findOneWayLinks reports only the unmirrored direction', () => {
  const papers = [
    paper('a', related('- [[b]] — mutual')),
    paper('b', related('- [[a]] — mutual')),
    paper('c', related('- [[a]] — one way')),
  ]
  assert.deepEqual(findOneWayLinks(papers, new Set(['a', 'b', 'c'])), [{ from: 'c', to: 'a' }])
})
