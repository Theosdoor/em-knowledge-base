import { getCollection } from 'astro:content'

import citations from '../data/citations.json'
import {
  buildGraph,
  vaultIssues,
  type CitationIndex,
  type Graph,
  type PaperInput,
  type VaultIssue,
} from './graph-model'

let cached: Graph | null = null

export async function readPapers(): Promise<PaperInput[]> {
  const entries = await getCollection('papers')
  return entries.map((entry) => ({
    id: entry.id,
    data: entry.data,
    body: entry.body ?? '',
  }))
}

/**
 * The graph, derived once per build and reused by every page that needs it.
 *
 * Two kinds of edge go in: the reasoned links people wrote under
 * `## Related Papers`, and the bibliography links `pnpm citations` recorded in
 * `data/citations.json`. The reasoned ones win wherever both describe the same
 * pair, so nothing a person wrote is ever overwritten by a reference list.
 */
export async function loadGraph(): Promise<Graph> {
  if (cached) return cached

  const papers = await readPapers()
  const graph = buildGraph(papers, citations as CitationIndex)

  report(vaultIssues(papers))

  cached = graph
  return graph
}

/**
 * Things a person should look at, printed once per build.
 *
 * Never thrown: a half-finished note must still deploy. Duplicates come first
 * because they are the only issue here that quietly makes the graph wrong.
 */
function report(issues: VaultIssue[]) {
  if (!issues.length) return

  const lines = {
    duplicate: (issue: VaultIssue) => `two notes for one paper (${issue.detail}): ${issue.ids.join(', ')}`,
    filename: (issue: VaultIssue) => `${issue.ids[0]}: ${issue.detail} — run \`pnpm tidy\` to rename it`,
    'no-citation': (issue: VaultIssue) => `${issue.ids[0]}: ${issue.detail}`,
  }

  console.warn(`\n[vault] ${issues.length} thing${issues.length === 1 ? '' : 's'} to look at:`)
  for (const issue of issues) console.warn(`  ${lines[issue.kind](issue)}`)
  console.warn('')
}

/** Every tag in use, with how many papers carry it. Powers the glossary page. */
export async function loadTagCounts(): Promise<Array<{ tag: string; count: number }>> {
  const { nodes } = await loadGraph()
  const counts = new Map<string, number>()
  for (const node of nodes) {
    for (const tag of node.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
