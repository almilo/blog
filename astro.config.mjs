// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://almilo.com',
  integrations: [sitemap(), trimWhitespaceAroundHeadings()],
});

/**
 * Removes the whitespace before and after every heading in the built HTML.
 * Browsers ignore it, but Medium's importer turns it into an empty paragraph
 * next to each heading of an imported post.
 *
 * @returns {import('astro').AstroIntegration}
 */
function trimWhitespaceAroundHeadings() {
  return {
    name: 'trim-whitespace-around-headings',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir);
        const entries = await readdir(root, { recursive: true });
        const pages = entries.filter((entry) => entry.endsWith('.html'));
        await Promise.all(pages.map((page) => trimFile(join(root, page))));
      },
    },
  };
}

/** @param {string} file */
async function trimFile(file) {
  const html = await readFile(file, 'utf8');
  const trimmed = html
    .replace(/>\s+(<h[1-6][\s>])/g, '>$1')
    .replace(/(<\/h[1-6]>)\s+</g, '$1<');
  await writeFile(file, trimmed);
}
