#!/usr/bin/env node
/**
 * Turns a post into what the Medium editor needs: `pnpm medium <slug>` writes
 * .media/<slug>/medium/ with
 *   body.html      the article body, from the series line to the last section, as HTML the editor
 *                  accepts on paste: headings, paragraphs, lists, quotes, code, links. Each image and
 *                  table is a placeholder paragraph ([[IMAGE 1]], [[TABLE 1]]) to replace with an upload
 *   footer.html    the AI disclaimer, a separator and the "Originally published" line, for a story that
 *                  is not imported (an imported story gets them from Medium)
 *   images/        the images to upload: figures copied from public/, tables rendered as PNG
 *   manifest.json  title, series line, description, canonical URL, the uploads with their
 *                  alternative text, the footer, and the block sequence to expect in the editor
 *   preview.html   body.html in a page, to look at before pasting
 *
 * Medium's own import drops lists that start with bold text, code blocks, tables and alternative
 * text, so the body is pasted instead (see .claude/skills/publish-to-medium).
 */
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const SITE = 'https://almilo.com';
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const slug = process.argv[2];
if (!slug) throw new Error('Usage: pnpm medium <slug>');
const [, yaml, markdown] = (await readFile(`${ROOT}/src/content/blog/${slug}.md`, 'utf8')).match(FRONT_MATTER);
const meta = parseYaml(yaml);
const out = `${ROOT}/.media/${slug}/medium`;
await rm(out, { recursive: true, force: true });
await mkdir(`${out}/images`, { recursive: true });

