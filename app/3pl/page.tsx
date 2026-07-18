import { createServerClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import DirectoryResults from "@/components/DirectoryResults";
import DirectorySearch from "@/components/DirectorySearch";
import MobileCTA from "@/components/mobile/MobileCTA";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const t = await getTranslations();
  const params = await searchParams;
  const page = Math.max(0, parseInt(params.page || "0") || 0);
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("directory.dbError")}</h1>
        <p className="mt-2 text-text-secondary">
          {t("directory.dbErrorMsg")}
        </p>
      </div>
    );
  }

  // Get total count
  const { count } = await supabase
    .from("pl_providers")
    .select("*", { count: "exact", head: true });

  const totalCount = count || 0;

  // Fetch current page with range
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("pl_providers").select("*").range(from, to).order("rating", { ascending: false });

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
    ? t("directory.providersIn", { category: formatName(params.state) })
    : params.category
      ? t("directory.providersIn", { category: formatName(params.category) })
      : params.platform
        ? t("directory.providersIn", { category: params.platform })
        : t("directory.allProviders");

  return (
    <div className="max-w-[1460px] mx-auto px-4 py-8 pb-20">
      <DirectorySearch />

      <h1 className="text-2xl font-bold text-text mb-2 text-center">{title}</h1>
      <p className="text-text-secondary mb-6 text-center">
        {t("directory.found", { count: totalCount.toLocaleString() })}
        {threePLs && threePLs.length >= 2 && (
          <span className="ml-2 text-xs">
            — {t("directory.checkBox")}
          </span>
        )}
      </p>

      <DirectoryResults
        threePLs={(threePLs as ThreePL[]) || []}
        totalCount={totalCount}
        page={page}
        emptyTitle={t("directory.noResults")}
        emptyMessage={
          <a href="/rfq" className="text-primary hover:underline">
            {t("directory.submitRFQ")}
          </a>
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
