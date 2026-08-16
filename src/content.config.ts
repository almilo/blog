import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { blogSchema } from './schemas/blog.mjs';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

export const collections = { blog };