const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
const uploads = [];
const sequence = [];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Text as the site shows it: soft line breaks as spaces, and curly quotes (Astro's smartypants).
const smart = (s) =>
  s.replace(/\n/g, ' ').replace(/(^|[\s(\[])"/g, '$1\u201c').replace(/"/g, '\u201d').replace(/(^|[\s(\[])'/g, '$1\u2018').replace(/'/g, '\u2019');
const text = (n) => (n.type === 'inlineCode' || n.type === 'code' ? n.value : smart(n.value ?? '')) + (n.children ?? []).map(text).join('');

function inline(n) {
  switch (n.type) {
    case 'text': return esc(smart(n.value));
    case 'strong': return `<strong>${n.children.map(inline).join('')}</strong>`;
    case 'emphasis': return `<em>${n.children.map(inline).join('')}</em>`;
    case 'inlineCode': return `<code>${esc(n.value)}</code>`;
    case 'link': return `<a href="${esc(absolute(n.url))}">${n.children.map(inline).join('')}</a>`;
    case 'break': return '<br>';
    default: return n.children ? n.children.map(inline).join('') : esc(n.value ?? '');
  }
}

const absolute = (url) => (url.startsWith('/') ? SITE + url : url);

async function block(n) {
  switch (n.type) {
    case 'heading':
      sequence.push(n.depth <= 2 ? 'H3' : 'H4');
      return n.depth <= 2 ? `<h3>${n.children.map(inline).join('')}</h3>` : `<h4>${n.children.map(inline).join('')}</h4>`;
    case 'paragraph': {
      const only = n.children.length === 1 ? n.children[0] : null;
      if (only?.type === 'image') return image(only);
      sequence.push('P');
      return `<p>${n.children.map(inline).join('')}</p>`;
    }
    case 'list': {
      const tag = n.ordered ? 'ol' : 'ul';
      const items = n.children.map((li) => {
        sequence.push('LI');
        return `<li>${li.children.map((c) => (c.type === 'paragraph' ? c.children.map(inline).join('') : inline(c))).join(' ')}</li>`;
      });
      return `<${tag}>${items.join('')}</${tag}>`;
    }
    case 'blockquote':
      sequence.push('QUOTE');
      return `<blockquote>${n.children.map((c) => c.children?.map(inline).join('') ?? '').join('<br>')}</blockquote>`;
    case 'code':
      sequence.push('PRE');
      return `<pre>${esc(n.value)}</pre>`;
    case 'table': return table(n);
    case 'thematicBreak':
      sequence.push('HR');
      return '<hr>';
    default: return '';
  }
}

async function image(n) {
  const file = n.url.split('/').pop();
  await copyFile(`${ROOT}/public${n.url}`, `${out}/images/${file}`);
  return placeholder('IMAGE', file, n.alt ?? '');
}

function placeholder(kind, file, alt) {
  const id = `[[${kind} ${uploads.filter((u) => u.kind === kind).length + 1}]]`;
  uploads.push({ kind, placeholder: id, file: `images/${file}`, alt });
  sequence.push('FIG');
  return `<p>${id}</p>`;
}

// A table as a PNG in the style of the series: a blue header band, rows separated by thin lines,
// the first column bold. Column widths follow the length of the longest cell, but a column is never
// narrower than its header or its longest word, which cannot wrap.
async function table(n) {
  const rows = n.children.map((row) => row.children.map((cell) => text(cell).trim()));
  const [header, ...body] = rows;
  const longest = header.map((_, c) => Math.max(...rows.map((r) => (r[c] ?? '').length)));
  const total = 940;
  const weights = longest.map((l) => Math.min(Math.max(l, 6), 60));
  const proportional = weights.map((w) => (w / weights.reduce((a, b) => a + b, 0)) * total);
  const minimum = header.map((h, c) =>
    Math.ceil(Math.max(h.length * 11, ...body.map((r) => Math.max(...(r[c] ?? '').split(/\s+/).map((w) => w.length)) * 10.4)) + 32),
  );
  const fixed = proportional.map((w, c) => Math.max(w, minimum[c]));
  const extra = fixed.reduce((a, b) => a + b, 0) - total; // taken from the columns above their minimum
  const room = fixed.reduce((a, w, c) => a + (w - minimum[c]), 0);
  const widths = fixed.map((w, c) => Math.round(w - (extra > 0 && room > 0 ? ((w - minimum[c]) / room) * extra : 0)));
  const svg = tableSvg(header, body, widths);
  const index = uploads.filter((u) => u.kind === 'TABLE').length + 1;
  const name = `table-${index}`;
  await writeFile(`${out}/images/${name}.svg`, svg);
  execFileSync('rsvg-convert', ['-z', '2', `${out}/images/${name}.svg`, '-o', `${out}/images/${name}.png`]);
  const alt = `Table. ${body.map((r) => r.map((c, i) => (i === 0 ? c : `${header[i]}: ${c}`)).join(', ')).join('. ')}.`;
  return placeholder('TABLE', `${name}.png`, alt);
}

function tableSvg(header, body, widths) {
  const x0 = 16, pad = 16, lineHeight = 26, charWidth = 9.6;
  const xs = widths.reduce((acc, w, i) => [...acc, i === 0 ? x0 : acc[i - 1] + widths[i - 1]], []);
  const total = widths.reduce((a, b) => a + b, 0) + 2 * x0;
  const wrap = (s, w) => {
    const max = Math.max(8, Math.floor((w - 2 * pad) / charWidth));
    const lines = [];
    let line = '';
    for (const word of s.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = word; } else line = (line + ' ' + word).trim();
    }
    return [...lines, line];
  };
  const parts = [`<rect x="${x0}" y="16" width="${total - 2 * x0}" height="52" rx="8" fill="#e6effc"/>`];
  header.forEach((h, i) => parts.push(`<text x="${xs[i] + pad}" y="49" font-size="19" font-weight="700" fill="#0b5cd5">${esc(h)}</text>`));
  let y = 76;
  for (const row of body) {
    const cells = row.map((c, i) => wrap(c, widths[i]));
    const height = Math.max(...cells.map((c) => c.length)) * lineHeight + 22;
    parts.push(`<line x1="${x0}" y1="${y}" x2="${total - x0}" y2="${y}" stroke="#cfc9bd" stroke-width="1.5"/>`);
    cells.forEach((lines, i) => lines.forEach((l, j) => parts.push(`<text x="${xs[i] + pad}" y="${y + 30 + j * lineHeight}" font-size="18" fill="#1f2328"${i === 0 ? ' font-weight="700"' : ''}>${esc(l)}</text>`)));
    y += height;
  }
  const H = y + 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${H}" width="${total}" height="${H}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">\n${parts.join('\n')}\n</svg>\n`;
}

// The series line comes first in the body; the footer is the AI disclaimer, a separator and the
// "Originally published" line (Medium does not keep blank lines, so the separator in the post
// before the disclaimer is left out).
const nodes = [...tree.children];
const last = nodes.at(-1);
const disclaimer = last?.type === 'paragraph' && nodes.at(-2)?.type === 'thematicBreak' ? (nodes.splice(-2), last) : null;
const html = [];
for (const n of nodes) html.push(await block(n));
const url = `${SITE}/blog/${slug}/`;
const date = new Date(meta.pubDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const bodySequence = sequence.join(' ');
const footer = [];
if (disclaimer) {
  sequence.length = 0;
  footer.push(await block(disclaimer), '<hr>', `<p>Originally published at <a href="${url}">${SITE}</a> on ${date}.</p>`);
}

const first = tree.children.find((n) => n.type === 'paragraph');
const manifest = {
  title: meta.title,
  seriesLine: first ? text(first).trim() : null,
  description: meta.description,
  canonical: url,
  footer: disclaimer ? { disclaimer: text(disclaimer).trim(), originallyPublished: `Originally published at ${SITE} on ${date}.` } : null,
  uploads,
  // The blocks to expect in the editor (P, H3, H4, LI, QUOTE, PRE, FIG, HR), to check the result.
  sequence: bodySequence,
  footerSequence: disclaimer ? 'P HR P' : '',
};
if (meta.description.length > 140) console.warn(`The description has ${meta.description.length} characters; Medium's preview allows 140.`);
await writeFile(`${out}/body.html`, html.join('\n') + '\n');
await writeFile(`${out}/footer.html`, footer.join('\n') + '\n');
await writeFile(`${out}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
await writeFile(`${out}/preview.html`, `<!doctype html><meta charset="utf-8"><title>${esc(meta.title)}</title><style>body{max-width:680px;margin:40px auto;font:18px/1.6 Georgia,serif}pre{background:#f4f2ec;padding:12px;overflow:auto}</style><h1>${esc(meta.title)}</h1>\n${[...html, ...footer].join('\n')}\n`);
console.log(`Wrote ${out}: ${uploads.length} uploads (${uploads.filter((u) => u.kind === 'TABLE').length} tables), ${bodySequence.split(' ').length} body blocks`);
