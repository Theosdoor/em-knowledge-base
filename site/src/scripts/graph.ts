/**
 * The literature graph: one node per paper, one edge per related pair.
 *
 * This module owns state — the query, the selected paper, the recency toggle,
 * the 2D/3D mode — and hands drawing to a renderer. Appearance decisions live
 * in `appearance.ts` so both renderers agree, and the renderers themselves live
 * in `renderers.ts`.
 */

import type { Graph } from '../lib/graph-model'
import { classify, summarise, type Palette, type ViewState } from './appearance'
import { createRenderer, type Mode, type RenderEdge, type RenderNode, type Renderer } from './renderers'

const BASE = document.documentElement.dataset.base ?? '/'

/** Shown when a note fails to load, offering the standalone page instead. */
function fallback(id: string): HTMLElement {
  const paragraph = document.createElement('p')
  paragraph.append('That note would not load. ')
  const link = document.createElement('a')
  link.href = `${BASE}papers/${id}/`
  link.textContent = 'Open it on its own page'
  paragraph.append(link, '.')
  return paragraph
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const token = (name: string) => style.getPropertyValue(name).trim()
  return {
    name: token('--match-name'),
    tag: token('--match-tag'),
    rest: token('--muted'),
    body: token('--body'),
    bright: token('--bright'),
    rule: token('--rule'),
    ground: token('--ink'),
    // Rocket's pale end vanishes on white and its near-black end vanishes on
    // the dark ground, so the ramp is clipped at whichever end this theme
    // cannot carry.
    lightGround: style.colorScheme === 'light',
  }
}

