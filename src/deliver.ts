import { loadConfig, type GeneratedPost } from "./config.js";

export async function deliverToDiscord(
  post: GeneratedPost,
  linkedinImage: Buffer,
  xImage: Buffer,
  instagramImage: Buffer,
): Promise<boolean> {
  const config = loadConfig();
  const webhookUrl = config.delivery.discord_webhook;

  if (!webhookUrl) {
    console.warn("[postforge] No Discord webhook configured. Skipping delivery.");
    return false;
  }

  const payload = {
    embeds: [
      {
        title: `LinkedIn: ${post.topic}`,
        description: post.linkedinText.slice(0, 4000),
        color: 0x0077b5,
        image: { url: "attachment://linkedin.png" },
        footer: { text: `PostForge | ${config.name}` },
        timestamp: new Date().toISOString(),
      },
      {
        title: "X Post",
        description: post.xText,
        color: 0x1da1f2,
        image: { url: "attachment://x.png" },
      },
      {
        title: "Instagram",
        description: "1080x1350 portrait",
        color: 0xe1306c,
        image: { url: "attachment://instagram.png" },
      },
    ],
  };

  const boundary = `postforge_${Date.now()}`;
  const parts: Buffer[] = [];

  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n`,
  ));

  const files = [
    { name: "linkedin.png", data: linkedinImage },
    { name: "x.png", data: xImage },
    { name: "instagram.png", data: instagramImage },
  ];

  files.forEach((file, i) => {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="files[${i}]"; filename="${file.name}"\r\nContent-Type: image/png\r\n\r\n`,
    ));
    parts.push(file.data);
    parts.push(Buffer.from("\r\n"));
  });

  parts.push(Buffer.from(`--${boundary}--\r\n`));

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      body: Buffer.concat(parts),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[postforge] Discord delivery failed: ${res.status} ${text}`);
      return false;
    }

    console.log("[postforge] Delivered to Discord");
    return true;
  } catch (err) {
    console.error("[postforge] Discord delivery error:", err);
    return false;
  }
}
