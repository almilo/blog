import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export type Series = CollectionEntry<'series'>;

/** Published posts (drafts excluded), newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** The published parts of a series in reading order (oldest first), each with its companions. */
export async function getSeriesPosts(series: string) {
  const posts = (await getPublishedPosts()).filter((post) => post.data.series === series).reverse();
  return posts
    .filter((post) => !post.data.companion)
    .map((part) => ({ part, companions: posts.filter((post) => post.data.companion === part.id) }));
}

/**
 * The series that have at least one published post. A series with only drafts
 * gets no page and no link, as a draft gets none.
 */
export async function getPublishedSeries(): Promise<Series[]> {
  const published = new Set((await getPublishedPosts()).map((post) => post.data.series));
  return (await getCollection('series')).filter((series) => published.has(series.id));
}

/** The published series that the header links to (`nav: true`). */
export async function getNavSeries(): Promise<Series[]> {
  return (await getPublishedSeries()).filter((series) => series.data.nav);
}

export async function getSeries(id: string): Promise<Series | undefined> {
  return (await getCollection('series')).find((series) => series.id === id);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
