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
  clientCache = new OpenAI({
    apiKey: key,
    baseURL: "https://oa.api2d.net/v1",
  });
  return clientCache;
}

const SYSTEM_PROMPT = `You are a senior logistics consultant helping e-commerce brands choose 3PL fulfillment partners.

Generate a comprehensive decision guide for a specific 3PL search page. Content MUST be:
- Specific to the location, product type, and e-commerce platform
- Factual about real logistics infrastructure (ports, highways, warehouse hubs)
- Actionable for a business owner making a $10K+/year logistics decision
- Never generic or templated — each location/category/platform combo needs unique content

Return clean JSON matching the schema exactly.`;

function buildPrompt(state: string, category: string, platform: string): string {
  const stateName = formatName(state);
  const catName = formatName(category);

  return `Generate a detailed 3PL decision guide for: ${catName} brands selling on ${platform}, looking for fulfillment in ${stateName}.

Return JSON with these fields:

1. "summary" (string): 3-4 sentence executive overview. What makes ${stateName} specifically good or bad for ${catName} ${platform} fulfillment? Mention real geography/logistics facts.

2. "cost_guide" (string): 3-4 sentences about what ${catName} brands should expect to pay for 3PL in ${stateName}. Discuss cost drivers (labor, real estate, proximity to ports), typical pricing model (per-unit vs per-pallet), and how ${platform} order patterns affect cost. Do NOT quote specific dollar amounts — use relative terms like "above average" or "competitive."

3. "shipping_insights" (string): 3-4 sentences about fulfillment speed, transit times, and distribution reach from ${stateName}. Mention specific advantages (e.g., "2-day ground coverage to X% of US population") and any ${platform}-specific fulfillment requirements like SLAs or delivery promises.

4. "key_considerations" (array of 4 strings): Specific things ${catName} brands using ${platform} should evaluate when choosing a 3PL in ${stateName}. Each item should be a concrete, actionable evaluation criterion. Examples: "Verify the warehouse has climate-controlled storage if shipping heat-sensitive products" or "Ask about weekend shift availability — ${platform} orders often spike on weekends."

5. "faq" (array of 5 objects with "q" and "a" fields): Real questions a ${catName} brand owner would type into Google. Questions should be specific (not generic like "what is 3PL"). Answers should be 2-3 sentences, detailed and helpful.

Output valid JSON only.`;
}

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
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(state, category, platform) },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const content = res.choices[0].message.content;
    if (!content) throw new Error("AI returned empty response");

    const parsed = JSON.parse(content) as AISummary;

    // 验证必要字段
    if (
      !parsed.summary ||
      !parsed.cost_guide ||
      !parsed.shipping_insights ||
      !parsed.key_considerations ||
      !parsed.faq
    ) {
      throw new Error("AI response missing required fields");
    }

    return parsed;
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return fallback(state, category, platform);
  }
}

function fallback(state: string, category: string, platform: string): AISummary {
  const stateName = formatName(state);
  const catName = formatName(category);

  return {
    summary: `${stateName} is a key logistics hub for ${catName.toLowerCase()} brands using ${platform}, offering competitive warehousing and fast fulfillment across the United States.`,
    cost_guide: `3PL costs for ${catName.toLowerCase()} in ${stateName} vary based on storage requirements, order volume, and value-added services like kitting or labeling. ${platform} sellers typically pay per-unit pick-and-pack fees plus monthly storage. Request quotes from multiple providers to compare total landed costs.`,
    shipping_insights: `${stateName}-based fulfillment centers offer nationwide shipping coverage. Transit times to major population centers range from 1-5 business days depending on distance. ${platform} sellers should confirm that the 3PL meets platform-specific SLA requirements.`,
    key_considerations: [
      "Verify the warehouse has experience handling your specific product type and understands any special requirements.",
      `Confirm ${platform} integration compatibility — the 3PL should support real-time order sync and inventory updates.`,
      "Ask about peak season capacity and whether they charge surge pricing during holidays.",
      "Check client references and review their performance metrics for order accuracy and on-time shipping.",
    ],
    faq: [
      {
        q: `What is the average 3PL cost for ${catName.toLowerCase()} in ${stateName}?`,
        a: `Cost depends on order volume, storage needs, and value-added services. ${platform} sellers typically pay a per-order pick-and-pack fee ($2-5/order range) plus monthly storage per pallet or cubic foot. Get itemized quotes from at least three providers.`,
      },
      {
        q: `How fast can ${platform} orders be fulfilled in ${stateName}?`,
        a: `Most professional 3PLs process orders within 24 hours of receipt, with same-day processing available for orders placed before a cutoff time (typically 12-2 PM local). Ground shipping from ${stateName} reaches most of the continental US within 3-5 business days.`,
      },
      {
        q: `Which ${catName.toLowerCase()} 3PLs in ${stateName} have the best reviews?`,
        a: `Our scoring system ranks 3PLs based on category match, platform compatibility, location relevance, speed, and cost. Check the Top Match section above for the highest-rated providers for your specific needs.`,
      },
      {
        q: `What should I look for in a ${platform} 3PL partner?`,
        a: `Look for deep ${platform} integration experience, real-time inventory sync, and understanding of ${platform}'s specific fulfillment policies and SLAs. The 3PL should also handle returns processing and provide a dashboard for tracking orders and inventory levels.`,
      },
      {
        q: `Can a ${stateName} 3PL handle both B2B wholesale and DTC orders?`,
        a: `Many ${stateName} fulfillment centers offer hybrid B2B/DTC capabilities. If you sell both wholesale and direct-to-consumer, verify the 3PL can handle different packaging requirements, labeling standards, and shipping methods for each channel.`,
      },
    ],
  };
}

function formatName(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
