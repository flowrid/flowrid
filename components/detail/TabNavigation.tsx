"use client";

import { useState, useEffect, useCallback } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

export default function TabNavigation({ tabs }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const handleScroll = useCallback(() => {
    const offsets = tabs.map((tab) => {
      const el = document.getElementById(tab.id);
      if (!el) return { id: tab.id, top: Infinity };
      const rect = el.getBoundingClientRect();
      return { id: tab.id, top: rect.top };
    });

    // 找到第一个section在视口上方或最近的
    const viewportMiddle = window.innerHeight * 0.3;
    let current = offsets[0]?.id || "";

    for (const offset of offsets) {
      if (offset.top <= viewportMiddle) {
        current = offset.id;
      }
    }

    setActiveTab(current);
  }, [tabs]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveTab(id);
    }
  };

  return (
    <nav className="sticky top-[72px] z-40 bg-white/95 backdrop-blur border-b border-border -mx-4 px-2 md:-mx-0 md:px-0">
      <div className="flex gap-1 md:gap-0 overflow-x-auto mobile-scrollbar-hide py-2 px-2 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className={`shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
