import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "N/A";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "N/A";
  return String(v);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServerClient();

  if (!supabase) {
    return new Response("# Database Unavailable\n\nPlease try again later.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { data } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return new Response("# Not Found\n\nNo 3PL provider found with this slug.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const lines: string[] = [
    `# ${data.name}`,
    "",
    "## Overview",
    "",
    `- **Description**: ${data.description || "N/A"}`,
    `- **Location**: ${data.city || "N/A"}, ${data.state || "N/A"}`,
    `- **Website**: ${data.website || "N/A"}`,
    `- **Rating**: ${data.rating || "N/A"} / 5.0 (${data.review_count || 0} reviews)`,
    "",
    "## Capabilities",
    "",
    `- **Categories**: ${fmt(data.categories)}`,
    `- **Platforms**: ${fmt(data.platforms)}`,
    `- **Integrations**: ${fmt(data.integrations)}`,
    `- **Shipping Speed**: ${fmt(data.shipping_speed)}`,
    `- **Cost Level**: ${fmt(data.cost_level)}`,
    "",
    "## Capacity",
    "",
    `- **Order Capacity**: ${data.order_capacity ? data.order_capacity.toLocaleString() + " orders/month" : "N/A"}`,
    `- **SKU Capacity**: ${data.sku_capacity ? data.sku_capacity.toLocaleString() : "N/A"}`,
    "",
    "## Data Freshness",
    "",
  ];

  if (data.data_sources && Object.keys(data.data_sources).length > 0) {
    lines.push("| Field | Source | Verified |");
    lines.push("|-------|--------|----------|");
    for (const [field, meta] of Object.entries(data.data_sources as Record<string, any>)) {
      lines.push(`| ${field} | ${meta.source || "N/A"} | ${meta.verified_at || "N/A"} |`);
    }
  } else {
    lines.push("_Source attribution data is being built. Check back soon._");
  }

  lines.push("");
  lines.push(`> Last verified: ${data.data_last_verified || "Not yet verified"}`);
  lines.push(`> Data from Flowrid Knowledge Engine — https://flowrid.com/3pl/d/${slug}`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
