# CLAUDE.md

Astro blog for <https://almilo.com>. Static output, deployed to GitHub Pages.

## Commands

Node 22 and pnpm. Always pnpm — never npm or yarn.

| Command         | What it does                                                |
| --------------- | ----------------------------------------------------------- |
| `pnpm install`  | Install dependencies                                         |
| `pnpm dev`      | Dev server at <http://localhost:4321>                        |
| `pnpm build`    | Validate front matter, then build to `dist/`                 |
| `pnpm validate` | Front matter / slug check only (no build)                    |
| `pnpm preview`  | Serve the built `dist/` locally                              |

## Writing a post

Posts are markdown files in `src/content/blog/`. One file per post, no
subdirectories needed.

### Slug rule

**The filename is the slug.** It must be kebab-case and must not carry a date
prefix — the date lives in `pubDate`, not in the URL.

```
✅ src/content/blog/why-postgres-fsync-matters.md   → /blog/why-postgres-fsync-matters/
❌ src/content/blog/2026-08-16-why-postgres.md      → date prefix
❌ src/content/blog/Why_Postgres.md                 → not kebab-case
```

### Front matter schema

Defined once in `src/schemas/blog.mjs` and enforced in two places: the `blog`
collection in `src/content.config.ts` and the `pnpm validate` script. Change the
schema there and both follow.

| Field         | Type            | Required | Rule                                     |
| ------------- | --------------- | -------- | ---------------------------------------- |
| `title`       | string          | yes      | max 70 characters                        |
| `description` | string          | yes      | max 160 characters                       |
| `pubDate`     | date            | yes      | `YYYY-MM-DD`                             |
| `updatedDate` | date            | no       | `YYYY-MM-DD`                             |
| `tags`        | array of string | yes      | may be empty (`[]`)                      |
| `draft`       | boolean         | no       | **defaults to `true`**                   |
| `canonical`   | URL string      | no       | absolute URL; overrides the self-canonical |
| `series`      | string          | no       | series name; posts sharing it are listed together |
| `image`       | path string     | no       | path under `public/`, e.g. `/images/slug/x.png`; social preview |
| `linkedin`    | URL string      | no       | the post's LinkedIn discussion; shown at the end |
| `medium`      | URL string      | no       | the Medium copy of the post; shown at the end |

Unknown keys are rejected — a typo'd field is an error, not a silent no-op.

The 70/160 limits are search-result limits: longer values get truncated in
Google's listing, so they are enforced rather than suggested.

```yaml
---
title: 'A short, specific title'
description: 'One sentence that reads well as a search result snippet.'
pubDate: 2026-08-16
tags: ['postgres', 'databases']
draft: true
---
```

### New posts start as drafts

`draft` defaults to `true`, so **a new post with no `draft` field is a draft**.
Set `draft: false` deliberately, as the last step before publishing.

Drafts are excluded everywhere: the homepage list, `/blog/[slug]` (no page is
generated at all), `rss.xml`, and the sitemap. Nothing about a draft reaches
`dist/`. The filter applies in `pnpm dev` too, so to preview a draft in the
browser set `draft: false` locally while writing and set it back before
committing.

## Layout of the repo

```
src/
  content/blog/        posts (*.md) — the filename is the slug
  content.config.ts    the `blog` collection; loads posts, applies the schema
  schemas/blog.mjs     the Zod schema — single source of truth
  lib/posts.ts         getPublishedPosts() — drafts out, newest first
  layouts/BaseLayout.astro   <head>, canonical tag, header/footer
  pages/
    index.astro        homepage: published posts, newest first
    blog/[slug].astro  a post
    rss.xml.ts         /rss.xml
  styles/global.css    all styling
public/
  images/<series-or-slug>/  diagrams (PNG, plus the SVG source)
scripts/
  validate-content.mjs the `pnpm validate` front matter check
.github/workflows/
  deploy.yml           build + deploy to GitHub Pages on push to main
```

Always read posts through `getPublishedPosts()` in `src/lib/posts.ts` rather
than calling `getCollection('blog')` directly — that is the one place drafts are
filtered and sort order is defined. Calling `getCollection` directly is how a
draft leaks into production.

## Series and images

Posts with the same `series` value get a box at the end listing every
*published* part, oldest first (`getSeriesPosts()` in `src/lib/posts.ts`). Order
comes from `pubDate`, so give each part a distinct date. Keep a short
hand-written "Part N" line in the text too: Medium imports have no series box.

Images live in `public/images/` and are referenced by absolute path, both in
markdown and in the `image` field, so the same URL works on the site, in
`og:image` and in Medium imports. `pnpm validate` fails if `image` points at a
missing file. Use PNG (Medium does not accept SVG) and always write alt text.

The `trim-whitespace-around-headings` integration in `astro.config.mjs` strips
the whitespace before and after headings in the built HTML. Without it, Medium
imports gain an empty paragraph next to every heading.

Set `linkedin` and `medium` once those posts exist; a "Discuss this article"
line appears at the end of the post for whichever is set.

## Analytics

`BaseLayout` loads GoatCounter (<https://almilo.goatcounter.com>): cookieless
page-view counts. It ignores localhost, so `pnpm dev` visits are not counted.

## Canonical URLs

Every page emits exactly one `<link rel="canonical">`. `BaseLayout` builds a
self-referencing URL (with a trailing slash, matching the sitemap) unless a
`canonical` prop is passed. `src/pages/blog/[slug].astro` passes the post's
`canonical` front matter field, so a cross-posted article can point at the
original.

## Validation in CI

`.github/workflows/deploy.yml` runs `pnpm validate` as its own step before the
build. `pnpm build` runs the same check locally, so CI and local fail
identically. The separate CI step exists so a bad post shows up as a named
failing step rather than a build stack trace.

The validator reports *every* problem in *every* post in one pass — schema
violations, malformed YAML, bad slugs, and empty bodies — where `astro build`
stops at the first bad file.

## Deployment

Push to `main` → GitHub Pages. The site URL is set by `site` in
`astro.config.mjs` (`https://almilo.com`); it drives the canonical tags, the RSS
links and the sitemap, so it must match wherever the site actually serves from.

There is intentionally no `public/CNAME`. The custom domain is configured
separately. If you add one later, note that GitHub Pages drops the domain on
each deploy unless the `CNAME` file is committed to the repository.
