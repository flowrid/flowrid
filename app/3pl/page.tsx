import { createServerClient } from "@/lib/supabase";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata } from "@/lib/seo";
import ThreePLCard from "@/components/3PLCard";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import MobileCTA from "@/components/mobile/MobileCTA";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

/**
 * 3PL Directory — 全部列表页
 * 支持 URL: /3pl, /3pl?state=xxx, /3pl?category=xxx, /3pl?platform=xxx
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Database Not Configured</h1>
        <p className="mt-2 text-text-secondary">
          Please configure Supabase environment variables to see 3PL listings.
        </p>
      </div>
    );
  }

  let query = supabase.from("pl_providers").select("*");

  if (params.state) {
    query = query.eq("state", params.state);
  }
  if (params.category) {
    query = query.contains("categories", [params.category]);
  }
  if (params.platform) {
    query = query.contains("platforms", [params.platform]);
  }

  const { data: threePLs } = await query;

  if (!threePLs || threePLs.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">No 3PLs Found</h1>
        <p className="mt-2 text-text-secondary">
          Try adjusting your search filters or{" "}
          <a href="/rfq" className="text-primary hover:underline">
            submit an RFQ
          </a>{" "}
          to get matched.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl font-bold text-text mb-2">
        {params.state
          ? `3PLs in ${formatName(params.state)}`
          : params.category
            ? `${formatName(params.category)} 3PL Providers`
            : params.platform
              ? `${params.platform} 3PL Providers`
              : "All 3PL Providers"}
      </h1>
      <p className="text-text-secondary mb-6">
        {threePLs.length} fulfillment centers found
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threePLs.map((item: ThreePL) => (
          <ThreePLCard
            key={item.id}
            data={{ ...item, score: 50 }}
          />
        ))}
      </div>

      <MobileCTA />
    </div>
  );
}

function formatName(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
