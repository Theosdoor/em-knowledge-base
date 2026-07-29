import { getCollection } from 'astro:content'

import { buildGraph, findOneWayLinks, type Graph, type PaperInput } from './graph-model'

let cached: Graph | null = null

async function readPapers(): Promise<PaperInput[]> {
  const entries = await getCollection('papers')
  return entries.map((entry) => ({
    id: entry.id,
    data: entry.data,
    body: entry.body ?? '',
  }))
}

/**
 * The graph, derived once per build and reused by every page that needs it.
 */
export async function loadGraph(): Promise<Graph> {
  if (cached) return cached

  const papers = await readPapers()
  const graph = buildGraph(papers)

  const oneWay = findOneWayLinks(papers, new Set(graph.nodes.map((n) => n.id)))
  if (oneWay.length) {
    console.warn(
      `\n[graph] ${oneWay.length} link${oneWay.length === 1 ? '' : 's'} written in only one direction ` +
        `(CONTRIBUTING.md asks for a mirror bullet on both notes):`,
    )
    for (const { from, to } of oneWay) console.warn(`  ${from} -> ${to}`)
    console.warn('')
  }

  cached = graph
  return graph
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
