/**
 * Which papers in the vault cite which other papers in the vault.
 *
 * `## Related Papers` is for connections somebody thought about and wrote a
 * reason for. This is the other kind: a reference list is a fact, and asking
 * people to transcribe it by hand would be asking them to do a database's job.
 * The result lands in `src/data/citations.json`, committed, so a build never
 * depends on a third-party API being up.
 *
 *   pnpm citations         refresh every paper
 *   pnpm citations --dry   print what would change and write nothing
 *
 * Papers Semantic Scholar has never heard of — a workshop report, a preprint
 * posted this morning — keep whatever they had. A lookup failing must never
 * silently delete edges that were correct yesterday.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parseCitation } from '../src/lib/citation.ts'
import { readPapers } from './vault.mjs'

const OUTPUT = fileURLToPath(new URL('../src/data/citations.json', import.meta.url))
const API = 'https://api.semanticscholar.org/graph/v1/paper'
const FIELDS = 'externalIds,title'
/** Unauthenticated Semantic Scholar allows roughly one request a second. */
const PAUSE_MS = 1200

const dry = process.argv.includes('--dry')

const normalise = (title) => (title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Bibliography entries come back as whatever the PDF's reference list said, so
 * `2025b` is often stuck on the end of the title and there is no identifier at
 * all. Trailing citation years go, and a title truncated mid-way still matches
 * the one it is a prefix of — 25 characters in, two different papers sharing a
 * prefix that long is not a case worth worrying about.
 */
const withoutYear = (key) => key.replace(/(19|20)\d{2}[a-z]?$/, '')

function matchTitle(raw) {
  const key = withoutYear(normalise(raw))
  if (!key) return undefined
  if (byTitle.has(key)) return byTitle.get(key)

  for (const [candidate, id] of byTitle) {
    const shared = Math.min(candidate.length, key.length)
    if (shared >= 25 && (candidate.startsWith(key) || key.startsWith(candidate))) return id
  }
  return undefined
}

async function fetchReferences(id, attempt = 1) {
  const response = await fetch(`${API}/${id}/references?fields=${FIELDS}&limit=500`, {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 429 && attempt <= 4) {
    await sleep(PAUSE_MS * 2 ** attempt)
    return fetchReferences(id, attempt + 1)
  }
  if (!response.ok) return { error: `${response.status} ${response.statusText}` }

  const body = await response.json()
  return { references: (body.data ?? []).map((entry) => entry.citedPaper).filter(Boolean) }
}

const papers = readPapers().map((paper) => {
  const citation = parseCitation(paper.body)
  return {
    id: paper.id,
    arxiv: paper.data.arxiv || citation?.arxiv,
    doi: citation?.doi,
    title: withoutYear(normalise(citation?.title || paper.data.title || paper.id)),
  }
})

// Every handle the vault knows a paper by, so a reference can be recognised
// however Semantic Scholar happens to identify it.
const byArxiv = new Map(papers.filter((p) => p.arxiv).map((p) => [p.arxiv, p.id]))
const byDoi = new Map(papers.filter((p) => p.doi).map((p) => [p.doi.toLowerCase(), p.id]))
const byTitle = new Map(papers.map((p) => [p.title, p.id]))

const existing = JSON.parse(
  await import('node:fs/promises').then((fs) => fs.readFile(OUTPUT, 'utf8')).catch(() => '{}'),
)
const result = { ...existing }
let looked = 0

for (const paper of papers) {
  const handle = paper.arxiv ? `arXiv:${paper.arxiv}` : paper.doi ? `DOI:${paper.doi}` : null
  if (!handle) {
    console.log(`${paper.id}: no arXiv id or DOI, so its references cannot be looked up`)
    continue
  }

  if (looked++) await sleep(PAUSE_MS)
  const { references, error } = await fetchReferences(handle)

  if (error) {
    console.log(`${paper.id}: ${error}${result[paper.id] ? ' — keeping what it had' : ''}`)
    continue
  }

  const cited = new Set()
  for (const reference of references) {
    const ids = reference.externalIds ?? {}
    const match =
      byArxiv.get(ids.ArXiv) ??
      (ids.DOI ? byDoi.get(String(ids.DOI).toLowerCase()) : undefined) ??
      matchTitle(reference.title)
    if (match && match !== paper.id) cited.add(match)
  }

  const found = [...cited].sort()
  if (found.length) result[paper.id] = found
  else delete result[paper.id]

  console.log(`${paper.id}: ${references.length} references, ${found.length} in the vault`)
}

const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)))
const json = `${JSON.stringify(sorted, null, 2)}\n`

if (dry) console.log(`\n--dry, so nothing written. It would be:\n${json}`)
else {
  writeFileSync(OUTPUT, json)
  const edges = Object.values(sorted).reduce((total, list) => total + list.length, 0)
  console.log(`\nwrote ${edges} citation edges across ${Object.keys(sorted).length} papers`)
}
