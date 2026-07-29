/**
 * The head of a paper note: a pasted citation, then a pasted link.
 *
 * Both are metadata that the page renders for itself — the citation as a styled
 * block, the link as `abs ↗ · pdf ↗` in the header — so the raw URL line is
 * taken out of the body rather than left sitting there twice.
 *
 * Nothing here needs to know which collection a file came from. The shape it
 * looks for, a citation blockquote followed by a bare URL above the first
 * `## Section`, is the shape only a paper note has.
 */

const BARE_URL = /^<?https?:\/\/\S+?>?$/
const CALLOUT = /^\[!\w+\]/

function isCallout(node) {
  const first = node.children?.[0]
  const lead = first?.type === 'paragraph' ? first.children?.[0] : null
  return lead?.type === 'text' && CALLOUT.test(lead.value.trimStart())
}

/** A paragraph holding nothing but a link, however the markdown wrote it. */
function isBareUrl(node) {
  if (node.type !== 'paragraph' || node.children.length !== 1) return false
  const [child] = node.children
  if (child.type === 'link') return child.children.length <= 1
  return child.type === 'text' && BARE_URL.test(child.value.trim())
}

export function remarkPaperHead() {
  return (tree) => {
    const heading = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 2)
    const head = heading === -1 ? tree.children : tree.children.slice(0, heading)

    let citation = null
    const links = []

    for (const node of head) {
      if (!citation) {
        if (node.type === 'blockquote' && !isCallout(node)) citation = node
        continue
      }
      if (isBareUrl(node)) links.push(node)
    }

    if (!citation) return

    citation.data = {
      ...citation.data,
      hProperties: { ...citation.data?.hProperties, className: 'citation' },
    }

    if (links.length) tree.children = tree.children.filter((node) => !links.includes(node))
  }
}
