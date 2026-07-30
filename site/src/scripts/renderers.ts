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
import { arrowHead, linkLook, nodeLook, nodeRadius, type MatchState, type Palette, type ViewState } from './appearance'

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
 * force-graph's own head is always solid, so it draws the reasoned links and
 * the open head for a citation is painted by hand. 2D measures arrows in graph
 * units against a flat canvas; 3D measures them in world units against a sphere
 * you can be inside. The same number is not the same size, so each renderer
 * passes its own.
 */
const arrowLength = (edge: RenderEdge, size: number) =>
  arrowHead(edge) === 'solid' ? size : 0

/**
 * 3D has no open head to offer: a `-->` is two strokes on a plane, and a plane
 * seen edge-on in a scene you can orbit is nothing at all. A citation keeps a
 * cone there, cut down far enough that the reasoned links still read as the
 * ones somebody argued for. Same claim as the open head in 2D, said the only
 * way this renderer can say it.
 */
const arrowLength3d = (edge: RenderEdge) => {
  const head = arrowHead(edge)
  return head === 'none' ? 0 : head === 'open' ? ARROW_3D * 0.55 : ARROW_3D
}

/** How wide the open head opens, as a half-angle off the link. */
const ARROW_SPREAD = Math.PI / 7

/** Head length in each renderer's own units. */
const ARROW_2D = 5
const ARROW_3D = 3

/**
 * How much wider than the drawn node its click target is.
 *
 * The smallest node here is under three units across, and aiming at that is a
 * test of the mouse rather than of the reader. Kept well under the 64-unit link
 * distance so a hub's target never swallows the papers around it.
 */
const PICK_PADDING = 6

/**
 * What `PICK_PADDING` is for the shadow canvas, in screen pixels.
 *
 * 2D picks nodes itself (see `nodeAt`), measuring against the circle as drawn,
 * so its allowance has to be a size on screen: in graph units it would shrink
 * away as you zoomed out, which is exactly where a node is hardest to hit.
 */
const PICK_SLOP = 8

/** How far a press may travel and still read as a click rather than a drag. */
const CLICK_SLOP = 5

/** One typeface for both renderers, so a paper's name reads the same in either. */
const LABEL_FONT = 'IBM Plex Sans Variable, system-ui, sans-serif'

