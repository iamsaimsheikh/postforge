import { generate } from "./ai.js";
import { loadConfig, loadRules, type GeneratedPost, type TopicConfig } from "./config.js";
import { gatherSources, formatSources, type SourceItem } from "./sources/index.js";

function stripEmDashes(text: string): string {
  return text.replace(/ — /g, ". ").replace(/—/g, ". ");
}

function buildTopicInstructions(topic: TopicConfig): string {
  return `Post type: "${topic.id}" (card tag: ${topic.label})\n${topic.description}`;
}

function buildPrompt(topic: TopicConfig, sources: SourceItem[], recentTopics: string[]): string {
  const config = loadConfig();

  return `Generate a "${topic.id}" post for LinkedIn and X (Twitter).

## Post Type Instructions
${buildTopicInstructions(topic)}

## About the Author
Name: ${config.name}
Niche: ${config.niche}

## Source Material
${formatSources(sources)}

## Avoid These Recent Topics (do not repeat)
${recentTopics.length > 0 ? recentTopics.map((t) => `- ${t}`).join("\n") : "No previous posts yet. Full freedom."}

## Quality Checklist (verify before returning):
1. Is this post reacting to a REAL trending topic from the source material? If you ignored the sources and wrote a generic tip, START OVER.
2. Does the hook create an open loop that demands reading more?
3. Does the post reference specific current events, data, or industry discussions?
4. Is the CTA specific enough that someone could respond in one sentence?
5. Would a professional in this niche find this timely and relevant?
6. Does the card headline work on its own without reading the post?
7. Is the X post a strong standalone statement, not just a truncated LinkedIn post?

Return ONLY valid JSON matching the format specified in the rules. No markdown fencing, no commentary.`;
}

function selectTopic(topics: TopicConfig[], lastTopicId?: string): TopicConfig {
  const weighted: TopicConfig[] = [];
  for (const t of topics) {
    for (let i = 0; i < (t.weight || 1); i++) {
      weighted.push(t);
    }
  }

  if (lastTopicId) {
    const available = weighted.filter((t) => t.id !== lastTopicId);
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }

  return weighted[Math.floor(Math.random() * weighted.length)];
}

function parseResponse(text: string, topic: TopicConfig): GeneratedPost {
  let cleaned = text.trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!parsed.topic || !parsed.linkedinText || !parsed.xText || !parsed.cardData) {
    throw new Error("Missing required fields in generated content");
  }

  parsed.linkedinText = stripEmDashes(parsed.linkedinText);
  parsed.xText = stripEmDashes(parsed.xText);
  parsed.cardData.tag = parsed.cardData.tag || topic.label;

  return {
    topic: parsed.topic,
    linkedinText: parsed.linkedinText,
    xText: parsed.xText,
    cardData: parsed.cardData,
  };
}

export async function generatePost(recentTopics: string[] = [], lastTopicId?: string): Promise<{ post: GeneratedPost; topicConfig: TopicConfig }> {
  const config = loadConfig();
  const rules = loadRules();
  const sources = await gatherSources(config);
  const topicConfig = selectTopic(config.topics, lastTopicId);

  console.log(`[postforge] Selected topic: ${topicConfig.id} (${topicConfig.label})`);

  const prompt = buildPrompt(topicConfig, sources, recentTopics);

  let text: string;
  try {
    text = await generate(prompt, { system: rules, maxTokens: 3072 });
  } catch (err) {
    console.error("[postforge] AI generation failed:", err);
    throw err;
  }

  try {
    return { post: parseResponse(text, topicConfig), topicConfig };
  } catch {
    console.warn("[postforge] First parse failed, retrying...");
    const retryText = await generate(
      "Your previous response was not valid JSON. Return ONLY the JSON object:\n\n" + text,
      { system: rules, maxTokens: 2048 },
    );
    return { post: parseResponse(retryText, topicConfig), topicConfig };
  }
}
