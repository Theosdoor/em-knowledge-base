import { defineToolbarApp } from 'astro/toolbar'

const OBSIDIAN_VAULT = 'Vault'

const LABEL = {
  duplicate: 'Two notes, one paper',
  filename: 'Filename disagrees with the citation',
  'no-citation': 'No citation pasted',
}

/** Note names come off the filesystem, so they are escaped before going into markup. */
function escape(value) {
  return String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function obsidian(id) {
  return `obsidian://open?vault=${OBSIDIAN_VAULT}&file=${encodeURIComponent(`Papers/${id}`)}`
}

function row(title, body) {
  return `<div class="row"><p class="row-title">${title}</p><p class="row-body">${body}</p></div>`
}

function link(id) {
  return `<a href="${escape(obsidian(id))}">${escape(id)}</a>`
}

function render(canvas, state) {
  const window = canvas.querySelector('astro-dev-toolbar-window')
  if (!window) return

  if (state.error) {
    window.innerHTML = `<p class="lede">Could not read the vault.</p><pre>${escape(state.error)}</pre>`
    return
  }

  const parts = [`<p class="lede">${Number(state.count)} paper notes.</p>`]

  for (const issue of state.issues ?? []) {
    parts.push(
      row(
        escape(LABEL[issue.kind] ?? issue.kind),
        `${issue.ids.map(link).join(', ')} — ${escape(issue.detail)}`,
      ),
    )
  }

  for (const { from, to } of state.unresolved ?? []) {
    parts.push(row('Link to a paper with no note', `${link(from)} points at <code>${escape(to)}</code>`))
  }

  if (parts.length === 1) parts.push(row('Nothing to fix', 'Every note has a citation and a filename that matches it.'))

  window.innerHTML = parts.join('')
}

export default defineToolbarApp({
  init(canvas, app, server) {
    const shell = document.createElement('astro-dev-toolbar-window')
    shell.innerHTML = '<p class="lede">Reading the vault…</p>'
    canvas.append(shell)

    const style = document.createElement('style')
    style.textContent = `
      astro-dev-toolbar-window { font-size: 13px; max-height: 60vh; overflow-y: auto; }
      .lede { font-weight: 600; margin-bottom: 8px; }
      .row { padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.12); }
      .row-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.7; }
      .row-body { margin-top: 2px; }
      a { color: inherit; text-decoration: underline; }
    `
    canvas.append(style)

    server.on('vault-status:result', (state) => render(canvas, state))

    // Re-read every time the panel is opened, so it reflects the note you just
    // saved rather than the vault as it was when the server started.
    app.onToggled(({ state }) => {
      if (state) server.send('vault-status:request', {})
    })
  },
})
