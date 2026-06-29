/**
 * /tools/ 共享布局 — 面包屑导航 + 统一页面壳
 */

import Link from "next/link";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/" className="hover:text-text transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-text transition-colors font-medium text-text">
          Tools
        </Link>
      </nav>

      {children}
    </div>
  );
}
