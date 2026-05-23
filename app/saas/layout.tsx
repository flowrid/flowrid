"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/saas/dashboard", icon: "/icons/dashboard.png" },
  { label: "Orders", href: "/saas/orders", icon: "/icons/orders.png" },
  { label: "Inventory", href: "/saas/inventory", icon: "/icons/inventory.png" },
  { label: "Receiving", href: "/saas/receiving", icon: "/icons/receiving.png" },
  { label: "Scan", href: "/saas/scan", icon: "/icons/scan.png" },
  { label: "Analytics", href: "/saas/analytics", icon: "/icons/analytics.png" },
  { label: "Shipping", href: "/saas/shipping", icon: "/icons/shipping.png" },
  { label: "Billing", href: "/saas/billing", icon: "/icons/billing.png" },
  { label: "Settings", href: "/saas/settings", icon: "/icons/settings.png" },
];

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/saas/login" || pathname === "/saas/register" || pathname?.startsWith("/saas/scan")) return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/saas/logout", { method: "POST" });
    router.push("/saas/login");
  }

  return (
    <div className="min-h-screen flex bg-[#F5F5F7]">
      {/* Sidebar — frosted glass */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col bg-white/70 backdrop-blur-xl border-r border-black/5">
        <div className="px-5 py-6">
          <Link href="/saas/dashboard" className="inline-block">
            <img src="/logo.png" alt="Flowrid" className="h-7 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#ed6d00] text-white shadow-sm"
                    : "text-[#1D1D1F] hover:bg-black/5"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center"><img src={item.icon} alt="" className="w-4 h-4" /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-black/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5 transition-all"
          >
            <span>&larr;</span> Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all w-full text-left"
          >
            <span>&#x21AA;</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 z-50 flex">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#ed6d00]" : "text-[#86868B]"
              }`}
            >
              <span className="text-base mb-0.5"><img src={item.icon} alt="" className="w-4 h-4" /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
