# Brand Account Navigation Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Brand Account 导航迁移为筛选后的 brand 端运营门户菜单，并保留 SaaS 的桌面左侧栏与移动底部栏交互结构。

**Architecture:** `lib/account-menu.ts` 作为 Brand Account 导航的唯一数据源，导出分组菜单和扁平菜单。`components/AccountSidebar.tsx` 负责复刻 SaaS layout 的桌面左侧栏与移动底部栏结构，但链接指向 `/account/*`。当前任务只改导航与布局结构，不迁移不适合 brand 端的 3PL/仓库内部操作页。

**Tech Stack:** Next.js App Router、React Client Components、TailwindCSS、Vitest。

---

## File Structure

- Modify: `lib/account-menu.ts`
  - 增加 `icon` 与 `group` 字段。
  - 导出 `BRAND_ACCOUNT_MENU_GROUPS` 分组菜单。
  - 保留 `BRAND_ACCOUNT_ITEMS` 作为扁平数组，兼容 `app/account/page.tsx`。
- Modify: `lib/account-menu.test.ts`
  - 更新菜单顺序测试，覆盖筛选后的 brand 端页面。
  - 增加断言，确保不包含不适合 brand 端的 SaaS 页面。
- Modify: `components/AccountSidebar.tsx`
  - 保留 SaaS 风格：桌面左侧固定侧栏、底部返回站点/退出登录、移动底部导航。
  - 使用 `BRAND_ACCOUNT_MENU_GROUPS` 渲染分组导航。
- Modify: `app/account/layout.tsx`
  - 从当前 `max-w` 两列布局改为 SaaS 式 `min-h-screen flex bg-[#F5F5F7]` 布局。
- No route creation in this plan.
  - 本计划只先落 brand 导航结构。
  - `/account/orders`、`/account/products` 等页面迁移属于后续页面迁移任务。

## Brand Menu Scope

### Include in Brand Account navigation

```ts
[
  "/account",
  "/account/orders",
  "/account/products",
  "/account/inventory",
  "/account/receiving",
  "/account/returns",
  "/account/shipping",
  "/account/analytics",
  "/account/reports",
  "/account/billing",
  "/account/integrations",
  "/account/automation",
  "/account/audit",
  "/account/compare",
  "/account/rfqs",
  "/account/saved",
  "/account/settings"
]
```

### Exclude from Brand Account navigation

```ts
[
  "/saas/clients",
  "/saas/warehouses",
  "/saas/users",
  "/saas/scan",
  "/saas/dock",
  "/saas/labor",
  "/saas/cycle-count",
  "/saas/inventory/transfer",
  "/saas/kitting",
  "/saas/containers"
]
```

---

### Task 1: Update menu data model and tests

**Files:**
- Modify: `lib/account-menu.ts`
- Modify: `lib/account-menu.test.ts`

- [ ] **Step 1: Replace `lib/account-menu.test.ts` with failing tests**

Write this exact file:

```ts
import { describe, expect, it } from "vitest";
import { BRAND_ACCOUNT_ITEMS, BRAND_ACCOUNT_MENU_GROUPS } from "./account-menu";

describe("brand account menu", () => {
  it("exposes the selected brand-side navigation destinations in account workspace order", () => {
    expect(BRAND_ACCOUNT_ITEMS.map((item) => item.href)).toEqual([
      "/account",
      "/account/orders",
      "/account/products",
      "/account/inventory",
      "/account/receiving",
      "/account/returns",
      "/account/shipping",
      "/account/analytics",
      "/account/reports",
      "/account/billing",
      "/account/integrations",
      "/account/automation",
      "/account/audit",
      "/account/compare",
      "/account/rfqs",
      "/account/saved",
      "/account/settings",
    ]);
  });

  it("groups navigation for a SaaS-style sidebar", () => {
    expect(BRAND_ACCOUNT_MENU_GROUPS.map((group) => group.label)).toEqual([
      "Workspace",
      "Operations",
      "Insights",
      "Growth",
      "Admin",
    ]);

    expect(BRAND_ACCOUNT_MENU_GROUPS[1].items.map((item) => item.label)).toEqual([
      "Orders",
      "Products",
      "Inventory",
      "Inbound",
      "Returns",
      "Shipping",
    ]);
  });

  it("does not expose warehouse-operator-only SaaS pages to brand users", () => {
    const hrefs = BRAND_ACCOUNT_ITEMS.map((item) => item.href);

    expect(hrefs).not.toContain("/account/clients");
    expect(hrefs).not.toContain("/account/warehouses");
    expect(hrefs).not.toContain("/account/users");
    expect(hrefs).not.toContain("/account/scan");
    expect(hrefs).not.toContain("/account/dock");
    expect(hrefs).not.toContain("/account/labor");
    expect(hrefs).not.toContain("/account/cycle-count");
    expect(hrefs).not.toContain("/account/inventory/transfer");
    expect(hrefs).not.toContain("/account/kitting");
    expect(hrefs).not.toContain("/account/containers");
  });

  it("keeps store integrations as a first-class account action", () => {
    expect(BRAND_ACCOUNT_ITEMS).toContainEqual(
      expect.objectContaining({
        label: "Store Integrations",
        href: "/account/integrations",
      })
    );
  });
});
```

