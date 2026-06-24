"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* Minimal top bar with back button */}
      <header className="bg-white border-b border-black/5 px-4 h-12 flex items-center shrink-0">
        <Link href="/saas/dashboard" className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors">
          &larr; Back
        </Link>
        <p className="text-sm font-semibold text-[#1D1D1F] mx-auto">Scanner</p>
      </header>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
