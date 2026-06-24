"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const NAV_KEYS = [
  "dashboard", "orders", "products", "inventory", "clients", "warehouses",
  "users", "receiving", "returns", "reports", "dock", "automation", "audit",
  "scan", "analytics", "shipping", "billing", "settings",
] as const;

const NAV_ICONS: Record<string, string> = {
  dashboard: "/icons/dashboard.png",
  orders: "/icons/orders.png",
  products: "/icons/products.png",
  inventory: "/icons/inventory.png",
  clients: "/icons/orders.png",
  warehouses: "/icons/warehouses.png",
  users: "/icons/users.png",
  receiving: "/icons/receiving.png",
  returns: "/icons/returns.png",
  reports: "/icons/analytics.png",
  dock: "/icons/shipping.png",
  automation: "/icons/automation.png",
  audit: "/icons/audit.png",
  scan: "/icons/scan.png",
  analytics: "/icons/analytics.png",
  shipping: "/icons/shipping.png",
  billing: "/icons/billing.png",
  settings: "/icons/settings.png",
};

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
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
        <div className="px-5 pt-11 pb-[38px]">
          <Link href="/saas/dashboard" className="inline-block">
            <img src="/logo.png" alt="Flowrid" className="h-9 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_KEYS.map((key) => {
            const href = `/saas/${key}`;
            const active = pathname === href;
            const icon = NAV_ICONS[key];
            const label = t(`saas.${key}`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#ed6d00] text-white shadow-sm"
                    : "text-[#1D1D1F] hover:bg-black/5"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center"><img src={icon} alt="" className="w-4 h-4" style={active ? { filter: "brightness(0) invert(1)" } : undefined} /></span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-black/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5 transition-all"
          >
            <span>&larr;</span> {t("saas.backToSite")}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all w-full text-left"
          >
            <span>&#x21AA;</span> {t("saas.signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 z-50 flex">
        {NAV_KEYS.slice(0, 5).map((key) => {
          const href = `/saas/${key}`;
          const active = pathname === href;
          const icon = NAV_ICONS[key];
          const label = t(`saas.${key}`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#ed6d00]" : "text-[#86868B]"
              }`}
            >
              <span className="text-base mb-0.5"><img src={icon} alt="" className="w-4 h-4" style={active ? { filter: "brightness(0) invert(1)" } : undefined} /></span>
              <span>{label}</span>
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
