// @ts-check
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import tailwindcss from '@tailwindcss/vite'

import { remarkObsidian } from './src/plugins/remark-obsidian.mjs'
import { syncVaultAssets } from './src/plugins/sync-vault-assets.mjs'

export const BASE = '/em-knowledge-base'

/**
 * Citekeys of every paper note, read once at config load so the wikilink
 * resolver can tell a paper link from a project-note link. Adding a paper
 * while the dev server runs needs a restart; production builds always read
 * the directory fresh.
 */
const papers = readdirSync(fileURLToPath(new URL('../Vault/Papers', import.meta.url)))
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.slice(0, -3))

export default defineConfig({
  site: 'https://theosdoor.github.io',
  base: BASE,
  trailingSlash: 'always',
  integrations: [syncVaultAssets()],
  markdown: {
    // Astro 7 defaults to Sätteri; the vault needs the unified pipeline so the
    // Obsidian dialect (wikilinks, embeds, callouts) can be handled in remark.
    processor: unified({
      remarkPlugins: [[remarkObsidian, { base: BASE, papers }]],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
