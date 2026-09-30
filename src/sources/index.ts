import type { PostForgeConfig } from "../config.js";
import { getRedditSources } from "./reddit.js";
import { getRssSources } from "./rss.js";
import { getNewsSources } from "./news.js";

export interface SourceItem {
  title: string;
  detail: string;
  url?: string;
}

export async function gatherSources(config: PostForgeConfig): Promise<SourceItem[]> {
  console.log("[postforge] Gathering sources...");

  const [reddit, rss, news] = await Promise.all([
    getRedditSources(config.sources.reddit),
    getRssSources(config.sources.rss),
    getNewsSources(config.sources.news_keywords),
  ]);

  const all = [...rss, ...news, ...reddit];
  console.log(`[postforge] Total sources: ${all.length}`);

  return all;
}

export function formatSources(sources: SourceItem[]): string {
  if (sources.length === 0) {
    return "No trending sources available. Generate from your professional experience and knowledge of current industry trends.";
  }

  const items = sources
    .slice(0, 20)
    .map((s, i) => `${i + 1}. **${s.title}**\n   ${s.detail}${s.url ? `\n   URL: ${s.url}` : ""}`)
    .join("\n\n");

  return `## TRENDING RIGHT NOW. Pick one and write your take.

Pick the most interesting topic from this list and write a post reacting to it. Reference the specific trend, news, or discussion. Not a generic post you could have written any day.

STYLE: No em dashes. No "here's the thing." No "let me break this down." Write like a person, not a content machine. Short sentences. Periods over dashes.

${items}`;
}