- [ ] **Step 2: Run the menu test and verify it fails**

Run:

```powershell
npm test -- lib/account-menu.test.ts
```

Expected: FAIL because `BRAND_ACCOUNT_MENU_GROUPS` does not exist and the current item list is still the old RFQ-focused menu.

- [ ] **Step 3: Replace `lib/account-menu.ts` with the new menu model**

Write this exact file:

```ts
export type BrandAccountItem = {
  label: string;
  description: string;
  href: string;
  icon: string;
  accent: "primary" | "success" | "warning" | "neutral";
};

export type BrandAccountMenuGroup = {
  label: string;
  items: BrandAccountItem[];
};

export const BRAND_ACCOUNT_MENU_GROUPS: BrandAccountMenuGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        description: "Review your brand operations workspace and next actions.",
        href: "/account",
        icon: "/icons/dashboard.png",
        accent: "primary",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Orders",
        description: "Track ecommerce orders and fulfillment status.",
        href: "/account/orders",
        icon: "/icons/orders.png",
        accent: "primary",
      },
      {
        label: "Products",
        description: "Manage SKUs, product attributes, and catalog signals.",
        href: "/account/products",
        icon: "/icons/inventory.png",
        accent: "neutral",
      },
      {
        label: "Inventory",
        description: "Monitor stock levels and inventory health.",
        href: "/account/inventory",
        icon: "/icons/inventory.png",
        accent: "success",
      },
      {
        label: "Inbound",
        description: "Plan inbound shipments and ASN activity.",
        href: "/account/receiving",
        icon: "/icons/receiving.png",
        accent: "warning",
      },
      {
        label: "Returns",
        description: "Manage RMAs and return outcomes.",
        href: "/account/returns",
        icon: "/icons/receiving.png",
        accent: "warning",
      },
      {
        label: "Shipping",
        description: "Compare rates and manage outbound shipping actions.",
        href: "/account/shipping",
        icon: "/icons/shipping.png",
        accent: "primary",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        description: "Review order, inventory, and warehouse performance trends.",
        href: "/account/analytics",
        icon: "/icons/analytics.png",
        accent: "primary",
      },
      {
        label: "Reports",
        description: "Generate brand-side operational reports.",
        href: "/account/reports",
        icon: "/icons/analytics.png",
        accent: "neutral",
      },
      {
        label: "Billing",
        description: "Review invoices, usage, and fulfillment costs.",
        href: "/account/billing",
        icon: "/icons/billing.png",
        accent: "success",
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Store Integrations",
        description: "Connect Shopify and ecommerce data sources for better matching.",
        href: "/account/integrations",
        icon: "/icons/settings.png",
        accent: "success",
      },
      {
        label: "Automations",
        description: "Configure brand-side order, inventory, and notification rules.",
        href: "/account/automation",
        icon: "/icons/settings.png",
        accent: "warning",
      },
      {
        label: "Audit Log",
        description: "Review account, order, inventory, and integration changes.",
        href: "/account/audit",
        icon: "/icons/settings.png",
        accent: "neutral",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Compare Providers",
        description: "Open the provider comparison workspace.",
        href: "/account/compare",
        icon: "/icons/analytics.png",
        accent: "warning",
      },
      {
        label: "My RFQs",
        description: "Track requests for quotation and matched 3PL proposals.",
        href: "/account/rfqs",
        icon: "/icons/orders.png",
        accent: "primary",
      },
      {
        label: "Saved 3PL",
        description: "Review your shortlisted fulfillment providers.",
        href: "/account/saved",
        icon: "/icons/dashboard.png",
        accent: "neutral",
      },
      {
        label: "Account Settings",
        description: "Manage your profile, email, password, and preferences.",
        href: "/account/settings",
        icon: "/icons/settings.png",
        accent: "neutral",
      },
    ],
  },
];

export const BRAND_ACCOUNT_ITEMS: BrandAccountItem[] = BRAND_ACCOUNT_MENU_GROUPS.flatMap(
  (group) => group.items
);
```

- [ ] **Step 4: Run the menu test and verify it passes**

Run:

```powershell
npm test -- lib/account-menu.test.ts
```

Expected: PASS for all account menu tests.

- [ ] **Step 5: Commit Task 1**

Only if the user asked for commits. Otherwise skip commit.

```powershell
git add lib/account-menu.ts lib/account-menu.test.ts
git commit -m "更新 Brand Account 导航模型"
```

---

### Task 2: Convert AccountSidebar to SaaS-style desktop and mobile navigation

**Files:**
- Modify: `components/AccountSidebar.tsx`

