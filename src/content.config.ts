import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { blogSchema } from './schemas/blog.mjs';
import { seriesSchema } from './schemas/series.mjs';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

const series = defineCollection({
  loader: glob({ base: './src/content/series', pattern: '*.md' }),
  schema: seriesSchema,
});

export const collections = { blog, series };
