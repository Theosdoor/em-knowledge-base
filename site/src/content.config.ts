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
 */
const paperSchema = z.object({
  title: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
  year: z.coerce.number().optional().catch(undefined),
  // `YYYY-MM`. Optional: derived from the arXiv id when absent.
  date: z.coerce.string().optional(),
  venue: z.string().optional(),
  url: z.string().optional(),
  arxiv: z.coerce.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  'reviewed-by': z.array(z.string()).default([]),
  added: z.coerce.string().optional(),
})

const noteSchema = z.object({
  title: z.string().optional(),
  tags: z.array(z.string()).default([]),
  added: z.coerce.string().optional(),
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
