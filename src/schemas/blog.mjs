import { z } from 'astro/zod';

/**
 * Single source of truth for blog post front matter.
 *
 * Imported by `src/content.config.ts` (so `astro build` type-checks and
 * validates every post) and by `scripts/validate-content.mjs` (so CI can fail
 * fast with a readable report before the build runs).
 */
export const blogSchema = z
  .object({
    title: z.string().max(70, 'title must be 70 characters or fewer'),
    description: z.string().max(160, 'description must be 160 characters or fewer'),
    pubDate: z.coerce.date({ error: 'pubDate must be a valid date, e.g. 2026-08-16' }),
    updatedDate: z.coerce
      .date({ error: 'updatedDate must be a valid date, e.g. 2026-08-16' })
      .optional(),
    tags: z.array(z.string()),
    draft: z.boolean().default(true),
    canonical: z.string().url('canonical must be an absolute URL').optional(),
    series: z.string().optional(),
    image: z
      .string()
      .startsWith('/', 'image must be a path under public/, e.g. /images/my-post/cover.png')
      .optional(),
    linkedin: z.string().url('linkedin must be an absolute URL').optional(),
    medium: z.string().url('medium must be an absolute URL').optional(),
  })
  .strict();
