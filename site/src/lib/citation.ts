/**
 * Everything a pasted citation already says, read back out of it.
 *
 * Writing a note is meant to be: type a title, paste the citation, paste the
 * link. Authors, year, venue, arXiv id, the abs/pdf links and even the citekey
 * are all sitting inside those two lines, so nothing asks anyone to type them a
 * second time into frontmatter.
 *
 * Frontmatter still wins wherever it is present. Parsing is a fallback for what
 * nobody wrote down, never an override of what somebody did.
 *
 * Pure and dependency-free, so it is unit-tested on its own and can also be run
 * from a plain node script.
 */

export interface Citation {
  /** The citation as pasted, collapsed onto one line. */
  text: string
  /** `Given Surname`, in citation order. Short of everyone when `etAl` is set. */
  authors: string[]
  /** First author's surname. The first half of the citekey. */
  surname: string
  /** The citation said "et al.", so `authors` is not the full list. */
  etAl: boolean
  /** Full title, as quoted in the citation. */
  title: string
  year?: number
  venue?: string
  arxiv?: string
  doi?: string
  /** Landing page: the pasted link, a labelled link in the citation, or arXiv abs. */
  url?: string
  /** Direct pdf, where one can be named without guessing. */
  pdf?: string
  /** A writeup of the paper, where the citation labelled one `[blog](…)`. */
  blog?: string
  /** The paper's own repository, where the citation labelled one `[code](…)`. */
  code?: string
}

/**
 * Labels that name something about the paper rather than the paper itself, so
 * they never stand in for its landing page.
 */
const NOT_THE_PAPER = new Set(['blog', 'code'])

/** Words that never start a citekey. Taken from the rule in `CONTRIBUTING.md`. */
const SKIP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'by', 'can', 'do', 'does', 'for', 'from', 'how',
  'in', 'is', 'of', 'on', 'some', 'the', 'to', 'toward', 'towards', 'what', 'when',
  'why', 'with',
])

/** Letters that do not decompose under NFD but still have an obvious ascii twin. */
const TRANSLITERATE: Record<string, string> = {
  ø: 'o', Ø: 'O', đ: 'd', Đ: 'D', ł: 'l', Ł: 'L', æ: 'ae', Æ: 'Ae',
  œ: 'oe', Œ: 'Oe', ß: 'ss', ð: 'd', Ð: 'D', þ: 'th', Þ: 'Th',
}

