import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generate(
  prompt: string,
  options?: { system?: string; maxTokens?: number; model?: string },
): Promise<string> {
  const response = await client.messages.create({
    model: options?.model ?? "claude-sonnet-4-5",
    max_tokens: options?.maxTokens ?? 4096,
    system: options?.system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  console.log(`[postforge] AI generated ${text.length} chars (${response.usage.output_tokens} tokens)`);
  return text;
}
