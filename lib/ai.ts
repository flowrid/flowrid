import OpenAI from "openai";
import { AISummary } from "@/types/3pl";

let clientCache: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (clientCache !== undefined) return clientCache;
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "your_openai_api_key_here") {
    console.warn("OPENAI_API_KEY 未配置，AI 摘要使用 fallback");
    clientCache = null;
    return null;
  }
  clientCache = new OpenAI({ apiKey: key });
  return clientCache;
}

/**
 * 生成 AI 摘要 —— 每个 SEO 页面的核心差异化内容
 * 未配置 API key 时自动使用 fallback
 */
export async function generateAISummary(
  state: string,
  category: string,
  platform: string
): Promise<AISummary> {
  const client = getClient();

  if (!client) {
    return fallback(state, category, platform);
  }

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are a logistics industry analyst.

Generate SEO content for a page about 3PL fulfillment in ${state} for ${category} brands using ${platform}.

Rules:
- Must be specific to the ${state} region (mention real logistics advantages)
- Must reflect real logistics logic for ${category} products
- Must not repeat generic phrases
- 2-3 sentences max for summary
- FAQ must be 3 short, specific questions

Return JSON:
{
  "summary": "2-3 sentence region-specific logistics analysis",
  "why_section": "2-3 bullet points why this region is good for this category + platform combo",
  "faq": ["specific question 1?", "specific question 2?", "specific question 3?"]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = res.choices[0].message.content;
    if (!content) throw new Error("AI returned empty response");

    return JSON.parse(content) as AISummary;
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return fallback(state, category, platform);
  }
}

function fallback(state: string, category: string, platform: string): AISummary {
  return {
    summary: `${state} is a key logistics hub for ${category} brands using ${platform}, offering competitive warehousing and fast fulfillment across the United States.`,
    why_section: `- Competitive warehousing costs in ${state}\n- Strong ${platform} integration ecosystem\n- Fast nationwide shipping coverage`,
    faq: [
      `What is the average cost of 3PL for ${category} in ${state}?`,
      `How fast can ${platform} orders be fulfilled in ${state}?`,
      `Which ${category} 3PLs in ${state} have the best reviews?`,
    ],
  };
}