const ARXIV_IN_URL = /arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/i
const ARXIV_BARE = /arxiv[:\s]*(\d{4}\.\d{4,5})/i
const DOI = /\b(10\.\d{4,9}\/[^\s"'<>)\]]+)/
const MARKDOWN_LINK = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g
const BARE_URL = /https?:\/\/\S+/g
const QUOTED_TITLE = /["“]([^"”]+)["”]/
const YEAR = /\b(19|20)\d{2}\b/g

/** The part of a note above its first `## Section`, where the citation lives. */
export function headRegion(body: string): string {
  const heading = body.search(/^##\s+/m)
  return heading === -1 ? body : body.slice(0, heading)
}

/**
 * The pasted citation: the first blockquote in the head region that is not a
 * callout. Callouts are skipped rather than treated as a stopping point, because
 * a note may well open with `> [!todo] Citation not filled in`.
 */
export function citationText(body: string): string | null {
  const blocks: string[][] = []
  let current: string[] | null = null

  for (const line of headRegion(body).split('\n')) {
    if (/^\s*>/.test(line)) {
      if (!current) blocks.push((current = []))
      current.push(line.replace(/^\s*>\s?/, ''))
    } else if (line.trim() === '') {
      current = null
    }
  }

  for (const block of blocks) {
    const text = block.join(' ').replace(/\s+/g, ' ').trim()
    if (!text || /^\[!\w+\]/.test(text)) continue
    return text
  }
  return null
}

/** The pasted link: a line in the head region that is nothing but a URL. */
export function headLink(body: string): string | null {
  for (const line of headRegion(body).split('\n')) {
    const match = line.trim().match(/^<?(https?:\/\/\S+?)>?$/)
    if (match) return match[1]
  }
  return null
}

/** Strip diacritics and the letters NFD leaves alone, so `Riché` keys as `riche`. */
export function deburr(text: string): string {
  return text
    .replace(/[øØđĐłŁæÆœŒßðÐþÞ]/g, (char) => TRANSLITERATE[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseAuthors(chunk: string): Pick<Citation, 'authors' | 'surname' | 'etAl'> {
  const cleaned = chunk
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[.,;\s]+$/, '')
    .trim()

  const segments = cleaned.split(/\s*,\s*/).map((part) => part.trim()).filter(Boolean)
  if (!segments.length) return { authors: [], surname: '', etAl: false }

  // `Surname, Given, …` for the first author, which is the near-universal style.
  // A citation reading `Smith and Jones` has no comma before the second name, so
  // it is left alone rather than flipped into `Jones Smith`.
  const inverted =
    segments.length >= 2 &&
    !segments[0].includes(' ') &&
    !/^(and\s+)?et\.?\s*al/i.test(segments[1])

  const names: string[] = []
  let etAl = false

  outer: for (const segment of segments) {
    for (const piece of segment.replace(/^and\s+/i, '').split(/\s+and\s+/i)) {
      let name = piece.trim()
      if (/^et\.?\s*al/i.test(name)) {
        etAl = true
        break outer
      }
      if (/\set\.?\s*al\.?$/i.test(name)) {
        etAl = true
        name = name.replace(/\s+et\.?\s*al\.?$/i, '').trim()
      }
      if (name) names.push(name)
    }
  }

  const surname = inverted ? segments[0] : (names[0]?.split(/\s+/).at(-1) ?? '')
  const authors =
    inverted && names.length >= 2 ? [`${names[1]} ${names[0]}`, ...names.slice(2)] : names

  return { authors, surname, etAl }
}

/**
 * Read a pasted citation and link into the fields a note would otherwise repeat
 * in frontmatter. Returns `null` when the note carries no citation at all.
 */
export function parseCitation(body: string): Citation | null {
  const text = citationText(body)
  if (!text) return null

  const links = new Map<string, string>()
  for (const [, label, href] of text.matchAll(MARKDOWN_LINK)) {
    links.set(label.trim().toLowerCase(), href)
  }

  const prose = text.replace(MARKDOWN_LINK, ' ').replace(BARE_URL, ' ')
  const pasted = headLink(body)
  const haystack = `${text} ${pasted ?? ''}`

  const arxiv = (haystack.match(ARXIV_IN_URL) ?? haystack.match(ARXIV_BARE))?.[1]
  const doi = haystack.match(DOI)?.[1]

  const quoted = prose.match(QUOTED_TITLE)
  const title = quoted?.[1].replace(/[.,;\s]+$/, '').trim() ?? ''
  const before = quoted ? prose.slice(0, prose.indexOf(quoted[0])) : ''
  const after = quoted ? prose.slice(prose.indexOf(quoted[0]) + quoted[0].length) : prose

  const { authors, surname, etAl } = parseAuthors(before)

  const years = [...after.replace(ARXIV_BARE, ' ').matchAll(YEAR)].map((m) => Number(m[0]))
  const year = years.at(-1) ?? (arxiv ? 2000 + Number(arxiv.slice(0, 2)) : undefined)

  const url =
    pasted ??
    links.get('abs') ??
    links.get('report') ??
    links.get('paper') ??
    [...links].find(([label]) => !NOT_THE_PAPER.has(label))?.[1] ??
    (arxiv ? `https://arxiv.org/abs/${arxiv}` : doi ? `https://doi.org/${doi}` : undefined)

  const pdf = links.get('pdf') ?? (arxiv ? `https://arxiv.org/pdf/${arxiv}` : undefined)

  return {
    text, authors, surname, etAl, title, year,
    venue: parseVenue(after), arxiv, doi, url, pdf,
    blog: links.get('blog'), code: links.get('code'),
  }
}

/**
 * Where it appeared, from whatever follows the title.
 *
 * Everything arXiv says the same thing however it was typed, so it collapses to
 * one word. A real venue keeps its own words; the year and the identifier are
 * dropped because they are already fields of their own.
 */
function parseVenue(after: string): string | undefined {
  if (/arxiv/i.test(after)) return 'arXiv'

  const venue = after
    .replace(YEAR, ' ')
    .replace(/[*_]/g, '')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s.,;:·–—-]+|[\s.,;:·–—-]+$/g, '')
    .trim()

  return venue || undefined
}

/**
 * The paper's identity everywhere: filename, graph node and URL.
 *
 * `firstauthor(lowercase) + FirstSignificantTitleWord + year`, which is the rule
 * `CONTRIBUTING.md` already asked people to apply by hand. Returns `''` when the
 * citation is too thin to name one, so callers can leave the filename alone
 * rather than inventing something.
 */
export function citekey(citation: Pick<Citation, 'surname' | 'title' | 'year'>): string {
  const surname = deburr(citation.surname).replace(/[^a-zA-Z]/g, '').toLowerCase()
  const word = firstSignificantWord(citation.title)
  if (!surname || !word || !citation.year) return ''
  return `${surname}${word}${citation.year}`
}

/** `Stress-Testing Inoculation…` -> `StressTesting`, skipping leading articles. */
export function firstSignificantWord(title: string): string {
  const words = deburr(title)
    .replace(/\([^)]*\)/g, ' ')
    .split(/[\s—–]+/)
    .map((word) => word.replace(/[^a-zA-Z-]/g, ''))
    .filter(Boolean)

  const chosen = words.find((word) => !SKIP_WORDS.has(word.toLowerCase())) ?? words[0]
  if (!chosen) return ''

  return chosen
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

/**
 * The name a paper goes by in the graph: `Riché 2026 — Inoculation Adapters`.
 *
 * Subtitles are dropped. A title reads at a glance up to its colon and rarely
 * after it, and node labels are read at a glance by definition.
 */
export function displayTitle(citation: Pick<Citation, 'surname' | 'title' | 'year'>): string {
  const short = shortTitle(citation.title)
  if (!citation.surname || !citation.year) return short
  return short ? `${citation.surname} ${citation.year} — ${short}` : ''
}

export function shortTitle(title: string, limit = 58): string {
  const head = (title.split(':')[0] || title).trim()
  if (head.length <= limit) return head

  const cut = head.slice(0, limit)
  const boundary = cut.lastIndexOf(' ')
  return `${(boundary > 20 ? cut.slice(0, boundary) : cut).trim()}…`
}
