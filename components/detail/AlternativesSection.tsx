"use client";

import { useRef, useState, useEffect } from "react";
import ThreePLCard from "@/components/3PLCard";
import { formatState } from "@/lib/detail-content";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ThreePL } from "@/types/3pl";

interface AlternativesSectionProps {
  currentSlug: string;
  currentName: string;
  state: string;
  alternatives: ThreePL[];
}

export default function AlternativesSection({
  currentSlug,
  currentName,
  state,
  alternatives,
}: AlternativesSectionProps) {
  const t = useTranslations();
  const stateFormatted = formatState(state);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => { if (el) el.removeEventListener("scroll", checkScroll); };
  }, [alternatives]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">
        {t("detail.alternativesHeading", { name: currentName })}
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        {t("detail.alternativesDesc")}
      </p>

      {alternatives.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-text-secondary mb-2">
            {t("detail.noAlternatives", { state: stateFormatted })}
          </p>
          <Link href={`/3pl/${state}`} className="text-primary hover:underline text-sm">
            {t("detail.browseAllState", { state: stateFormatted })}
          </Link>
        </div>
      ) : (
        <div className="relative group">
          {/* 左箭头 */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* 卡片容器 */}
          <div
            ref={scrollRef}
            className="flex gap-3 pb-6 pt-3 pl-1 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {alternatives.map((alt) => (
              <div key={alt.id} className="w-[50vw] md:w-[220px] shrink-0">
                <ThreePLCard
                  data={{
                    ...alt,
                    score: Math.round(alt.rating || 0),
                  }}
                />
              </div>
            ))}
          </div>

          {/* 右箭头 */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
