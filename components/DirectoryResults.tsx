"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ThreePLCard from "@/components/3PLCard";
import type { ThreePL } from "@/types/3pl";

/**
 * 客户端目录结果区 — 支持勾选对比 + 浮动对比栏
 */
export default function DirectoryResults({
  threePLs,
  emptyTitle,
  emptyMessage,
}: {
  threePLs: ThreePL[];
  emptyTitle: string;
  emptyMessage: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  if (!threePLs || threePLs.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">{emptyTitle}</h1>
        <p className="mt-2 text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  const selectedList = threePLs.filter((p) => selected.has(p.slug));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threePLs.map((item) => {
          const score = Math.round((item.rating || 0) * 20);
          const isSelected = selected.has(item.slug);

          return (
            <div key={item.id} className="relative">
              {/* Compare Checkbox */}
              <button
                onClick={() => toggle(item.slug)}
                className={`absolute top-3 right-3 z-10 w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-300 text-transparent hover:border-primary"
                }`}
                title="Select to compare"
              >
                {isSelected ? "✓" : ""}
              </button>

              <ThreePLCard data={{ ...item, score }} />
            </div>
          );
        })}
      </div>

      {/* Floating Compare Bar */}
      {selectedList.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border shadow-lg z-50 flex items-center justify-between">
          <p className="text-sm text-text">
            <span className="font-bold">{selectedList.length}</span> 3PLs selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-text-secondary hover:text-text"
            >
              Clear
            </button>
            <Link
              href={`/compare?pls=${selectedList.map((p) => p.slug).join(",")}`}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Compare Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
