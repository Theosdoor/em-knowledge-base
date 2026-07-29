/**
 * Give every note the filename its citation says it should have.
 *
 * The citekey is a paper's identity everywhere — filename, graph node, URL — and
 * working it out by hand is the last piece of bookkeeping the note format still
 * asked for. Obsidian creates new notes as `Untitled`; this turns those into
 * `betleyEmergent2025` once a citation has been pasted in.
 *
 *   pnpm tidy          rename untitled notes, report every other mismatch
 *   pnpm tidy --all    also rename notes whose name disagrees with their citation
 *   pnpm tidy --dry    say what would happen and change nothing
 *
 * Renaming an established note changes its published URL, which is why that
 * needs `--all` and is never the default.
 */

import { readFileSync, renameSync, writeFileSync } from 'node:fs'

import { citekey, parseCitation } from '../src/lib/citation.ts'
import { vaultIssues } from '../src/lib/graph-model.ts'
import { everyNote, PAPERS, readPapers } from './vault.mjs'

const all = process.argv.includes('--all')
const dry = process.argv.includes('--dry')

/** A name nobody chose: what Obsidian calls a note before you have named it. */
const unnamed = (id) => /^untitled/i.test(id) || /\s/.test(id) || /^new note/i.test(id)

function rewriteLinks(from, to) {
  const pattern = new RegExp(`\\[\\[${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\]|#^])`, 'g')
  let touched = 0

  for (const file of everyNote()) {
    const before = readFileSync(file, 'utf8')
    const after = before.replace(pattern, `[[${to}`)
    if (after === before) continue
    if (!dry) writeFileSync(file, after)
    touched += 1
  }
  return touched
}

const papers = readPapers()
const renames = []
const report = []

for (const paper of papers) {
  const citation = parseCitation(paper.body)
  if (!citation) {
    report.push(`${paper.id}: no citation pasted yet, so nothing to name it from`)
    continue
  }

  const expected = citekey(citation)
  if (!expected || expected === paper.id) continue

  if (papers.some((other) => other.id === expected)) {
    report.push(`${paper.id}: would be ${expected}, but a note by that name already exists`)
    continue
  }

  if (all || unnamed(paper.id)) renames.push({ from: paper.id, to: expected })
  else report.push(`${paper.id}: its citation reads as ${expected} (rename with \`pnpm tidy --all\`)`)
}

for (const { from, to } of renames) {
  const touched = rewriteLinks(from, to)
  if (!dry) renameSync(`${PAPERS}/${from}.md`, `${PAPERS}/${to}.md`)
  console.log(
    `${dry ? 'would rename' : 'renamed'} ${from} -> ${to}` +
      (touched ? ` (${touched} file${touched === 1 ? '' : 's'} relinked)` : ''),
  )
}

for (const line of report) console.log(line)

const duplicates = vaultIssues(papers).filter((issue) => issue.kind === 'duplicate')
for (const issue of duplicates) {
  console.log(`two notes for one paper (${issue.detail}): ${issue.ids.join(', ')}`)
}

if (!renames.length && !report.length && !duplicates.length) {
  console.log(`${papers.length} notes, every one named after its citation.`)
}
