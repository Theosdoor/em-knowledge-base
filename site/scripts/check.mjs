/**
 * The vault report, as markdown, for the Actions summary.
 *
 * Deliberately never exits non-zero. A duplicated paper or a misnamed file is
 * something a person has to decide about, and blocking the deploy over it would
 * break the one promise this repo makes to whoever is writing: nothing you type
 * can stop the site going out. It reports; you fix it when you see it.
 *
 *   pnpm check                  print the report
 *   pnpm check >> "$SUMMARY"    what CI does
 */

import { scanVault } from './vault.mjs'

const LABEL = {
  duplicate: 'Two notes, one paper',
  filename: 'Filename disagrees with its citation',
  'no-citation': 'No citation pasted',
}

const { count, issues, unresolved } = scanVault()
const lines = [`### Vault`, '', `${count} paper notes.`, '']

if (!issues.length && !unresolved.length) {
  lines.push('Nothing to fix.')
} else {
  lines.push('| what | which | detail |', '| --- | --- | --- |')

  for (const issue of issues) {
    lines.push(`| ${LABEL[issue.kind] ?? issue.kind} | \`${issue.ids.join('`, `')}\` | ${issue.detail} |`)
  }

  for (const { from, to } of unresolved) {
    lines.push(`| Link to a paper with no note | \`${from}\` | points at \`${to}\` |`)
  }

  lines.push(
    '',
    'None of this stops the deploy. `pnpm tidy` fixes filenames; the rest needs a person.',
  )
}

console.log(lines.join('\n'))
