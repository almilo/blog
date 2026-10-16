import { z } from 'astro/zod';

/**
 * Front matter of a series: one file per series in src/content/series/. The
 * filename is the slug, and the `series` field of a post names it.
 *
 * Imported by `src/content.config.ts` and by `scripts/validate-content.mjs`,
 * like the blog schema.
 */
export const seriesSchema = z
  .object({
    title: z.string().max(70, 'title must be 70 characters or fewer'),
    description: z.string().max(160, 'description must be 160 characters or fewer'),
    nav: z.boolean().default(false),
  })
  .strict();
