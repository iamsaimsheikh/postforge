import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./config.js";
import { generatePost } from "./generate.js";
import { renderAllCards } from "./render.js";
import { deliverToDiscord } from "./deliver.js";

async function run() {
  console.log("[postforge] Starting...");

  const config = loadConfig();
  console.log(`[postforge] Pipeline for: ${config.name} (${config.niche})`);

  const { post, topicConfig } = await generatePost();
  console.log(`[postforge] Generated: "${post.topic}" (${topicConfig.label})`);

  const images = await renderAllCards(post.cardData);

  const today = new Date().toISOString().split("T")[0];
  const outputDir = join(process.cwd(), "output", today);
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(join(outputDir, "linkedin.png"), images.linkedin);
  writeFileSync(join(outputDir, "x.png"), images.x);
  writeFileSync(join(outputDir, "instagram.png"), images.instagram);
  writeFileSync(join(outputDir, "content.json"), JSON.stringify({
    topic: post.topic,
    topicType: topicConfig.id,
    linkedinText: post.linkedinText,
    xText: post.xText,
    cardData: post.cardData,
    generatedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`[postforge] Saved to ${outputDir}`);

  await deliverToDiscord(post, images.linkedin, images.x, images.instagram);

  console.log("[postforge] Done.");
}

run().catch((err) => {
  console.error("[postforge] Failed:", err);
  process.exit(1);
});
