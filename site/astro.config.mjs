// @ts-check
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import tailwindcss from '@tailwindcss/vite'

import { vaultStatus } from './src/integrations/vault-status.mjs'
import { remarkObsidian } from './src/plugins/remark-obsidian.mjs'
import { remarkPaperHead } from './src/plugins/remark-paper-head.mjs'
import { syncVaultAssets } from './src/plugins/sync-vault-assets.mjs'

export const BASE = '/em-knowledge-base'

const PAPERS = fileURLToPath(new URL('../Vault/Papers', import.meta.url))

/**
 * Citekeys of every paper note, so the wikilink resolver can tell a paper link
 * from a project-note link.
 *
 * Read on demand rather than once at startup: adding a paper in Obsidian used to
 * need a dev-server restart before its links resolved, which is exactly the
 * moment you want the site to just update. The one-second cache keeps this off
 * the hot path when a rebuild renders every note at once.
 */
let cache = { at: -Infinity, ids: /** @type {string[]} */ ([]) }

function paperIds() {
  const now = performance.now()
  if (now - cache.at < 1000) return cache.ids

  const ids = readdirSync(PAPERS)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3))

  cache = { at: now, ids }
  return ids
}

export default defineConfig({
  site: 'https://theosdoor.github.io',
  base: BASE,
  trailingSlash: 'always',
  integrations: [syncVaultAssets(), vaultStatus()],
  markdown: {
    // Astro 7 defaults to Sätteri; the vault needs the unified pipeline so the
    // Obsidian dialect (wikilinks, embeds, callouts) can be handled in remark.
    processor: unified({
      // Paper-head first, so it sees `> [!callout]` markers before they become
      // asides and can tell a callout from a pasted citation.
      remarkPlugins: [remarkPaperHead, [remarkObsidian, { base: BASE, papers: paperIds }]],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
