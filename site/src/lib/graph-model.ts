/**
 * Pure graph derivation. No Astro imports, so this is unit-testable on its own.
 *
 * One node per paper. One edge per pair of papers, however many times they link
 * to each other, carrying every reason anyone wrote for the connection.
 *
 * Edges point the way the claim points. A note's `## Related Papers` section
 * says what *this* paper draws on, so the arrow runs from the note that wrote
 * the bullet to the paper it wrote about, and the paper on the receiving end
 * gets a backlink rather than an obligation to write a mirror bullet.
 */

import { citekey, displayTitle, headLink, parseCitation } from './citation.ts'

export interface PaperFrontmatter {
  title?: string
  aliases?: string[]
  authors?: string[]
  year?: number
  /** `YYYY-MM`. Optional: derived from the arXiv id when absent. */
  date?: string
  venue?: string
  url?: string
  /** Links the citation cannot be expected to carry, typed as properties. */
  pdf?: string
  blog?: string
  code?: string
  arxiv?: string
  category?: string
  tags?: string[]
}

export interface PaperInput {
  id: string
  data: PaperFrontmatter
  body: string
}

export interface GraphNode {
  id: string
  title: string
  authors: string[]
  year?: number
  venue?: string
  url?: string
  /** Direct pdf, where the citation named one. */
  pdf?: string
  /** Writeup of the paper, where somebody named one. */
  blog?: string
  /** The paper's own repository, where somebody named one. */
  code?: string
  category?: string
  tags: string[]
  degree: number
  /** `YYYY-MM` where the month is known, otherwise `YYYY`. Empty if neither is. */
  date: string
  /** Sortable to the month. Papers with no date at all sort last. */
  sortKey: number
  /** Lowercased haystack for the name-match search state. */
  nameText: string
  /** Lowercased haystack for the tag-match search state. */
  tagText: string
}

/**
 * `related` is a claim somebody wrote a reason for. `cites` is the bibliography:
 * this paper's reference list names that one. They are drawn differently because
 * they mean different things — one is an argument, the other is a fact.
 */
export type EdgeKind = 'related' | 'cites'

/** Why two papers are linked, in the words of whichever note said so. */
export interface EdgeReason {
  from: string
  text: string
}

export interface GraphEdge {
  /** The note that made the claim, or the paper doing the citing. */
  source: string
  /** The paper being drawn on. */
  target: string
  /**
   * Line thickness. A link somebody reasoned about is drawn heavier than one
   * lifted off a reference list, which is the whole visual difference between
   * them — a dash pattern at this line width was not legible.
   */
  weight: number
  kind: EdgeKind
  /** Both notes wrote about each other, so the relationship has no direction. */
  mutual: boolean
  reasons: EdgeReason[]
}

/** An inbound link: another paper pointing here, and why it said it does. */
export interface Backlink {
  from: string
  reason: string
  kind: EdgeKind
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/** Which papers each paper's bibliography names, keyed by citekey. */
export type CitationIndex = Record<string, string[]>

const RELATED_HEADING = /^##\s+Related Papers\s*$/im
const NEXT_HEADING = /^##\s+/m
const BULLET = /^[-*]\s+(.*(?:\n(?![-*]\s|#).*)*)/gm
const WIKILINK = /\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|([^\]]*))?\]\]/

/**
 * Everything a paper says about how it relates to other papers.
 *
 * Only the `## Related Papers` section counts. A wikilink in prose elsewhere is
 * a reference, not a claimed relationship, and drawing it would put edges on
 * the graph nobody wrote a reason for.
 */
