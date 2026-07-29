/**
 * The literature graph: one node per paper, one edge per related pair, in 3D.
 *
 * Typing in the search field splits the corpus into two readings of the same
 * node — matched by name, or matched by tag — and dims everything else. The
 * two accents are a diverging pair rather than a hierarchy, because neither
 * kind of match outranks the other.
 *
 * Each node's geometry is built once and then mutated in place on every search
 * keystroke. Rebuilding meshes per keystroke would stutter; swapping a material
 * colour does not.
 */

import ForceGraph3D from '3d-force-graph'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
} from 'three'
import SpriteText from 'three-spritetext'

import { viridis, type Graph, type GraphEdge, type GraphNode } from '../lib/graph-model'

type MatchState = 'rest' | 'name' | 'tag' | 'miss'

interface RenderNode extends GraphNode {
  x?: number
  y?: number
  z?: number
  state: MatchState
  mesh?: Mesh<SphereGeometry, MeshLambertMaterial>
  label?: SpriteText
}

interface RenderEdge extends Omit<GraphEdge, 'source' | 'target'> {
  source: string | RenderNode
  target: string | RenderNode
}

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

function readPalette() {
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
    // On white, viridis runs backwards: its bright yellow end is invisible
    // there, so the newest papers take the dark end instead.
    heatReversed: style.colorScheme === 'light',
  }
}

export function classify(node: GraphNode, query: string): MatchState {
  if (!query) return 'rest'
  if (node.nameText.includes(query)) return 'name'
  if (node.tagText.includes(query)) return 'tag'
  return 'miss'
}

export function summarise(states: MatchState[]): string {
  if (!states.length || states.every((s) => s === 'rest')) return ''
  const count = (want: MatchState) => states.filter((s) => s === want).length
  return `${count('name')} name · ${count('tag')} tag · ${count('miss')} dim`
}

