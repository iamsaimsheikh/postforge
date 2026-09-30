interface SourceItem {
  title: string;
  detail: string;
  url?: string;
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    score: number;
    num_comments: number;
    subreddit: string;
    permalink: string;
  };
}

async function fetchSubreddit(sub: string): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/hot.json?limit=10&t=week`,
      {
        headers: { "User-Agent": "PostForge/1.0 (content-research)" },
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) return items;

    const data = (await res.json()) as { data: { children: RedditPost[] } };

    for (const post of data.data.children) {
      const p = post.data;
      if (p.score < 5) continue;

      const detail = p.selftext
        ? p.selftext.slice(0, 300)
        : `Score: ${p.score}, Comments: ${p.num_comments}`;

      items.push({
        title: p.title,
        detail: `r/${p.subreddit} | ${detail}`,
        url: `https://reddit.com${p.permalink}`,
      });
    }
  } catch {
    console.warn(`[postforge] Reddit r/${sub} fetch failed`);
  }

  return items;
}

export async function getRedditSources(subreddits: string[]): Promise<SourceItem[]> {
  if (subreddits.length === 0) return [];

  const results = await Promise.all(subreddits.map(fetchSubreddit));
  const all = results.flat();

  console.log(`[postforge] Reddit: ${all.length} posts from ${subreddits.length} subs`);
  return all.slice(0, 15);
}