export interface RendererContext {
  nodes: RenderNode[]
  edges: RenderEdge[]
  view: ViewState
  palette: () => Palette
  onNodeClick: (id: string) => void
  onBackgroundClick: () => void
  /** The paper under the pointer, or null when the pointer is over open ground. */
  onNodeHover: (id: string | null) => void
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

/**
 * Label geometry, in screen pixels rather than graph units.
 *
 * A name is for reading, so it holds its size while the graph scales under it.
 * That is also what makes zooming worth doing: labels stay the same size as the
 * distance between nodes grows, so more of them clear the overlap test and the
 * corpus names itself gradually as you go in.
 */
const LABEL = {
  size: 11,
  /** The citekey line under a title, quieter than it. */
  smallSize: 9.5,
  lineHeight: 13,
  padX: 4,
  padY: 2,
  /** Clear of the circle being named. */
  offset: 4,
  /** Held between two labels, so a near miss still reads as two names. */
  gutter: 3,
  /** A title wraps at this width rather than running across the plot. */
  wrapWidth: 190,
  /** Lines a wrapped title may take before it is cut short. */
  maxLines: 2,
} as const

/** A placed label's screen-space box, kept so the next label can avoid it. */
interface LabelBox {
  left: number
  right: number
  top: number
  bottom: number
}

const overlaps = (a: LabelBox, b: LabelBox) =>
  a.left < b.right + LABEL.gutter &&
  a.right > b.left - LABEL.gutter &&
  a.top < b.bottom + LABEL.gutter &&
  a.bottom > b.top - LABEL.gutter

/** Break a title onto at most `limit` lines, cutting the last one short if it runs on. */
function wrapLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  limit: number,
): string[] {
  const lines: string[] = []

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = lines.at(-1)
    if (last === undefined) {
      lines.push(word)
    } else if (ctx.measureText(`${last} ${word}`).width <= maxWidth) {
      lines[lines.length - 1] = `${last} ${word}`
    } else if (lines.length < limit) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${last}…`
      break
    }
  }

  return lines
}

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
    // Labels are not drawn here: they are drawn once per frame in
    // `paintLabels`, after every node and link, so that one can be dropped when
    // it would land on another and none of them end up under an edge.
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
    })
    // Still needed even though clicks and hovers are picked in `nodeAt`: this is
    // the target force-graph's own drag interaction reads, so it is what lets a
    // node be dragged out of a cluster.
    .nodePointerAreaPaint((node, colour, ctx) => {
      ctx.fillStyle = colour
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, nodeRadius(node) + PICK_PADDING, 0, 2 * Math.PI)
      ctx.fill()
    })
    .linkColor(linkColour)
    .linkWidth((edge) => edge.weight)
    .linkDirectionalArrowLength((edge) => arrowLength(edge, ARROW_2D))
    .linkDirectionalArrowRelPos(1)
    .linkDirectionalArrowColor(linkColour)
    // Drawn after the line and before the nodes, so an open head sits where the
    // solid one would and still passes under the circle it points at.
    .linkCanvasObjectMode((edge) => (arrowHead(edge) === 'open' ? 'after' : undefined))
    .linkCanvasObject(paintOpenArrow)
    .onRenderFramePost((ctx, scale) => paintLabels(ctx, scale))

  tuneForces(graph)

  function linkColour(edge: RenderEdge) {
    const a = byId.get(endpointId(edge.source))
    const b = byId.get(endpointId(edge.target))
    if (!a || !b) return palette().rule
    const look = linkLook(a.state, b.state, view.isNear(a.id) && view.isNear(b.id), view, palette())
    return withAlpha(look.colour, look.opacity)
  }

  /** The two strokes of a `-->`, meeting where a solid head would have its point. */
  function paintOpenArrow(edge: RenderEdge, ctx: CanvasRenderingContext2D) {
    const from = edge.source as RenderNode
    const to = edge.target as RenderNode
    if (from.x === undefined || to.x === undefined) return

    const angle = Math.atan2(to.y! - from.y!, to.x! - from.x!)
    const tipX = to.x! - Math.cos(angle) * nodeRadius(to)
    const tipY = to.y! - Math.sin(angle) * nodeRadius(to)

    ctx.save()
    ctx.strokeStyle = linkColour(edge)
    // The head is the line's own stroke turned through the spread, nothing
    // heavier: a citation should not gain weight at the end it points to.
    ctx.lineWidth = edge.weight
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (const side of [-1, 1]) {
      ctx.moveTo(tipX, tipY)
      ctx.lineTo(
        tipX - Math.cos(angle - side * ARROW_SPREAD) * ARROW_2D,
        tipY - Math.sin(angle - side * ARROW_SPREAD) * ARROW_2D,
      )
    }
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Every label the frame can fit, drawn over the finished graph.
   *
   * Ordered by rank and culled on collision: each label claims its box and any
   * later one with nowhere free to go undrawn. The circles are claimed up front
   * too, because a name that sits over the paper next door is the other half of
   * being hard to read. The paper in focus outranks everything and is drawn
   * whether or not it has room, since it is the name being read right now.
   */
  function paintLabels(ctx: CanvasRenderingContext2D, scale: number) {
    const width = container.clientWidth
    const height = container.clientHeight
    const ground = palette().ground

    ctx.save()
    // Screen pixels from here on. force-graph leaves the canvas transformed into
    // graph units, and a label that scaled with the graph is the thing being fixed.
    const density = window.devicePixelRatio || 1
    ctx.setTransform(density, 0, 0, density, 0, 0)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const claimed: LabelBox[] = nodes
      .filter((node) => node.x !== undefined && node.y !== undefined)
      .map((node) => {
        const at = graph.graph2ScreenCoords(node.x!, node.y!)
        const radius = nodeRadius(node) * scale
        return {
          left: at.x - radius,
          right: at.x + radius,
          top: at.y - radius,
          bottom: at.y + radius,
        }
      })

    const ranked = nodes
      .map((node) => ({ node, look: nodeLook(node, node.state, view, palette()) }))
      .filter(({ node, look }) => look.labelled && node.x !== undefined && node.y !== undefined)
      .sort((a, b) => b.look.labelRank - a.look.labelRank)

    for (const { node, look } of ranked) {
      const at = graph.graph2ScreenCoords(node.x!, node.y!)
      // Off-screen names cost measuring time and claim boxes nobody can see.
      if (at.x < -LABEL.wrapWidth || at.x > width + LABEL.wrapWidth) continue
      if (at.y < -LABEL.lineHeight * 4 || at.y > height + LABEL.lineHeight * 4) continue

      ctx.font = `${LABEL.size}px ${LABEL_FONT}`
      const lines = wrapLabel(ctx, look.label, LABEL.wrapWidth, LABEL.maxLines)
      if (!lines.length) continue // a note whose title is nothing but spaces

      let textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width))

      if (look.sublabel) {
        ctx.font = `${LABEL.smallSize}px ${LABEL_FONT}`
        textWidth = Math.max(textWidth, ctx.measureText(look.sublabel).width)
      }

      const rows = lines.length + (look.sublabel ? 1 : 0)
      const boxWidth = textWidth + LABEL.padX * 2
      const boxHeight = rows * LABEL.lineHeight + LABEL.padY * 2
      const left = at.x - boxWidth / 2
      const clear = at.y + nodeRadius(node) * scale + LABEL.offset
      const from = (top: number) => ({ left, right: left + boxWidth, top, bottom: top + boxHeight })

      // Under the circle by preference, over it when that side is taken.
      const below = from(clear)
      const above = from(at.y - (clear - at.y) - boxHeight)
      const room = [below, above].find(
        (candidate) => !claimed.some((other) => overlaps(candidate, other)),
      )
      if (!room && node.id !== view.focus) continue

      const box = room ?? below
      claimed.push(box)

      // A plate in the ground colour, so the edges a name crosses do not read
      // as strokes through it.
      ctx.fillStyle = withAlpha(ground, 0.74)
      ctx.beginPath()
      ctx.roundRect(box.left, box.top, boxWidth, box.bottom - box.top, 3)
      ctx.fill()

      ctx.font = `${LABEL.size}px ${LABEL_FONT}`
      ctx.fillStyle = withAlpha(look.labelColour, look.labelOpacity)
      lines.forEach((line, row) => {
        ctx.fillText(line, at.x, box.top + LABEL.padY + row * LABEL.lineHeight)
      })

      if (look.sublabel) {
        ctx.font = `${LABEL.smallSize}px ${LABEL_FONT}`
        ctx.fillStyle = withAlpha(palette().rest, look.labelOpacity)
        ctx.fillText(look.sublabel, at.x, box.top + LABEL.padY + lines.length * LABEL.lineHeight)
      }
    }

    ctx.restore()
  }

  /**
   * The paper under a screen position, or null for open ground.
   *
   * force-graph can answer this itself, but it also counts a single pixel of
   * travel between press and release as a pan and swallows the click that
   * follows — which is most clicks made on a trackpad. Picking here, and
   * deciding what a click is below, is what makes clicking a paper work at all.
   */
  function nodeAt(clientX: number, clientY: number): RenderNode | null {
    const bounds = container.getBoundingClientRect()
    const x = clientX - bounds.left
    const y = clientY - bounds.top
    const scale = graph.zoom()

    let closest: RenderNode | null = null
    let nearest = Infinity

    for (const node of nodes) {
      if (node.x === undefined || node.y === undefined) continue
      const at = graph.graph2ScreenCoords(node.x, node.y)
      const gap = Math.hypot(at.x - x, at.y - y)
      if (gap <= nodeRadius(node) * scale + PICK_SLOP && gap < nearest) {
        closest = node
        nearest = gap
      }
    }

    return closest
  }

  const pointer = new AbortController()
  const listen = { signal: pointer.signal }
  let pressedAt: { x: number; y: number } | null = null

  container.addEventListener(
    'pointermove',
    (event) => {
      const node = nodeAt(event.clientX, event.clientY)
      container.style.cursor = node ? 'pointer' : 'default'
      context.onNodeHover(node?.id ?? null)
    },
    listen,
  )

  container.addEventListener('pointerleave', () => context.onNodeHover(null), listen)

  container.addEventListener(
    'pointerdown',
    (event) => {
      pressedAt = { x: event.clientX, y: event.clientY }
    },
    listen,
  )

  container.addEventListener(
    'pointerup',
    (event) => {
      const from = pressedAt
      pressedAt = null
      if (!from || event.button !== 0) return
      // Anything that travelled further was a pan or a node being dragged.
      if (Math.hypot(event.clientX - from.x, event.clientY - from.y) > CLICK_SLOP) return

      const node = nodeAt(event.clientX, event.clientY)
      if (node) context.onNodeClick(node.id)
      else context.onBackgroundClick()
    },
    listen,
  )

  return {
    // Re-setting an accessor is what makes force-graph re-evaluate it.
    repaint: () => graph.nodeRelSize(1),
    frameAll: (durationMs = 700) => graph.zoomToFit(durationMs, 60),
    flyTo: (node) => graph.centerAt(node.x, node.y, 700).zoom(2.4, 700),
    resize: () => graph.width(container.clientWidth).height(container.clientHeight),
    retheme: () => graph.nodeRelSize(1),
    destroy: () => {
      pointer.abort()
      graph._destructor?.()
    },
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

      const label = new SpriteText(nodeLook(node, node.state, view, palette()).label)
      label.textHeight = 0.014
      label.fontFace = LABEL_FONT
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
    .linkDirectionalArrowLength(arrowLength3d)
    .linkDirectionalArrowRelPos(1)
    .onNodeHover((node: RenderNode | null) => {
      container.style.cursor = node ? 'pointer' : 'default'
      context.onNodeHover(node?.id ?? null)
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
    // Guarded: assigning text redraws the sprite's texture, and this runs for
    // every node on every repaint.
    if (label.text !== look.label) label.text = look.label
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