export function parseRelated(body: string): Array<{ target: string; reason: string }> {
  const start = body.search(RELATED_HEADING)
  if (start === -1) return []

  const after = body.slice(start).replace(RELATED_HEADING, '')
  const end = after.search(NEXT_HEADING)
  const section = end === -1 ? after : after.slice(0, end)

  const found: Array<{ target: string; reason: string }> = []
  for (const [, bullet] of section.matchAll(BULLET)) {
    const link = bullet.match(WIKILINK)
    if (!link) continue
    const target = link[1].trim()
    const reason = bullet
      .slice(link.index! + link[0].length)
      .replace(/^\s*[—–-]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
    found.push({ target, reason })
  }
  return found
}

/**
 * The columns of the original megadoc tables, which the note template mirrors
 * heading for heading. Reconstructing that view from the live notes means the
 * table is never out of date with the notes the way the archived doc is.
 */
export const TABLE_SECTIONS = [
  { heading: 'Core Problem', label: 'Core problem' },
  { heading: 'Method / Strategy', label: 'Method / strategy' },
  { heading: 'Main Result', label: 'Main result' },
  { heading: 'Limitations', label: 'Limitations' },
  { heading: 'Relevance to Our Work', label: 'Relevance to our work', hint: 'project ideas, questions' },
  // `optional` because an empty cell here is a fact, not a gap: the origin
  // papers draw on nothing in this collection, and what draws on *them* lives
  // on their own page under Referenced by.
  {
    heading: 'Related Papers',
    label: 'Related papers',
    hint: 'one way: what it draws on',
    optional: true,
  },
] as const

/**
 * Pull one `## Heading` section out of a note body.
 *
 * The inline `*Opus 5*` provenance marker is dropped: it means something beside
 * a section of prose, but repeated down a table column it is just noise. The
 * table labels unverified papers once, in their own column.
 */
export function extractSection(body: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')
  const start = body.search(new RegExp(`^##\\s+${escaped}\\s*$`, 'im'))
  if (start === -1) return ''

  const after = body.slice(start).replace(/^##\s+.*$/m, '')
  const end = after.search(/^##\s+/m)
  return (end === -1 ? after : after.slice(0, end))
    .replace(/^\s*\*Opus 5\*\s*$/gm, '')
    .replace(/^\s*\*Opus 5\*\s*/m, '')
    .trim()
}

/** True when any part of a note still carries the unverified-draft marker. */
export function isAiDrafted(body: string): boolean {
  return /\*Opus 5\*/.test(body)
}

/** Tags shown to readers: the per-paper citekey duplicates the filename, so it goes. */
export function displayTags(id: string, tags: string[] = []): string[] {
  return tags.filter((tag) => tag && tag !== id)
}

/**
 * When a paper came out, to the month, from the best source available.
 *
 * 1. An explicit `date: YYYY-MM` in the frontmatter always wins.
 * 2. Otherwise, modern arXiv identifiers already encode it as `YYMM.NNNNN`, so
 *    `2502.17424` is February 2025. Nobody has to type a date for an arXiv paper.
 * 3. Otherwise the year alone, which sorts below every dated paper of that year
 *    — the honest position for a paper whose month nobody has looked up.
 */
export function paperDate(
  explicit?: string,
  arxiv?: string,
  year?: number,
): { date: string; sortKey: number } {
  const stated = (explicit ?? '').trim().match(/^(\d{4})-(\d{2})$/)
  if (stated) {
    const [, yyyy, mm] = stated
    const month = Number(mm)
    if (month >= 1 && month <= 12) {
      return { date: `${yyyy}-${mm}`, sortKey: Number(yyyy) * 12 + month }
    }
  }

  const identifier = (arxiv ?? '').trim().match(/^(\d{2})(\d{2})\./)
  if (identifier) {
    const [, yy, mm] = identifier
    const month = Number(mm)
    if (month >= 1 && month <= 12) {
      const fullYear = 2000 + Number(yy)
      return { date: `${fullYear}-${mm}`, sortKey: fullYear * 12 + month }
    }
  }

  if (year !== undefined && Number.isFinite(year)) {
    return { date: String(year), sortKey: year * 12 }
  }

  return { date: '', sortKey: 0 }
}

/**
 * Rocket, at ten evenly spaced control points.
 *
 * Recency is a sequential quantity, so it takes a sequential colormap. Rocket
 * reads as heat — old papers cold and dark, new ones bright — which is the
 * ordering people already expect from a recency ramp.
 *
 * It costs something: rocket bottoms out at near-black and tops out at
 * near-white, so one end of it always disappears into the ground colour.
 * `rocket()` below solves that by clipping whichever end the current theme
 * would swallow, rather than by giving up the colormap.
 */
const ROCKET = [
  [3, 5, 26],
  [42, 22, 54],
  [84, 30, 78],
  [132, 30, 90],
  [180, 22, 88],
  [221, 44, 69],
  [240, 96, 67],
  [245, 148, 107],
  [246, 193, 159],
  [250, 235, 221],
] as const

/**
 * Sample rocket at `t` in 0–1, over the part of it the ground can carry.
 *
 * On the dark ground the first fifth is unusable — the oldest papers would be
 * black circles on a black plot — so the ramp starts at the plum instead. On
 * white the last fifth goes the same way, and the newest papers take the red
 * end. Both keep the full hue sweep and the same direction: darker is older.
 */
export function rocket(t: number, lightGround = false): string {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0))
  const scaled = lightGround ? clamped * 0.78 : 0.22 + clamped * 0.78

  const position = scaled * (ROCKET.length - 1)
  const index = Math.min(ROCKET.length - 2, Math.floor(position))
  const fraction = position - index

  const channels = ROCKET[index].map((from, channel) =>
    Math.round(from + (ROCKET[index + 1][channel] - from) * fraction),
  )
  return `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

/** `2025-02` reads as `02/25` in the interface, matching how people cite. */
export function formatDate(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})$/)
  if (match) return `${match[2]}/${match[1].slice(2)}`
  return date
}

/**
 * Where a post is published, as opposed to where a paper is.
 *
 * Plenty of this work only ever appeared on LessWrong, and those notes are as
 * real as the arXiv ones. The address is still a post: `paper` on the page has
 * to mean an abstract or a pdf, so a post is offered as the writeup it is.
 */
const POSTED = /^https?:\/\/(?:www\.)?(?:lesswrong\.com|alignmentforum\.org)\//i

/**
 * A paper's fields, with anything missing from the frontmatter read out of the
 * pasted citation instead.
 *
 * Frontmatter always wins. Somebody who corrected an author list by hand keeps
 * that correction; somebody who typed nothing but a title gets the rest for free.
 */
export function resolvePaper({ id, data, body }: PaperInput) {
  const citation = parseCitation(body)

  // A note with a link but no citation yet still gets its link on the page.
  const address = data.url ?? citation?.url ?? headLink(body) ?? undefined
  const posted = address !== undefined && POSTED.test(address)
  const blog = data.blog ?? citation?.blog

  return {
    citation,
    title: data.title?.trim() || (citation ? displayTitle(citation) : '') || id,
    authors: data.authors?.length ? data.authors : (citation?.authors ?? []),
    year: data.year ?? citation?.year,
    venue: data.venue ?? citation?.venue,
    url: posted ? undefined : address,
    pdf: data.pdf ?? citation?.pdf,
    blog: posted ? (blog ?? address) : blog,
    code: data.code ?? citation?.code,
    arxiv: data.arxiv || citation?.arxiv,
    aliases: data.aliases?.length ? data.aliases : citation?.title ? [citation.title] : [],
  }
}

export function collectNodes(papers: PaperInput[]): GraphNode[] {
  return papers.map((paper) => {
    const { id, data } = paper
    const resolved = resolvePaper(paper)
    const tags = displayTags(id, data.tags)
    const { date, sortKey } = paperDate(data.date, resolved.arxiv, resolved.year)

    const nameParts = [resolved.title, ...resolved.aliases, ...resolved.authors]
    if (resolved.year !== undefined) nameParts.push(String(resolved.year))

    return {
      id,
      title: resolved.title,
      authors: resolved.authors,
      year: resolved.year,
      venue: resolved.venue,
      url: resolved.url,
      pdf: resolved.pdf,
      blog: resolved.blog,
      code: resolved.code,
      category: data.category,
      tags,
      degree: 0,
      date,
      sortKey,
      nameText: nameParts.join(' ').toLowerCase(),
      tagText: tags.join(' ').toLowerCase(),
    }
  })
}

const RELATED_WEIGHT = 1.6
const CITES_WEIGHT = 0.55

/** One edge per pair, pointing from whoever wrote the bullet to whoever it names. */
export function deriveEdges(
  papers: PaperInput[],
  known: Set<string>,
  citations: CitationIndex = {},
): GraphEdge[] {
  const merged = new Map<string, GraphEdge>()
  const pair = (a: string, b: string) => [a, b].sort().join(' ')

  const add = (from: string, to: string, kind: EdgeKind, reason: string) => {
    if (from === to) return // a paper cannot relate to itself
    if (!known.has(from) || !known.has(to)) return // a link to a paper with no note yet

    const key = pair(from, to)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, {
        source: from,
        target: to,
        weight: kind === 'related' ? RELATED_WEIGHT : CITES_WEIGHT,
        kind,
        mutual: false,
        reasons: reason ? [{ from, text: reason }] : [],
      })
      return
    }

    // A reasoned link outranks a bibliography one: it says more, and its
    // direction is one a person chose rather than one a reference list implies.
    if (kind === 'related' && existing.kind === 'cites') {
      existing.kind = 'related'
      existing.weight = RELATED_WEIGHT
      existing.source = from
      existing.target = to
      existing.mutual = false
    } else if (kind === existing.kind && existing.source !== from) {
      existing.mutual = true
    }

    if (reason && !existing.reasons.some((r) => r.from === from && r.text === reason)) {
      existing.reasons.push({ from, text: reason })
    }
  }

  for (const paper of papers) {
    for (const { target, reason } of parseRelated(paper.body)) {
      add(paper.id, target, 'related', reason)
    }
  }

  for (const [from, targets] of Object.entries(citations)) {
    for (const to of targets) add(from, to, 'cites', '')
  }

  return [...merged.values()].sort(
    (a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target),
  )
}

/**
 * Every paper pointing at this one, with the reason that paper gave.
 *
 * This is what replaces the mirror bullet. A note writes only about the papers
 * it draws on; whatever draws on it turns up here without anyone typing it twice.
 */
export function backlinks(id: string, edges: GraphEdge[]): Backlink[] {
  const inbound: Backlink[] = []

  for (const edge of edges) {
    const from =
      edge.target === id ? edge.source : edge.mutual && edge.source === id ? edge.target : null
    if (!from) continue
    inbound.push({
      from,
      reason: edge.reasons.find((reason) => reason.from === from)?.text ?? '',
      kind: edge.kind,
    })
  }

  return inbound.sort(
    (a, b) =>
      Number(a.kind === 'cites') - Number(b.kind === 'cites') || a.from.localeCompare(b.from),
  )
}

export function buildGraph(papers: PaperInput[], citations: CitationIndex = {}): Graph {
  const nodes = collectNodes(papers)
  const known = new Set(nodes.map((node) => node.id))
  const edges = deriveEdges(papers, known, citations)

  const degree = new Map<string, number>()
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
  }
  for (const node of nodes) node.degree = degree.get(node.id) ?? 0

  nodes.sort((a, b) => a.id.localeCompare(b.id))
  return { nodes, edges }
}

/** Something about a note that a person should look at, not something to fix in code. */
export interface VaultIssue {
  kind: 'duplicate' | 'no-citation' | 'filename'
  ids: string[]
  detail: string
}

/**
 * What is wrong with the vault right now.
 *
 * Two notes about one paper is the failure that matters most: the graph splits
 * a paper's connections across two nodes and neither shows the whole picture.
 * The arXiv id, the DOI and the title are each enough to spot it.
 */
export function vaultIssues(papers: PaperInput[]): VaultIssue[] {
  const issues: VaultIssue[] = []
  const seen = new Map<string, string[]>()

  const remember = (key: string, id: string) => {
    if (!key) return
    const ids = seen.get(key)
    if (ids) ids.push(id)
    else seen.set(key, [id])
  }

  for (const paper of papers) {
    const { citation, arxiv, title } = resolvePaper(paper)

    if (!citation) {
      issues.push({
        kind: 'no-citation',
        ids: [paper.id],
        detail: 'no citation pasted, so authors, year and venue cannot be worked out',
      })
    }

    if (citation) {
      const expected = citekey(citation)
      if (expected && expected !== paper.id) {
        issues.push({
          kind: 'filename',
          ids: [paper.id],
          detail: `the citation reads as ${expected}`,
        })
      }
    }

    remember(arxiv ? `arxiv:${arxiv}` : '', paper.id)
    remember(citation?.doi ? `doi:${citation.doi.toLowerCase()}` : '', paper.id)
    remember(`title:${(citation?.title || title).toLowerCase().replace(/[^a-z0-9]/g, '')}`, paper.id)
  }

  for (const [key, ids] of seen) {
    if (ids.length > 1) {
      issues.push({ kind: 'duplicate', ids: [...ids].sort(), detail: `same ${key.split(':')[0]}` })
    }
  }

  return issues.sort((a, b) => a.kind.localeCompare(b.kind) || a.ids[0].localeCompare(b.ids[0]))
}
