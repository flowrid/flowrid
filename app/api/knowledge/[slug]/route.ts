import { createServerClient } from "@/lib/supabase";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServerClient();

  if (!supabase) {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return Response.json({ error: "Provider not found" }, { status: 404 });
  }

  const p = data as ThreePL;

  const result = {
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
      "addressCountry": p.country || "US",
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
    "flowrid:createdAt": p.created_at,
  };

  return Response.json(result, {
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
