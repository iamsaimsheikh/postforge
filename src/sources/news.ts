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
      block.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? "";

    if (title && title.length > 5) {
      items.push({
        title: title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        link,
        description: desc.replace(/<[^>]*>/g, "").slice(0, 200),
      });
    }
  }

  return items;
}

async function fetchGoogleNews(query: string): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`,
      { signal: AbortSignal.timeout(8000) },
    );

    if (!res.ok) return items;

    const xml = await res.text();
    const parsed = parseRssItems(xml);

    for (const article of parsed.slice(0, 5)) {
      items.push({
        title: article.title,
        detail: article.description || `Google News: ${query}`,
        url: article.link,
      });
    }
  } catch {
    console.warn(`[postforge] Google News fetch failed: "${query}"`);
  }

  return items;
}

export async function getNewsSources(keywords: string[]): Promise<SourceItem[]> {
  if (keywords.length === 0) return [];

  const picked = keywords.sort(() => Math.random() - 0.5).slice(0, 2);
  const results = await Promise.all(picked.map(fetchGoogleNews));
  const all = results.flat();

  const unique = all.filter(
    (item, i, arr) => arr.findIndex((x) => x.title === item.title) === i,
  );

  console.log(`[postforge] News: ${unique.length} articles from Google News`);
  return unique.slice(0, 10);
}
