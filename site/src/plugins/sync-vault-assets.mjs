/**
 * Copies `Vault/Assets/` into the build output so Obsidian image embeds resolve.
 *
 * The vault stays the single source of truth for images; nothing is duplicated
 * in the repository. Runs on dev server start and before each build.
 */

import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SOURCE = new URL('../../../Vault/Assets/', import.meta.url)

async function copyInto(destDir) {
  if (!existsSync(fileURLToPath(SOURCE))) return
  const dest = new URL('assets/', destDir)
  await mkdir(fileURLToPath(dest), { recursive: true })
  await cp(fileURLToPath(SOURCE), fileURLToPath(dest), { recursive: true })
}

export function syncVaultAssets() {
  return {
    name: 'sync-vault-assets',
    hooks: {
      'astro:config:setup': async ({ config }) => {
        await copyInto(config.publicDir)
      },
      'astro:build:done': async ({ dir }) => {
        await copyInto(dir)
      },
    },
  }
}