export function mount(container: HTMLElement, graph: Graph) {
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
  /** True while the camera has flown in on one node rather than the whole corpus. */
  let focused = false
  /** Recency heatmap. On by default; the search accents override it while typing. */
  let heat = localStorage.getItem('heatmap') !== 'off'

  // Normalise publication dates onto 0–1 for the heat ramp. Papers with no date
  // at all sit at the old end rather than being given a position they haven't earned.
  const dated = nodes.map((node) => node.sortKey).filter((key) => key > 0)
  const oldest = dated.length ? Math.min(...dated) : 0
  const newest = dated.length ? Math.max(...dated) : 0
  const recency = (node: RenderNode) =>
    newest > oldest && node.sortKey > 0 ? (node.sortKey - oldest) / (newest - oldest) : 0

  const endpointId = (end: string | RenderNode) => (typeof end === 'string' ? end : end.id)
  const isNear = (id: string) =>
    selected !== null && (id === selected || (neighbours.get(selected)?.has(id) ?? false))
  const radius = (node: RenderNode) => 2.6 + Math.sqrt(node.degree) * 1.5

  /**
   * How a node reads right now: colour, how solid it looks, whether it is
   * labelled. Called on every keystroke, so it only touches material state.
   */
  function paint(node: RenderNode) {
    const { mesh, label } = node
    if (!mesh || !label) return

    const dimmed = node.state === 'miss' || (Boolean(selected) && !isNear(node.id) && !query)

    // At rest the graph can be read as a timeline; under a query it is read as
    // an answer. Only one of those colour systems is ever on screen at once.
    const atRest =
      heat && !query
        ? new Color(viridis(recency(node), palette.heatReversed))
        : new Color(palette.rest)

    const colour =
      node.state === 'name'
        ? new Color(palette.name)
        : node.state === 'tag'
          ? new Color(palette.tag)
          : atRest

    mesh.material.color = colour
    mesh.material.opacity = node.state === 'miss' ? 0.18 : dimmed ? 0.4 : 1

    // Emissive carries most of the sphere's colour, so what you see is close to
    // the value being encoded rather than that value multiplied by a light. In a
    // graph where colour *is* the data, shading must not distort it.
    mesh.material.emissive = colour.clone()
    mesh.material.emissiveIntensity = node.id === selected ? 0.95 : 0.62

    label.visible = node.state !== 'miss' && (!selected || !query ? true : node.state !== 'rest')
    // Labels stay in the text colour rather than the node colour: at the dark
    // end of viridis a matching label would be unreadable against the ground.
    label.color = node.state === 'rest' ? palette.body : `#${colour.getHexString()}`
    label.material.opacity = dimmed ? 0.4 : 1
  }

  const view = ForceGraph3D()(container)
    .graphData({ nodes, links: edges })
    .nodeId('id')
    .backgroundColor(palette.ground)
    .showNavInfo(false)
    .enableNodeDrag(false)
    .nodeThreeObject((node: RenderNode) => {
      const r = radius(node)
      const mesh = new Mesh(
        new SphereGeometry(r, 20, 16),
        new MeshLambertMaterial({ transparent: true }),
      )

      // Labels hold a constant size on screen rather than scaling with depth.
      // Attenuated sprites make a paper near the camera unreadably large while
      // its neighbours shrink away, and this graph exists to be read.
      const label = new SpriteText(node.title)
      label.textHeight = 0.014
      label.fontFace = 'IBM Plex Sans Variable, system-ui, sans-serif'
      label.position.y = -(r + 3)
      label.material.depthWrite = false
      label.material.sizeAttenuation = false
      label.material.needsUpdate = true

      node.mesh = mesh
      node.label = label
      paint(node)

      const group = new Group()
      group.add(mesh, label)
      return group
    })
    // An edge stands out by being drawn in the body colour rather than the rule
    // colour; using the brightest token would make near-black cables in light mode.
    .linkColor((edge: RenderEdge) => {
      const a = byId.get(endpointId(edge.source))
      const b = byId.get(endpointId(edge.target))
      if (!a || !b) return palette.rest
      if (query) return a.state === 'miss' || b.state === 'miss' ? palette.rule : palette.bright
      if (selected) return isNear(a.id) && isNear(b.id) ? palette.bright : palette.rule
      return palette.rest
    })
    .linkOpacity(0.75)
    .linkWidth((edge: RenderEdge) => edge.weight * 0.55)
    .onNodeHover((node: RenderNode | null) => {
      container.style.cursor = node ? 'pointer' : 'default'
    })
    .onNodeClick((node: RenderNode) => open(node.id))
    .onBackgroundClick(() => close())

  // Spread the layout wider than the default: labels sit under the spheres, so
  // a tight cluster is unreadable however good the colours are.
  // Flood the scene so sphere colour reads as itself. The default rig is lit
  // for shaded objects; here the colour is the measurement.
  const scene = view.scene()
  scene.add(new AmbientLight(0xffffff, 2.6))
  const key = new DirectionalLight(0xffffff, 0.7)
  key.position.set(1, 1, 1)
  scene.add(key)

  view.d3Force('charge')?.strength(-260)
  view.d3Force('link')?.distance(64)

  /**
   * Frame the whole corpus, viewed from slightly off-axis so the depth reads
   * as depth. `zoomToFit` alone leaves the graph small in the viewport, so its
   * fitted distance is taken as a starting point and closed in on.
   */
  function frameAll(durationMs = 700) {
    focused = false
    view.zoomToFit(0, 24)
    const fitted = view.cameraPosition()
    const distance = Math.hypot(fitted.x, fitted.y, fitted.z) * 0.95
    view.cameraPosition(
      { x: distance * 0.3, y: distance * 0.18, z: distance * 0.93 },
      { x: 0, y: 0, z: 0 },
      durationMs,
    )
  }

  // Wait for the layout to settle before moving the camera: node positions are
  // still being solved until the engine stops, so an earlier fly lands nowhere.
  view.cooldownTicks(140).onEngineStop(() => {
    view.onEngineStop(() => {})
    const landing = selected ? byId.get(selected) : undefined
    if (landing) flyTo(landing)
    else frameAll()
  })

  function repaintAll() {
    for (const node of nodes) paint(node)
    view.linkColor(view.linkColor()) // re-evaluate the link accessor
  }

  // ---- search ------------------------------------------------------------

  const input = document.getElementById('search') as HTMLInputElement | null
  const readout = document.getElementById('readout')

  function applyQuery(raw: string) {
    query = raw.trim().toLowerCase()
    for (const node of nodes) node.state = classify(node, query)
    if (readout) readout.textContent = summarise(nodes.map((node) => node.state))
    // Searching is a question about the whole corpus, so pull the camera back
    // out if it had flown in on one paper.
    if (focused) frameAll(450)
    showHeatState()
    repaintAll()
  }

  input?.addEventListener('input', () => applyQuery(input.value))

  // ---- recency heatmap ---------------------------------------------------

  const heatToggle = document.getElementById('heat-toggle')
  const legend = document.getElementById('legend')

  function showHeatState() {
    heatToggle?.setAttribute('aria-pressed', String(heat))
    legend?.setAttribute('data-mode', heat && !query ? 'heat' : 'match')
  }

  heatToggle?.addEventListener('click', () => {
    heat = !heat
    localStorage.setItem('heatmap', heat ? 'on' : 'off')
    showHeatState()
    repaintAll()
  })

  showHeatState()

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

  /**
   * Sit the camera a fixed distance out from one paper, looking at it, along
   * the line from the centre of the graph through that paper — so its
   * neighbours stay behind it in frame rather than off-screen.
   */
  function flyTo(node: RenderNode) {
    focused = true
    const target = { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 }
    const length = Math.hypot(target.x, target.y, target.z)
    const unit =
      length < 0.001
        ? { x: 0, y: 0, z: 1 }
        : { x: target.x / length, y: target.y / length, z: target.z / length }

    const distance = 165
    view.cameraPosition(
      {
        x: target.x + unit.x * distance,
        y: target.y + unit.y * distance,
        z: target.z + unit.z * distance,
      },
      target,
      700,
    )
  }

  async function open(id: string, { push = true } = {}) {
    const node = byId.get(id)
    if (!node) return

    selected = id
    panel.hidden = false
    container.dataset.selected = id
    if (push) history.pushState({ id }, '', `${BASE}papers/${id}/`)

    flyTo(node)
    repaintAll()

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
    repaintAll()
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

  // ---- theme and size ----------------------------------------------------

  const retheme = () => {
    palette = readPalette()
    view.backgroundColor(palette.ground)
    repaintAll()
  }
  new MutationObserver(retheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', retheme)

  const resize = () => view.width(container.clientWidth).height(container.clientHeight)
  new ResizeObserver(resize).observe(container)
  resize()

  return view
}
