#!/usr/bin/env node
/**
 * Fails with a non-zero exit code if any post in src/content/blog has invalid
 * front matter, an illegal slug, or a missing body.
 *
 * `astro build` already enforces the Zod schema, but it stops at the first bad
 * file and reports it mid-build. This runs first and reports *every* problem
 * across *every* post at once, which is what you want from CI.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

import { blogSchema } from '../src/schemas/blog.mjs';

const CONTENT_DIR = resolve(import.meta.dirname, '..', 'src', 'content', 'blog');
const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const SLUG_RULE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/** @type {{ file: string, problems: string[] }[]} */
const failures = [];
let checked = 0;

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => resolve(entry.parentPath ?? entry.path, entry.name))
    .sort();
}

function checkSlug(name) {
  const slug = name.replace(/\.md$/, '');
  const problems = [];

  if (DATE_PREFIX.test(slug)) {
    problems.push('filename: slug must not carry a date prefix');
  }

  if (!SLUG_RULE.test(slug.replace(DATE_PREFIX, ''))) {
    problems.push('filename: slug must be kebab-case ([a-z0-9] separated by single hyphens)');
  }

  return problems;
}

const files = await markdownFiles(CONTENT_DIR).catch((error) => {
  if (error.code === 'ENOENT') return [];
  throw error;
});

for (const file of files) {
  checked += 1;
  const label = relative(process.cwd(), file);
  const name = file.split('/').pop();
  const problems = checkSlug(name);
  const raw = await readFile(file, 'utf8');
  const match = raw.match(FRONT_MATTER);

  if (!match) {
    problems.push('front matter: missing or malformed `---` delimited YAML block');
    failures.push({ file: label, problems });
    continue;
  }

  const [, yaml, body] = match;

  let data;
  try {
    data = parseYaml(yaml);
  } catch (error) {
    problems.push(`front matter: invalid YAML — ${error.message.split('\n')[0]}`);
    failures.push({ file: label, problems });
    continue;
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    problems.push('front matter: must be a YAML mapping of keys to values');
    failures.push({ file: label, problems });
    continue;
  }

  const result = blogSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'front matter';
      problems.push(`${path}: ${issue.message}`);
    }
  }

  if (typeof data.image === 'string' && !existsSync(resolve(PUBLIC_DIR, `.${data.image}`))) {
    problems.push(`image: ${data.image} does not exist under public/`);
  }

  if (body.trim().length === 0) {
    problems.push('body: post has no content below the front matter');
  }

  if (problems.length > 0) failures.push({ file: label, problems });
}

if (failures.length > 0) {
  console.error(`\n✖ Invalid front matter in ${failures.length} of ${checked} post(s):\n`);
  for (const { file, problems } of failures) {
    console.error(`  ${file}`);
    for (const problem of problems) console.error(`    - ${problem}`);
    console.error('');
  }
  console.error('See CLAUDE.md for the front matter schema and slug rule.\n');
  process.exit(1);
}

console.log(`✔ ${checked} post(s) validated — front matter and slugs OK.`);
