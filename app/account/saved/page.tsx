"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import ThreePLCard from "@/components/3PLCard";
import type { ThreePL } from "@/types/3pl";
import Link from "next/link";

export default function Saved3PLsPage() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [threePLs, setThreePLs] = useState<ThreePL[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data?.session?.user?.id;
      setEmail(data?.session?.user?.email || null);

      if (!userId) {
        setLoading(false);
        return;
      }

      // 获取收藏的 slug 列表
      const { data: saved } = await supabase
        .from("saved_3pls")
        .select("slug")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (saved && saved.length > 0) {
        const slugList = saved.map((s: any) => s.slug);
        setSlugs(slugList);

        // 获取对应的 3PL 数据
        const { data: providers } = await supabase
          .from("pl_providers")
          .select("*")
          .in("slug", slugList);

        if (providers) {
          // 按保存顺序排列
          const map = new Map((providers as ThreePL[]).map((p) => [p.slug, p]));
          setThreePLs(slugList.map((s) => map.get(s)).filter(Boolean) as ThreePL[]);
        }
      }
      setLoading(false);
    });
  }, []);

  async function removeSlug(slug: string) {
    const supabase = createBrowserClient();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    await supabase.from("saved_3pls").delete().eq("user_id", userId).eq("slug", slug);
    setSlugs((prev) => prev.filter((s) => s !== slug));
    setThreePLs((prev) => prev.filter((p) => p.slug !== slug));
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Log in to see your saved 3PLs.</p>
        <a href="/login" className="text-primary hover:underline font-medium">Log in</a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-text">Saved 3PLs</h1>
        {threePLs.length > 0 && (
          <Link
            href={`/compare?pls=${slugs.join(",")}`}
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Compare All ({threePLs.length})
          </Link>
        )}
      </div>
      <p className="text-text-secondary mb-8">
        {threePLs.length > 0
          ? `${threePLs.length} 3PL${threePLs.length > 1 ? "s" : ""} saved to your account.`
          : "Your shortlisted fulfillment providers will appear here."}
      </p>

      {threePLs.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:gap-5 lg:grid-cols-4">
          {threePLs.map((p) => (
            <div key={p.slug} className="relative group">
              <button
                onClick={() => removeSlug(p.slug)}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 border border-border flex items-center justify-center text-text-secondary hover:text-danger hover:border-danger/30 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from saved"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ThreePLCard
                data={{ ...p, score: Math.round(p.rating || 0) }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-text-secondary/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-text-secondary mb-2">No saved 3PLs yet</p>
          <p className="text-sm text-text-secondary mb-6">
            Browse the directory, check the box on any card, and click Save.
          </p>
          <a href="/3pl" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
            Browse 3PL Directory
          </a>
        </div>
      )}
    </>
  );
}
