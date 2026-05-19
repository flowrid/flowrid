"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/saas/dashboard",
    icon: "📊",
  },
  {
    label: "Orders",
    href: "/saas/orders",
    icon: "📦",
  },
  {
    label: "Inventory",
    href: "/saas/inventory",
    icon: "🏗️",
  },
  {
    label: "Receiving",
    href: "/saas/receiving",
    icon: "📥",
  },
  {
    label: "Billing",
    href: "/saas/billing",
    icon: "💰",
  },
  {
    label: "Settings",
    href: "/saas/settings",
    icon: "⚙️",
  },
];

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 登录页不使用 Dashboard 布局
  if (pathname === "/saas/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/saas/dashboard" className="text-lg font-bold text-primary">
            Flowrid WMS
          </Link>
          <p className="text-xs text-text-secondary mt-0.5">
            3PL Operating System
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:bg-gray-100 hover:text-text"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text transition-colors"
          >
            &larr; Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex overflow-x-auto">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
