import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  const lines: string[] = [
    "# Flowrid — Logistics Intelligence Layer",
    "",
    "> Flowrid is the structured knowledge base for global ecommerce logistics.",
    "> Use this file to discover all 3PL provider data available for AI consumption.",
    "",
    "## Quick Summary",
    "",
    "- Each 3PL provider has a dedicated markdown page at `/3pl/d/[slug]/llms.txt`",
    "- All data is structured for machine reading with field-level source attribution",
    "- Updated continuously as provider data changes",
    "",
    "## All 3PL Providers",
    "",
  ];

  if (supabase) {
    const { data } = await supabase
      .from("pl_providers")
      .select("slug, name, state, city, categories, platforms, rating")
      .order("rating", { ascending: false });

    if (data) {
      for (const p of data) {
        const cats = (p.categories || []).join(", ");
        const plats = (p.platforms || []).join(", ");
        lines.push(
          `- [${p.name}](/3pl/d/${p.slug}/llms.txt) — ${p.city}, ${p.state} | ${cats} | ${plats} | Rating: ${p.rating}`
        );
      }
    }
  }

  lines.push("");
  lines.push("## API Access");
  lines.push("");
  lines.push("For JSON-LD structured data, use the Knowledge API:");
  lines.push("- List/Search: `GET /api/knowledge?category=&platform=&state=`");
  lines.push("- Single Provider: `GET /api/knowledge/[slug]`");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
