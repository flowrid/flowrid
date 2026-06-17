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
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setMounted(true);
    setActiveTab(tabs[0]?.id || "");
  }, [tabs]);

  const handleScroll = useCallback(() => {
    if (!mounted) return;
    const offsets = tabs.map((tab) => {
      const el = document.getElementById(tab.id);
      if (!el) return { id: tab.id, top: Infinity };
      const rect = el.getBoundingClientRect();
      return { id: tab.id, top: rect.top };
    });

    const viewportMiddle = window.innerHeight * 0.3;
    let current = offsets[0]?.id || "";

    for (const offset of offsets) {
      if (offset.top <= viewportMiddle) {
        current = offset.id;
      }
    }

    setActiveTab(current);
  }, [tabs, mounted]);

  useEffect(() => {
    if (!mounted) return;
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, mounted]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveTab(id);
    }
  };

  // 水合前不渲染任何内容，避免服务端/客户端不一致
  if (!mounted) return null;

  return (
    <nav className="sticky top-[72px] z-40 bg-white/95 backdrop-blur border-b border-border -mx-4 px-2 md:-mx-0 md:px-0">
      <div className="flex gap-1 md:gap-0 overflow-x-auto py-2 px-2 md:px-0" style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
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
