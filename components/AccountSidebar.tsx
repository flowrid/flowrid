"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getBrandAccountMenuGroups } from "@/lib/account-menu";

function isActivePath(pathname: string, href: string) {
  return href === "/account"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const menuGroups = getBrandAccountMenuGroups(t);
  const primaryMobileItems = menuGroups.flatMap((group) => group.items).slice(0, 5);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white/70 backdrop-blur-xl md:flex">
        <div className="px-5 pb-8 pt-10">
          <Link href="/account" className="inline-block" aria-label="Flowrid account overview">
            <img src="/3pl-os-logo.png" alt="Flowrid" className="h-8 w-auto" />
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#86868B]">
            {t("account.brandAccount")}
          </p>
          <p className="mt-2 text-sm leading-5 text-[#86868B]">
            {t("account.desc")}
          </p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Brand account navigation">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-[#ed6d00] text-white shadow-sm"
                          : "text-[#1D1D1F] hover:bg-black/5"
                      }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center">
                        <img
                          src={item.icon}
                          alt=""
                          className="h-4 w-4"
                          style={active ? { filter: "brightness(0) invert(1)" } : undefined}
                        />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-black/5 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#86868B] transition-all hover:bg-black/5 hover:text-[#1D1D1F]"
          >
            <span>&larr;</span> {t("saas.backToSite")}
          </Link>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#86868B] transition-all hover:bg-[#FF3B30]/5 hover:text-[#FF3B30]"
          >
            <span>&#x21AA;</span> {t("account.signOut")}
          </a>
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-black/5 bg-white/80 backdrop-blur-xl md:hidden"
        aria-label="Brand account mobile navigation"
      >
        {primaryMobileItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#ed6d00]" : "text-[#86868B]"
              }`}
            >
              <span className="mb-0.5 flex h-4 w-4 items-center justify-center">
                <img
                  src={item.icon}
                  alt=""
                  className="h-4 w-4"
                  style={
                    active
                      ? {
                          filter:
                            "brightness(0) saturate(100%) invert(47%) sepia(99%) saturate(1694%) hue-rotate(8deg) brightness(99%) contrast(101%)",
                        }
                      : undefined
                  }
                />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
