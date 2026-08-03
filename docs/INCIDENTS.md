# Incidents

Read this before debugging anything odd — the same failures recur.

Severity: S1 wrong result · S2 wasted run/money · S3 blocked progress · S4 hygiene.

## Dev server

### `pnpm dev` exits immediately: a detached `astro dev` already holds 4321 — S3, 2026-08-03

**Symptom.** `pnpm dev` in `site/` returned straight to the prompt. In the user's
terminal it failed with `Another astro dev server is already running. PID 45010`
and exit 1; run from an agent shell the same condition printed a JSON
`Dev server already running…` line and exited **0**, so it looked like nothing
happened at all.

**How it was caught.** The user tried to start the dev server and it didn't work.
The agent had not noticed, because the exit code was 0 and the site *was*
reachable at localhost:4321 — served by the orphan, not by anything the agent
had knowingly left running.

**Root cause.** `astro dev` (v7) daemonises: launching it in the background
spawns a detached server that reparents to init (PPID 1) and keeps listening,
while the launching shell exits 0. An agent's background `pnpm dev` therefore
leaves a server behind with no obvious owner, and every later `pnpm dev` refuses
to start. `ps -o pid,ppid,lstart -p <pid>` tied the orphan's start time to the
agent's own background launch.

**Fix.** `pnpm exec astro dev stop` (or `pnpm dev --force` to replace it).
`pnpm exec astro dev status` reports pid and uptime; `astro dev logs` shows its
output.

**Lesson.** An exit code of 0 from a long-running server command means it
daemonised, not that it finished — check `astro dev status` / `lsof -iTCP:4321`
before concluding a server isn't running, and stop the daemon rather than
leaving it for the next person to trip over. A related tell: a stale daemon
serves `504 (Outdated Optimize Dep)` for Vite-optimised deps after dependencies
change, which is a symptom of an old server, not of a code change.

## Recurring patterns

- **Exit 0 is not proof a command did what was asked** — daemonising servers and
  no-op "already running" paths both return 0. Verify the state, not the code.
