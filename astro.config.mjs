// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://almilo.com',
  integrations: [sitemap(), trimWhitespaceBeforeHeadings()],
});

/**
 * Removes the whitespace before every heading in the built HTML. Browsers
 * ignore it, but Medium's importer turns it into an empty paragraph above each
 * heading of an imported post.
 *
 * @returns {import('astro').AstroIntegration}
 */
function trimWhitespaceBeforeHeadings() {
  return {
    name: 'trim-whitespace-before-headings',
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
  await writeFile(file, html.replace(/>\s+(<h[1-6][\s>])/g, '>$1'));
}
