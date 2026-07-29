/**
 * A dev-only panel saying what is wrong with the vault right now.
 *
 * The site never refuses a note, which is the right call for four people pushing
 * straight to `main` — but it means a duplicated paper or a filename that
 * disagrees with its citation can sit there unnoticed. This puts that list one
 * click away while you write, next to a link that opens the note in Obsidian.
 *
 * The same scan runs in CI as `pnpm check`, from the same function, so the panel
 * and the Actions summary can never disagree.
 */

import { scanVault } from '../../scripts/vault.mjs'

export function vaultStatus() {
  return {
    name: 'vault-status',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, command }) => {
        if (command !== 'dev') return
        addDevToolbarApp({
          id: 'vault-status',
          name: 'Vault',
          icon: 'file-search',
          entrypoint: new URL('./vault-status-app.js', import.meta.url),
        })
      },

      'astro:server:setup': ({ toolbar }) => {
        // Read on request rather than on a watcher: the panel is only ever open
        // for a second, and a stale answer would be worse than a slow one.
        toolbar.on('vault-status:request', () => {
          try {
            toolbar.send('vault-status:result', scanVault())
          } catch (error) {
            toolbar.send('vault-status:result', { error: String(error) })
          }
        })
      },
    },
  }
}
