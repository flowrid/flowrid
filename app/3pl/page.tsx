import { createServerClient } from "@/lib/supabase";
import DirectoryResults from "@/components/DirectoryResults";
import MobileCTA from "@/components/mobile/MobileCTA";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

/**
 * 3PL Directory — 全部列表页，支持筛选 + 对比选择
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
          Please configure Supabase environment variables.
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

  const title = params.state
    ? `3PLs in ${formatName(params.state)}`
    : params.category
      ? `${formatName(params.category)} 3PL Providers`
      : params.platform
        ? `${params.platform} 3PL Providers`
        : "All 3PL Providers";

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl font-bold text-text mb-2">{title}</h1>
      <p className="text-text-secondary mb-6">
        {threePLs?.length || 0} fulfillment centers found
        {threePLs && threePLs.length >= 2 && (
          <span className="ml-2 text-xs">
            — check the box on any card to compare
          </span>
        )}
      </p>

      <DirectoryResults
        threePLs={(threePLs as ThreePL[]) || []}
        emptyTitle="No 3PLs Found"
        emptyMessage={
          <>
            Try adjusting your search filters or{" "}
            <a href="/rfq" className="text-primary hover:underline">
              submit an RFQ
            </a>{" "}
            to get matched.
          </>
        }
      />

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
