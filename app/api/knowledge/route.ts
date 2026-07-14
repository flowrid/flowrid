import { createServerClient } from "@/lib/supabase";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createServerClient();
  if (!supabase) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category")?.toLowerCase();
  const platform = url.searchParams.get("platform")?.toLowerCase();
  const state = url.searchParams.get("state")?.toLowerCase();

  let query = supabase.from("pl_providers").select("*").order("rating", { ascending: false });

  if (state) query = query.eq("state", state);
  if (category) query = query.contains("categories", [category]);
  if (platform) query = query.contains("platforms", [platform]);

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const providers = (data || []).map(toJsonLd);

  return Response.json(
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": providers.length,
      "itemListElement": providers.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": p,
      })),
    },
    {
      headers: {
        "Content-Type": "application/ld+json; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

function toJsonLd(p: ThreePL) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://flowrid.com/3pl/d/${p.slug}`,
    "name": p.name,
    "description": p.description,
    "url": p.website || `https://flowrid.com/3pl/d/${p.slug}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": p.city,
      "addressRegion": p.state,
    },
    "aggregateRating": p.rating
      ? {
          "@type": "AggregateRating",
          "ratingValue": p.rating,
          "reviewCount": p.review_count || 0,
        }
      : undefined,
    "image": p.logo || undefined,
    "flowrid:slug": p.slug,
    "flowrid:categories": p.categories || [],
    "flowrid:platforms": p.platforms || [],
    "flowrid:integrations": p.integrations || [],
    "flowrid:shippingSpeed": p.shipping_speed,
    "flowrid:costLevel": p.cost_level,
    "flowrid:orderCapacity": p.order_capacity,
    "flowrid:skuCapacity": p.sku_capacity,
    "flowrid:dataSources": p.data_sources || {},
    "flowrid:lastVerified": p.data_last_verified || null,
  };
}
