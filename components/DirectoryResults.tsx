"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThreePLCard from "@/components/3PLCard";
import { createBrowserClient } from "@/lib/supabase";
import type { ThreePL } from "@/types/3pl";

const PAGE_SIZE = 24;

export default function DirectoryResults({
  threePLs,
  totalCount,
  page,
  emptyTitle,
  emptyMessage,
}: {
  threePLs: ThreePL[];
  totalCount: number;
  page: number;
  emptyTitle: string;
  emptyMessage: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createBrowserClient();
    if (!supabase) {
      setSaving(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      setSaving(false);
      return;
    }

    let ok = 0;
    for (const slug of selected) {
      const { error } = await supabase.from("saved_3pls").upsert(
        { user_id: userId, slug },
        { onConflict: "user_id,slug", ignoreDuplicates: false }
      );
      if (!error) ok++;
    }

    setSaving(false);
    if (ok > 0) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setSelected(new Set());
    } else {
      alert("Could not save. Make sure you have run the migration SQL in Supabase.");
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  if (!threePLs || threePLs.length === 0) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">{emptyTitle}</h1>
        <p className="mt-2 text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const selectedList = threePLs.filter((p) => selected.has(p.slug));
  const count = selected.size;

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 0) params.set("page", String(newPage));
    else params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="max-w-[1460px] mx-auto px-4 mb-3">
        <p className="text-sm text-text-secondary">
          Showing{" "}
          <span className="font-semibold text-text">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)}
          </span>{" "}
          of <span className="font-semibold text-text">{totalCount.toLocaleString()}</span> 3PLs
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-5 lg:grid-cols-6">
        {threePLs.map((item) => {
          const score = Math.round(item.rating || 0);
          return (
            <ThreePLCard
              key={item.id}
              data={{ ...item, score }}
              selected={selected.has(item.slug)}
              onToggleSelect={() => toggle(item.slug)}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="max-w-[1460px] mx-auto px-4 mt-8 flex items-center justify-center gap-2">
          <button onClick={() => goToPage(0)} disabled={page === 0}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            First
          </button>
          <button onClick={() => goToPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) pageNum = i;
            else if (page < 4) pageNum = i;
            else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
            else pageNum = page - 3 + i;
            return (
              <button key={pageNum} onClick={() => goToPage(pageNum)}
                className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                  pageNum === page ? "bg-primary text-white" : "border border-border hover:bg-card"
                }`}>
                {pageNum + 1}
              </button>
            );
          })}
          <button onClick={() => goToPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
          <button onClick={() => goToPage(totalPages - 1)} disabled={page >= totalPages - 1}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Last
          </button>
        </div>
      )}
      {totalPages > 1 && (
        <p className="text-center text-xs text-text-secondary mt-2">
          Page {page + 1} of {totalPages}
        </p>
      )}

      {/* 浮动操作栏 — 1+ 选中时显示 */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-lg z-[60]">
          <div className="max-w-[1460px] mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-text font-medium">
                {count} {count === 1 ? "3PL" : "3PLs"} selected
              </p>
              {saved && (
                <p className="text-xs text-success mt-0.5">Saved to your account!</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text border border-border rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {count >= 2 && (
                <Link
                  href={`/compare?pls=${selectedList.map((p) => p.slug).join(",")}`}
                  className="px-6 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Compare Now
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