export async function mount(container: HTMLElement, graph: Graph) {
  const nodes: RenderNode[] = graph.nodes.map((node) => ({ ...node, state: 'rest' }))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const edges: RenderEdge[] = graph.edges.map((edge) => ({ ...edge }))

  const neighbours = new Map<string, Set<string>>()
  for (const edge of graph.edges) {
    if (!neighbours.has(edge.source)) neighbours.set(edge.source, new Set())
    if (!neighbours.has(edge.target)) neighbours.set(edge.target, new Set())
    neighbours.get(edge.source)!.add(edge.target)
    neighbours.get(edge.target)!.add(edge.source)
  }

  let palette = readPalette()
  let selected: string | null = container.dataset.selected || null
  let query = ''
  /** True while the camera has closed in on one node rather than the whole corpus. */
  let closedIn = false
  let heat = localStorage.getItem('heatmap') !== 'off'
  // 2D by default: it reads more clearly at this size, and it means the three.js
  // bundle is only fetched by people who ask for 3D.
  let mode: Mode = localStorage.getItem('graph-mode') === '3d' ? '3d' : '2d'

  // Normalise publication dates onto 0–1 for the recency ramp. Papers with no
  // date sit at the old end rather than being given a position they haven't earned.
  const dated = nodes.map((node) => node.sortKey).filter((key) => key > 0)
  const oldest = dated.length ? Math.min(...dated) : 0
  const newest = dated.length ? Math.max(...dated) : 0

  const view: ViewState = {
    get query() {
      return query
    },
    get selected() {
      return selected
    },
    get heat() {
      return heat
    },
    recency: (node) =>
      newest > oldest && node.sortKey > 0 ? (node.sortKey - oldest) / (newest - oldest) : 0,
    isNear: (id) =>
      selected !== null && (id === selected || (neighbours.get(selected)?.has(id) ?? false)),
  }

  let renderer: Renderer = await createRenderer(mode, container, {
    nodes,
    edges,
    view,
    palette: () => palette,
    onNodeClick: (id) => open(id),
    onBackgroundClick: () => close(),
  })

  const resize = () => renderer.resize()
  new ResizeObserver(resize).observe(container)
  resize()

  // Wait for the layout to settle before moving the camera: node positions are
  // still being solved until then, so an earlier move lands nowhere.
  setTimeout(() => {
    const landing = selected ? byId.get(selected) : undefined
    if (landing) {
      closedIn = true
      renderer.flyTo(landing)
    } else {
      renderer.frameAll()
    }
  }, 900)

  // ---- search ------------------------------------------------------------

  const input = document.getElementById('search') as HTMLInputElement | null
  const readout = document.getElementById('readout')

  function applyQuery(raw: string) {
    query = raw.trim().toLowerCase()
    for (const node of nodes) node.state = classify(node, query)
    if (readout) readout.textContent = summarise(nodes.map((node) => node.state))
    // Searching is a question about the whole corpus, so pull back out if the
    // camera had closed in on one paper.
    if (closedIn) {
      closedIn = false
      renderer.frameAll(450)
    }
    showToggleStates()
    renderer.repaint()
  }

  input?.addEventListener('input', () => applyQuery(input.value))

  // ---- recency and dimension toggles -------------------------------------

  const heatToggle = document.getElementById('heat-toggle')
  const modeToggle = document.getElementById('mode-toggle')
  const modeLabel = document.getElementById('mode-label')
  const legend = document.getElementById('legend')

  function showToggleStates() {
    heatToggle?.setAttribute('aria-pressed', String(heat))
    legend?.setAttribute('data-mode', heat && !query ? 'heat' : 'match')
    if (modeLabel) modeLabel.textContent = mode.toUpperCase()
    modeToggle?.setAttribute('aria-label', `Switch to ${mode === '3d' ? '2D' : '3D'} graph`)
  }

  heatToggle?.addEventListener('click', () => {
    heat = !heat
    localStorage.setItem('heatmap', heat ? 'on' : 'off')
    showToggleStates()
    renderer.repaint()
  })

  modeToggle?.addEventListener('click', async () => {
    mode = mode === '3d' ? '2d' : '3d'
    localStorage.setItem('graph-mode', mode)

    // Positions are carried across, so the graph does not reshuffle when you
    // switch; the same cluster stays where you last saw it.
    renderer.destroy()
    container.replaceChildren()
    renderer = await createRenderer(mode, container, {
      nodes,
      edges,
      view,
      palette: () => palette,
      onNodeClick: (id) => open(id),
      onBackgroundClick: () => close(),
    })
    renderer.resize()
    showToggleStates()
    renderer.repaint()

    const landing = selected ? byId.get(selected) : undefined
    setTimeout(() => (landing ? renderer.flyTo(landing) : renderer.frameAll()), 400)
  })

  showToggleStates()

  // ---- reading panel -----------------------------------------------------

  const panel = document.getElementById('panel')!
  const body = document.getElementById('note-body')!
  const cache = new Map<string, string>()

  async function fetchNote(id: string): Promise<string> {
    const cached = cache.get(id)
    if (cached) return cached

    const response = await fetch(`${BASE}papers/${id}/`)
    if (!response.ok) throw new Error(`${response.status}`)
    const parsed = new DOMParser().parseFromString(await response.text(), 'text/html')
    const html = parsed.getElementById('note-body')?.innerHTML
    if (!html) throw new Error('no note body')
    cache.set(id, html)
    return html
  }

  async function open(id: string, { push = true } = {}) {
    const node = byId.get(id)
    if (!node) return

    selected = id
    closedIn = true
    panel.hidden = false
    container.dataset.selected = id
    if (push) history.pushState({ id }, '', `${BASE}papers/${id}/`)

    renderer.flyTo(node)
    renderer.repaint()

    if (body.dataset.paper !== id) {
      body.dataset.paper = id
      body.setAttribute('aria-busy', 'true')
      try {
        // Same-origin HTML from our own build output, not user input.
        body.innerHTML = await fetchNote(id)
      } catch {
        body.replaceChildren(fallback(id))
      }
      body.removeAttribute('aria-busy')
      body.scrollTo({ top: 0 })
    }
  }

  function close({ push = true } = {}) {
    if (!selected) return
    selected = null
    panel.hidden = true
    delete container.dataset.selected
    if (push) history.pushState({}, '', BASE)
    renderer.repaint()
  }

  document.getElementById('panel-close')?.addEventListener('click', () => close())

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden && document.activeElement !== input) close()
  })

  // Clicking a related-paper link inside the panel moves the graph rather than
  // leaving the page, so you never lose your place in a cluster.
  body.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-paper]')
    if (!link) return
    event.preventDefault()
    open(link.dataset.paper!)
  })

  addEventListener('popstate', () => {
    const match = location.pathname.match(/papers\/([^/]+)\/?$/)
    if (match) open(decodeURIComponent(match[1]), { push: false })
    else close({ push: false })
  })

  // ---- theme -------------------------------------------------------------

  const retheme = () => {
    palette = readPalette()
    renderer.retheme()
    renderer.repaint()
  }
  new MutationObserver(retheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', retheme)
}
