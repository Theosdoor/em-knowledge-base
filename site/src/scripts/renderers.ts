/**
 * The two ways of drawing the same graph.
 *
 * Both take identical data and identical appearance decisions and differ only
 * in how they put pixels on screen: 2D is a canvas and reads like a diagram,
 * 3D is WebGL and reads like a structure you can turn over. Switching between
 * them must never change what the graph means, which is why every colour and
 * label decision lives in `appearance.ts` rather than in here.
 */

import type { EdgeKind, GraphNode } from '../lib/graph-model'
import { linkLook, nodeLook, nodeRadius, type MatchState, type Palette, type ViewState } from './appearance'

export type Mode = '2d' | '3d'

export interface RenderNode extends GraphNode {
  x?: number
  y?: number
  z?: number
  state: MatchState
}

export interface RenderEdge {
  source: string | RenderNode
  target: string | RenderNode
  weight: number
  kind: EdgeKind
  mutual: boolean
}

/**
 * A one-way link gets an arrowhead, because the direction is the claim: this
 * paper draws on that one, not the other way round. A mutual pair gets none —
 * both notes wrote about each other, so there is no direction to point.
 *
 * 2D measures arrows in graph units against a flat canvas; 3D measures them in
 * world units against a sphere you can be inside. The same number is not the
 * same size, so each renderer passes its own.
 */
const arrowLength = (edge: RenderEdge, size: number) => (edge.mutual ? 0 : size)

/**
 * How much wider than the drawn node its click target is.
 *
 * The smallest node here is under three units across, and aiming at that is a
 * test of the mouse rather than of the reader. Kept well under the 64-unit link
 * distance so a hub's target never swallows the papers around it.
 */
const PICK_PADDING = 6

export interface RendererContext {
  nodes: RenderNode[]
  edges: RenderEdge[]
  view: ViewState
  palette: () => Palette
  onNodeClick: (id: string) => void
  onBackgroundClick: () => void
}

export interface Renderer {
  /** Re-read appearance for every node and edge. */
  repaint(): void
  /** Frame the whole corpus. */
  frameAll(durationMs?: number): void
  /** Move the camera or viewport to one paper. */
  flyTo(node: RenderNode): void
  resize(): void
  /** Repoint at a new background colour after a theme change. */
  retheme(): void
  destroy(): void
}

const endpointId = (end: string | RenderNode) => (typeof end === 'string' ? end : end.id)

function withAlpha(colour: string, alpha: number) {
  return `color-mix(in srgb, ${colour} ${Math.round(alpha * 100)}%, transparent)`
}

/** Shared force tuning, so a graph laid out in 2D and in 3D reads at the same scale. */
function tuneForces(view: { d3Force: (name: string) => any }) {
  view.d3Force('charge')?.strength(-260)
  view.d3Force('link')?.distance(64)
}

export async function createRenderer(
  mode: Mode,
  container: HTMLElement,
  context: RendererContext,
): Promise<Renderer> {
  return mode === '3d' ? createThree(container, context) : createCanvas(container, context)
}

// ---- 2D ------------------------------------------------------------------

