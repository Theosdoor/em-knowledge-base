/**
 * Reading `Vault/Papers` from a plain node script, without Astro's collections.
 *
 * The site reads notes through `astro:content`, which only exists inside a
 * build. `pnpm citations` and `pnpm tidy` run outside one, so they come through
 * here instead and hand the same `PaperInput` shape to the same pure functions.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { vaultIssues } from '../src/lib/graph-model.ts'

export const VAULT = fileURLToPath(new URL('../../Vault', import.meta.url))
export const PAPERS = `${VAULT}/Papers`

/**
 * Just enough YAML for the fields that override a parsed citation.
 *
 * A real parser would be one more dependency for four scalar fields, and the
 * frontmatter these notes carry is written by hand in Obsidian, not generated.
 */
function frontmatter(head) {
  const field = (name) => {
    const value = head.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim()
    return value && !value.startsWith('#') ? value.replace(/^["']|["']$/g, '') : undefined
  }

  const year = Number(field('year'))
  return {
    title: field('title'),
    arxiv: field('arxiv'),
    url: field('url'),
    year: Number.isFinite(year) && year > 0 ? year : undefined,
  }
}

export function readPapers() {
  return readdirSync(PAPERS)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const raw = readFileSync(`${PAPERS}/${name}`, 'utf8')
      const head = raw.match(/^---\n([\s\S]*?)\n---\n?/)
      return {
        id: name.slice(0, -3),
        file: `${PAPERS}/${name}`,
        raw,
        data: frontmatter(head?.[1] ?? ''),
        body: head ? raw.slice(head[0].length) : raw,
      }
    })
}

/** Every markdown file in the vault, for rewriting links after a rename. */
export function everyNote(dir = VAULT, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) everyNote(path, found)
    else if (entry.name.endsWith('.md')) found.push(path)
  }
  return found
}

/**
 * Everything about the vault that a person should look at.
 *
 * One implementation behind three callers: the dev toolbar panel, `pnpm check`
 * in CI, and `pnpm tidy`. They must agree about what counts as a problem, and
 * the way to guarantee that is for there to be only one answer.
 */
export function scanVault() {
  const papers = readPapers()

  // Every name a wikilink may legitimately point at: a paper, a project note,
  // the tag registry, the index. `![[image.png]]` is an embed, not a link, and
  // is skipped rather than reported as a paper nobody has written.
  const known = new Set(
    everyNote().map((path) => path.split('/').at(-1).replace(/\.md$/, '')),
  )

  const unresolved = []
  for (const paper of papers) {
    for (const [, embed, target] of paper.body.matchAll(/(!?)\[\[([^\]|#^]+)/g)) {
      if (embed) continue
      const to = target.trim()
      const seen = unresolved.some((link) => link.from === paper.id && link.to === to)
      if (!known.has(to) && !seen) unresolved.push({ from: paper.id, to })
    }
  }

  return { count: papers.length, issues: vaultIssues(papers), unresolved }
}
