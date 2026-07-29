/**
 * What a node or edge should look like right now.
 *
 * Both renderers ask these functions rather than deciding for themselves, so
 * switching between 2D and 3D changes how the graph is drawn and never what it
 * means. Pure, so it is testable without a canvas or a WebGL context.
 */

import { rocket, type GraphNode } from '../lib/graph-model'

export type MatchState = 'rest' | 'name' | 'tag' | 'miss'

export interface Palette {
  name: string
  tag: string
  rest: string
  body: string
  bright: string
  rule: string
  ground: string
  /** The plot ground is white, so the ramp's pale end is the unusable one. */
  lightGround: boolean
}

export interface ViewState {
  query: string
  selected: string | null
  heat: boolean
  /** 0–1 position of a paper on the recency ramp. */
  recency: (node: GraphNode) => number
  /** Whether a node is the selected one or one of its neighbours. */
  isNear: (id: string) => boolean
}

export interface NodeLook {
  colour: string
  opacity: number
  labelled: boolean
  labelColour: string
  labelOpacity: number
  /** 0–1. Selection glows rather than recolouring, so it never takes the colour channel. */
  glow: number
}

export function classify(node: GraphNode, query: string): MatchState {
  if (!query) return 'rest'
  if (node.nameText.includes(query)) return 'name'
  if (node.tagText.includes(query)) return 'tag'
  return 'miss'
}

export function summarise(states: MatchState[]): string {
  if (!states.length || states.every((state) => state === 'rest')) return ''
  const count = (want: MatchState) => states.filter((state) => state === want).length
  return `${count('name')} name · ${count('tag')} tag · ${count('miss')} dim`
}

export function nodeLook(
  node: GraphNode,
  state: MatchState,
  view: ViewState,
  palette: Palette,
): NodeLook {
  const dimmed = state === 'miss' || (Boolean(view.selected) && !view.isNear(node.id) && !view.query)

  // At rest the graph reads as a timeline; under a query it reads as an answer.
  // Only one of those colour systems is ever on screen at once.
  const atRest =
    view.heat && !view.query ? rocket(view.recency(node), palette.lightGround) : palette.rest

  const colour = state === 'name' ? palette.name : state === 'tag' ? palette.tag : atRest

  return {
    colour,
    opacity: state === 'miss' ? 0.18 : dimmed ? 0.4 : 1,
    labelled: state !== 'miss' && (!view.selected || !view.query ? true : state !== 'rest'),
    // Labels take the text colour at rest: at the dark end of the ramp a label
    // matching its node would be unreadable against the ground.
    labelColour: state === 'rest' ? palette.body : colour,
    labelOpacity: dimmed ? 0.4 : 1,
    glow: node.id === view.selected ? 0.95 : 0.62,
  }
}

export function linkLook(
  a: MatchState,
  b: MatchState,
  bothNear: boolean,
  view: ViewState,
  palette: Palette,
): { colour: string; opacity: number } {
  if (view.query) {
    const faded = a === 'miss' || b === 'miss'
    return { colour: faded ? palette.rule : palette.bright, opacity: faded ? 0.25 : 0.8 }
  }
  if (view.selected) {
    return bothNear
      ? { colour: palette.bright, opacity: 0.8 }
      : { colour: palette.rule, opacity: 0.4 }
  }
  return { colour: palette.rest, opacity: 0.75 }
}

/** Bigger for a better-connected paper, on a square root so hubs do not swamp the view. */
export function nodeRadius(node: GraphNode): number {
  return 2.6 + Math.sqrt(node.degree) * 1.5
}