async function createCanvas(container: HTMLElement, context: RendererContext): Promise<Renderer> {
  const { default: ForceGraph } = await import('force-graph')
  const { nodes, edges, view, palette } = context
  const byId = new Map(nodes.map((node) => [node.id, node]))

  const graph = new ForceGraph<RenderNode, RenderEdge>(container)
    .graphData({ nodes, links: edges })
    .nodeId('id')
    // force-graph places arrowheads against its own idea of where a node ends,
    // so its radius has to agree with the one we actually paint — otherwise
    // every arrow lands underneath the circle it points at. `r = √val * relSize`.
    .nodeRelSize(1)
    .nodeVal((node) => nodeRadius(node) ** 2)
    .backgroundColor('rgba(0,0,0,0)')
    .cooldownTicks(140)
    .nodeCanvasObject((node, ctx, scale) => {
      const look = nodeLook(node, node.state, view, palette())
      const radius = nodeRadius(node)

      ctx.beginPath()
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)
      ctx.fillStyle = withAlpha(look.colour, look.opacity)
      ctx.fill()

      if (node.id === view.selected) {
        ctx.lineWidth = 1.6 / scale
        ctx.strokeStyle = look.colour
        ctx.beginPath()
        ctx.arc(node.x!, node.y!, radius + 4 / scale, 0, 2 * Math.PI)
        ctx.stroke()
      }

      if (!look.labelled) return

      ctx.font = `${Math.max(10 / scale, 3.4)}px 'IBM Plex Sans Variable', system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = withAlpha(look.labelColour, look.labelOpacity)
      ctx.fillText(node.title, node.x!, node.y! + radius + 3 / scale)
    })
    .nodePointerAreaPaint((node, colour, ctx) => {
      ctx.fillStyle = colour
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, nodeRadius(node) + PICK_PADDING, 0, 2 * Math.PI)
      ctx.fill()
    })
    .linkColor((edge) => {
      const a = byId.get(endpointId(edge.source))
      const b = byId.get(endpointId(edge.target))
      if (!a || !b) return palette().rule
      const look = linkLook(
        a.state,
        b.state,
        view.isNear(a.id) && view.isNear(b.id),
        view,
        palette(),
      )
      return withAlpha(look.colour, look.opacity)
    })
    .linkWidth((edge) => edge.weight)
    .linkDirectionalArrowLength((edge) => arrowLength(edge, 5))
    .linkDirectionalArrowRelPos(1)
    .linkDirectionalArrowColor((edge) => {
      const a = byId.get(endpointId(edge.source))
      const b = byId.get(endpointId(edge.target))
      if (!a || !b) return palette().rule
      const look = linkLook(a.state, b.state, view.isNear(a.id) && view.isNear(b.id), view, palette())
      return withAlpha(look.colour, look.opacity)
    })
    .onNodeHover((node) => {
      container.style.cursor = node ? 'pointer' : 'default'
    })
    .onNodeClick((node) => context.onNodeClick(node.id))
    .onBackgroundClick(() => context.onBackgroundClick())

  tuneForces(graph)

  return {
    // Re-setting an accessor is what makes force-graph re-evaluate it.
    repaint: () => graph.nodeRelSize(1),
    frameAll: (durationMs = 700) => graph.zoomToFit(durationMs, 60),
    flyTo: (node) => graph.centerAt(node.x, node.y, 700).zoom(2.4, 700),
    resize: () => graph.width(container.clientWidth).height(container.clientHeight),
    retheme: () => graph.nodeRelSize(1),
    destroy: () => graph._destructor?.(),
  }
}

// ---- 3D ------------------------------------------------------------------

async function createThree(container: HTMLElement, context: RendererContext): Promise<Renderer> {
  const [{ default: ForceGraph3D }, three, { default: SpriteText }] = await Promise.all([
    import('3d-force-graph'),
    import('three'),
    import('three-spritetext'),
  ])
  const {
    AmbientLight,
    Color,
    DirectionalLight,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    SphereGeometry,
  } = three

  const { nodes, edges, view, palette } = context
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const meshes = new Map<string, InstanceType<typeof Mesh>>()
  const labels = new Map<string, InstanceType<typeof SpriteText>>()

  const graph = ForceGraph3D()(container)
    .graphData({ nodes, links: edges })
    .nodeId('id')
    // As in 2D, but a sphere: `r = ∛val * relSize`.
    .nodeRelSize(1)
    .nodeVal((node: RenderNode) => nodeRadius(node) ** 3)
    .backgroundColor(palette().ground)
    .showNavInfo(false)
    .enableNodeDrag(false)
    // Same as 2D. Without it the simulation runs for thousands of ticks and the
    // nodes are still drifting when you try to click one.
    .cooldownTicks(140)
    .nodeThreeObject((node: RenderNode) => {
      const radius = nodeRadius(node)
      const mesh = new Mesh(
        new SphereGeometry(radius, 20, 16),
        new MeshLambertMaterial({ transparent: true }),
      )

      // Labels hold a constant size on screen rather than scaling with depth.
      // Attenuated sprites make a paper near the camera unreadably large while
      // its neighbours shrink away, and this graph exists to be read.
      // Invisible, and bigger than the sphere: three.js raycasts transparent
      // geometry, so this is the click target while the visible mesh stays the
      // size the recency ramp wants it to be.
      const target = new Mesh(
        new SphereGeometry(radius + PICK_PADDING, 12, 10),
        new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      )

      const label = new SpriteText(node.title)
      label.textHeight = 0.014
      label.fontFace = 'IBM Plex Sans Variable, system-ui, sans-serif'
      label.position.y = -(radius + 3)
      label.material.depthWrite = false
      label.material.sizeAttenuation = false
      label.material.needsUpdate = true

      meshes.set(node.id, mesh)
      labels.set(node.id, label)
      paintNode(node)

      const group = new Group()
      group.add(mesh, target, label)
      return group
    })
    .linkColor((edge: RenderEdge) => {
      const a = byId.get(endpointId(edge.source))
      const b = byId.get(endpointId(edge.target))
      if (!a || !b) return palette().rule
      return linkLook(a.state, b.state, view.isNear(a.id) && view.isNear(b.id), view, palette())
        .colour
    })
    .linkOpacity(0.75)
    // A third of the weight, so a reasoned link lands back at the 0.55 that
    // read correctly here before the two edge kinds needed telling apart.
    .linkWidth((edge: RenderEdge) => edge.weight * 0.34)
    .linkDirectionalArrowLength((edge: RenderEdge) => arrowLength(edge, 3))
    .linkDirectionalArrowRelPos(1)
    .onNodeHover((node: RenderNode | null) => {
      container.style.cursor = node ? 'pointer' : 'default'
    })
    .onNodeClick((node: RenderNode) => context.onNodeClick(node.id))
    .onBackgroundClick(() => context.onBackgroundClick())

  // Flood the scene so sphere colour reads as itself. The default rig is lit for
  // shaded objects; here the colour is the measurement.
  const scene = graph.scene()
  scene.add(new AmbientLight(0xffffff, 2.6))
  const key = new DirectionalLight(0xffffff, 0.7)
  key.position.set(1, 1, 1)
  scene.add(key)

  tuneForces(graph)

  function paintNode(node: RenderNode) {
    const mesh = meshes.get(node.id)
    const label = labels.get(node.id)
    if (!mesh || !label) return

    const look = nodeLook(node, node.state, view, palette())
    const colour = new Color(look.colour)

    mesh.material.color = colour
    mesh.material.opacity = look.opacity
    // Emissive carries most of the colour, so what you see is close to the value
    // being encoded rather than that value multiplied by a light.
    mesh.material.emissive = colour.clone()
    mesh.material.emissiveIntensity = look.glow

    label.visible = look.labelled
    label.color = look.labelColour
    label.material.opacity = look.labelOpacity
  }

  /**
   * Frame the whole corpus, viewed from off-axis so the depth reads as depth.
   * `zoomToFit` alone leaves the graph small, so its fitted distance is taken
   * as a starting point and closed in on.
   */
  function frameAll(durationMs = 700) {
    graph.zoomToFit(0, 24)
    const fitted = graph.cameraPosition()
    const distance = Math.hypot(fitted.x, fitted.y, fitted.z) * 0.95
    graph.cameraPosition(
      { x: distance * 0.3, y: distance * 0.18, z: distance * 0.93 },
      { x: 0, y: 0, z: 0 },
      durationMs,
    )
  }

  return {
    repaint: () => {
      for (const node of nodes) paintNode(node)
      graph.linkColor(graph.linkColor())
    },
    frameAll,
    flyTo: (node) => {
      const target = { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 }
      const length = Math.hypot(target.x, target.y, target.z)
      const unit =
        length < 0.001
          ? { x: 0, y: 0, z: 1 }
          : { x: target.x / length, y: target.y / length, z: target.z / length }
      const distance = 165
      graph.cameraPosition(
        {
          x: target.x + unit.x * distance,
          y: target.y + unit.y * distance,
          z: target.z + unit.z * distance,
        },
        target,
        700,
      )
    },
    resize: () => graph.width(container.clientWidth).height(container.clientHeight),
    retheme: () => {
      graph.backgroundColor(palette().ground)
      for (const node of nodes) paintNode(node)
    },
    destroy: () => graph._destructor?.(),
  }
}
