import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

export interface TopicConfig {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface RssSource {
  url: string;
  name: string;
}

export interface PostForgeConfig {
  name: string;
  tagline: string;
  niche: string;
  brand: {
    accent: string;
    theme: "dark" | "light";
  };
  topics: TopicConfig[];
  sources: {
    reddit: string[];
    rss: RssSource[];
    news_keywords: string[];
  };
  delivery: {
    discord_webhook: string;
  };
  schedule: string;
  timezone: string;
}

export interface CardData {
  headline: string;
  subheadline?: string;
  body?: string;
  tag: string;
  layout?: "centered" | "stat-grid" | "numbered-list" | "split";
  highlightWord?: string;
  listItems?: { label: string; detail: string }[];
  beforeItems?: string[];
  afterItems?: string[];
}

export interface GeneratedPost {
  topic: string;
  linkedinText: string;
  xText: string;
  cardData: CardData;
}

const CONFIG_PATH = join(process.cwd(), "postforge.config.yaml");
const RULES_PATH = join(process.cwd(), "content", "rules.md");
const RULES_EXAMPLE = join(process.cwd(), "content", "rules.example.md");

let _config: PostForgeConfig | null = null;

export function loadConfig(): PostForgeConfig {
  if (_config) return _config;

  if (!existsSync(CONFIG_PATH)) {
    console.error("No postforge.config.yaml found. Copy postforge.config.example.yaml and fill in your details.");
    process.exit(1);
  }

  const raw = readFileSync(CONFIG_PATH, "utf8");
  _config = yaml.load(raw) as PostForgeConfig;
  return _config;
}

export function loadRules(): string {
  const path = existsSync(RULES_PATH) ? RULES_PATH : RULES_EXAMPLE;
  let rules = readFileSync(path, "utf8");

  const config = loadConfig();
  rules = rules.replace(/\{\{NAME\}\}/g, config.name);
  rules = rules.replace(/\{\{NICHE\}\}/g, config.niche);

  return rules;
}
