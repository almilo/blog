import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

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

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
