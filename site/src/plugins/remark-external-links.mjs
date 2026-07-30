/**
 * Links out of the vault open in a new tab.
 *
 * Following an arXiv link should not cost you the graph you were reading, so
 * anything with a scheme leaves in its own tab. Internal links are always
 * base-relative paths, so they are left alone and keep the reading panel's
 * click handling intact.
 */

import { visit } from 'unist-util-visit'

const EXTERNAL = /^https?:\/\//i

export function remarkExternalLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      if (!EXTERNAL.test(node.url)) return
      node.data = {
        ...node.data,
        hProperties: {
          ...node.data?.hProperties,
          target: '_blank',
          rel: 'noopener',
        },
      }
    })
  }
}
