import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Every field is optional on purpose.
 *
 * Four people write these notes in Obsidian and push straight to `main`. A
 * half-finished stub must render with gaps rather than fail the build, so the
 * schema coerces and defaults instead of rejecting. Nothing a note author can
 * type should be able to break the deploy.
 *
 * That includes the shapes an unfinished template makes. `title:` with nothing
 * after it is YAML `null`, not an empty string, and a `tags:` list with one
 * blank bullet is `[null]` — both arrive here the moment somebody copies the
 * template and starts filling it in from the top.
 */
const blank = (value: unknown) => value === null || value === undefined || value === ''

const text = () => z.preprocess((value) => (blank(value) ? undefined : value), z.coerce.string().optional())

const number = () =>
  z.preprocess((value) => (blank(value) ? undefined : value), z.coerce.number().optional().catch(undefined))

const list = () =>
  z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter((item) => !blank(item)).map(String)
        : blank(value)
          ? []
          : value,
    z.array(z.string()).default([]),
  )

/**
 * Only what cannot be worked out from the note itself.
 *
 * Authors, year, venue, the arXiv id and both links are read out of the pasted
 * citation instead — see `lib/citation.ts`. The fields below stay because a
 * field here always wins over a parsed one, which is how a hand-corrected note
 * stays hand-corrected.
 */
const paperSchema = z.object({
  title: text(),
  aliases: list(),
  authors: list(),
  year: number(),
  // `YYYY-MM`. Optional: derived from the arXiv id when absent.
  date: text(),
  venue: text(),
  url: text(),
  arxiv: text(),
  category: text(),
  tags: list(),
  'reviewed-by': list(),
  added: text(),
})

const noteSchema = z.object({
  title: text(),
  tags: list(),
  added: text(),
})

const papers = defineCollection({
  // The default id generator lowercases, which would break `[[zhaoPiggyback2026]]`.
  // The citekey is the identity of a paper everywhere: filename, node id, URL.
  loader: glob({
    pattern: '**/*.md',
    base: '../Vault/Papers',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: paperSchema,
})

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../Vault/Project' }),
  schema: noteSchema,
})

const meta = defineCollection({
  loader: glob({ pattern: '*.md', base: '../Vault/Meta' }),
  schema: noteSchema,
})

const root = defineCollection({
  loader: glob({ pattern: 'index.md', base: '../Vault' }),
  schema: noteSchema,
})

export const collections = { papers, notes, meta, root }