- [ ] **Step 1: Replace `components/AccountSidebar.tsx`**

Write this exact file:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_ACCOUNT_MENU_GROUPS } from "@/lib/account-menu";

function isActivePath(pathname: string, href: string) {
  return href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountSidebar() {
  const pathname = usePathname();
  const primaryMobileItems = BRAND_ACCOUNT_MENU_GROUPS.flatMap((group) => group.items).slice(0, 5);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white/70 backdrop-blur-xl md:flex">
        <div className="px-5 pb-8 pt-10">
          <Link href="/account" className="inline-block">
            <img src="/flowrid-logo.png" alt="Flowrid" className="h-8 w-auto" />
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#86868B]">
            Brand Account
          </p>
          <p className="mt-2 text-sm leading-5 text-[#86868B]">
            Manage orders, inventory, billing, integrations, and provider decisions.
          </p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Brand account navigation">
          {BRAND_ACCOUNT_MENU_GROUPS.map((group) => (
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
            <span>&larr;</span> Back to Site
          </Link>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#86868B] transition-all hover:bg-[#FF3B30]/5 hover:text-[#FF3B30]"
          >
            <span>&#x21AA;</span> Sign Out
          </a>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-black/5 bg-white/80 backdrop-blur-xl md:hidden">
        {primaryMobileItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#ed6d00]" : "text-[#86868B]"
              }`}
            >
              <span className="mb-0.5 text-base">
                <img
                  src={item.icon}
                  alt=""
                  className="h-4 w-4"
                  style={active ? { filter: "brightness(0) saturate(100%) invert(47%) sepia(99%) saturate(1694%) hue-rotate(8deg) brightness(99%) contrast(101%)" } : undefined}
                />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run TypeScript/build validation for the component**

Run:

```powershell
npm run build
```

Expected: Build should either pass or reveal missing `/account/*` route issues from this navigation scope. If missing route issues appear, do not add unrelated pages in this task; record them for the page migration task.

- [ ] **Step 3: Commit Task 2**

Only if the user asked for commits. Otherwise skip commit.

```powershell
git add components/AccountSidebar.tsx
git commit -m "迁移 Brand Account 侧栏为 SaaS 风格"
```

---

### Task 3: Update account layout shell to match SaaS structure

**Files:**
- Modify: `app/account/layout.tsx`

- [ ] **Step 1: Replace `app/account/layout.tsx`**

Write this exact file:

```tsx
import AccountSidebar from "@/components/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <AccountSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run menu tests**

Run:

```powershell
npm test -- lib/account-menu.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: PASS if all referenced pages exist. If build passes even with non-existing link targets, page-response verification will still catch missing pages later.

- [ ] **Step 4: Commit Task 3**

Only if the user asked for commits. Otherwise skip commit.

```powershell
git add app/account/layout.tsx
git commit -m "调整 Brand Account 布局壳"
```

---

### Task 4: Verify destination routes and document page migration gaps

**Files:**
- No code changes required in this task.

- [ ] **Step 1: List existing account routes**

Run:

```powershell
Get-ChildItem "app/account" -Recurse -Filter page.tsx | ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\\", "") }
```

Expected existing routes before page migration:

```txt
app/account/page.tsx
app/account/rfqs/page.tsx
app/account/profile/page.tsx
app/account/settings/page.tsx
app/account/saved/page.tsx
app/account/integrations/page.tsx
```

- [ ] **Step 2: Record missing routes from the new brand menu**

Expected missing routes after Task 1:

```txt
app/account/orders/page.tsx
app/account/products/page.tsx
app/account/inventory/page.tsx
app/account/receiving/page.tsx
app/account/returns/page.tsx
app/account/shipping/page.tsx
app/account/analytics/page.tsx
app/account/reports/page.tsx
app/account/billing/page.tsx
app/account/automation/page.tsx
app/account/audit/page.tsx
app/account/compare/page.tsx
```

- [ ] **Step 3: Do not migrate excluded pages**

Confirm the following are not in `BRAND_ACCOUNT_ITEMS`:

```txt
/account/clients
/account/warehouses
/account/users
/account/scan
/account/dock
/account/labor
/account/cycle-count
/account/inventory/transfer
/account/kitting
/account/containers
```

- [ ] **Step 4: Commit Task 4**

No commit needed unless documentation is added in a separate task.

---

## Self-Review

- Spec coverage: The plan covers the approved scope: brand-side menu only, using the filtered page list, preserving SaaS-style desktop left navigation and mobile bottom navigation.
- Placeholder scan: No TBD/TODO placeholders are present. Missing routes are explicitly listed as page migration gaps, not hidden implementation work.
- Type consistency: `BrandAccountItem`, `BrandAccountMenuGroup`, `BRAND_ACCOUNT_MENU_GROUPS`, and `BRAND_ACCOUNT_ITEMS` are defined in Task 1 and consumed consistently in Task 2.
