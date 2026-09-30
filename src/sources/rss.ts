import type { RssSource } from "../config.js";

interface SourceItem {
  title: string;
  detail: string;
  url?: string;
}

function parseRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ??
      "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const desc =
      block.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
      block.match(/<description>(.*?)<\/description>/)?.[1] ??
      "";

    if (title && title.length > 5) {
      items.push({
        title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        link,
        description: desc.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").slice(0, 200),
      });
    }
  }

  return items;
}

async function fetchFeed(source: RssSource): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    const res = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return items;

    const xml = await res.text();
    const parsed = parseRssItems(xml);

    for (const article of parsed.slice(0, 8)) {
      items.push({
        title: article.title,
        detail: article.description || source.name,
        url: article.link,
      });
    }
  } catch {
    console.warn(`[postforge] RSS fetch failed: ${source.name}`);
  }

  return items;
}

export async function getRssSources(feeds: RssSource[]): Promise<SourceItem[]> {
  if (feeds.length === 0) return [];

  const results = await Promise.all(feeds.map(fetchFeed));
  const all = results.flat();

  const unique = all.filter(
    (item, i, arr) => arr.findIndex((x) => x.title === item.title) === i,
  );

  console.log(`[postforge] RSS: ${unique.length} articles from ${feeds.length} feeds`);
  return unique;
}
