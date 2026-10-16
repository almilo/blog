import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';

import { SITE_TITLE } from '../../../consts';
import { getPublishedPosts, getPublishedSeries, type Series } from '../../../lib/posts';

// A feed for each series, for readers who follow only that series.
export const getStaticPaths = (async () => {
  const all = await getPublishedSeries();
  return all.map((series) => ({ params: { slug: series.id }, props: { series } }));
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { series } = context.props as { series: Series };
  const posts = (await getPublishedPosts()).filter((post) => post.data.series === series.id);

  return rss({
    title: `${series.data.title} — ${SITE_TITLE}`,
    description: series.data.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: `/blog/${post.id}/`,
    })),
  });
}
