/**
 * Remark plugin for the Obsidian markdown dialect used in `Vault/`.
 *
 * Handles three constructs that standard markdown does not:
 *
 *   ![[image.png]]            embed  -> <img> served from /assets/
 *   [[citekey|Label]]         wikilink -> <a> to the paper or note page
 *   > [!todo] Title           callout -> <aside class="callout callout-todo">
 *
 * Link targets are resolved against the list of known paper citekeys passed in
 * `options.papers`. A target that is not a citekey is treated as a note title
 * and slugified. A target that resolves to nothing still renders as a link but
 * carries `data-unresolved`, so broken links are visible rather than silent.
 */

import { findAndReplace } from 'mdast-util-find-and-replace'
import { visit } from 'unist-util-visit'

const EMBED = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g
const WIKILINK = /\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g
const CALLOUT = /^\[!(\w+)\]\s*(.*)$/

/** Obsidian's own slug rules: lowercase, spaces to hyphens, drop the rest. */
export function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function remarkObsidian(options = {}) {
  const base = options.base ?? ''
  const papers = new Set(options.papers ?? [])

  const resolve = (target) => {
    // Strip any heading or block anchor; we link to the page, not into it.
    const name = target.split('#')[0].split('^')[0].trim()
    if (papers.has(name)) return { href: `${base}/papers/${name}/`, resolved: true }
    const slug = slugify(name)
    if (!slug) return { href: null, resolved: false }
    return { href: `${base}/notes/${slug}/`, resolved: false }
  }

  return (tree) => {
    // Embeds first, so ![[x]] is never mistaken for a link to "!x".
    findAndReplace(tree, [
      [
        EMBED,
        (_match, target, alt) => ({
          type: 'image',
          url: `${base}/assets/${encodeURIComponent(target.trim())}`,
          alt: (alt ?? target).trim(),
        }),
      ],
    ])

    findAndReplace(tree, [
      [
        WIKILINK,
        (_match, target, label) => {
          const { href, resolved } = resolve(target)
          const text = (label ?? target).trim()
          if (!href) return { type: 'text', value: text }
          return {
            type: 'link',
            url: href,
            data: {
              hProperties: {
                className: 'wikilink',
                ...(resolved ? { 'data-paper': target.trim() } : { 'data-unresolved': 'true' }),
              },
            },
            children: [{ type: 'text', value: text }],
          }
        },
      ],
    ])

    visit(tree, 'blockquote', (node) => {
      const first = node.children[0]
      if (first?.type !== 'paragraph') return
      const lead = first.children[0]
      if (lead?.type !== 'text') return

      const [line, ...rest] = lead.value.split('\n')
      const match = line.match(CALLOUT)
      if (!match) return

      const [, rawKind, title] = match
      const kind = rawKind.toLowerCase()

      // Put whatever followed the marker back where it came from.
      lead.value = rest.join('\n')
      if (!lead.value) first.children.shift()
      if (!first.children.length) node.children.shift()

      node.data = {
        hName: 'aside',
        hProperties: { className: `callout callout-${kind}` },
      }
      node.children.unshift({
        type: 'paragraph',
        data: { hProperties: { className: 'callout-title' } },
        children: [{ type: 'text', value: title || titleCase(kind) }],
      })
    })
  }
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
