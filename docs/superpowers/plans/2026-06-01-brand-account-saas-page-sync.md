# Brand Account SaaS Page Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/saas` 中已经跑通的真实业务页面同步到 Brand Account 的 `/account` 菜单页面，替换当前多个页面共用同一占位壳的问题。

**Architecture:** 短期采用页面级复用：`/account/*` 对应页面直接 re-export 已跑通的 `/saas/*` 页面组件，让 Brand 用户后台先看到真实 Orders / Products / Inventory / Receiving / Returns / Shipping / Analytics / Reports / Billing 功能。保留现有 `/account` 布局和菜单；API 仍沿用 `/api/saas/*`，后续再单独做 Brand API 权限与命名重构。

**Tech Stack:** Next.js App Router、React Client Components、Vitest、PowerShell、TailwindCSS。

---

## File Structure

- Modify: `app/account/orders/page.tsx`
  - Re-export `@/app/saas/orders/page`.
- Modify: `app/account/products/page.tsx`
  - Re-export `@/app/saas/products/page`.
- Modify: `app/account/inventory/page.tsx`
  - Re-export `@/app/saas/inventory/page`.
- Modify: `app/account/receiving/page.tsx`
  - Re-export `@/app/saas/receiving/page`.
- Modify: `app/account/returns/page.tsx`
  - Re-export `@/app/saas/returns/page`.
- Modify: `app/account/shipping/page.tsx`
  - Re-export `@/app/saas/shipping/page`.
- Modify: `app/account/analytics/page.tsx`
  - Re-export `@/app/saas/analytics/page`.
- Modify: `app/account/reports/page.tsx`
  - Re-export `@/app/saas/reports/page`.
- Modify: `app/account/billing/page.tsx`
  - Re-export `@/app/saas/billing/page`.
- Modify: `lib/account-pages.test.ts`
  - Replace the old anti-SaaS re-export assertion with explicit assertions that these 9 account pages sync from their SaaS counterparts.
  - Keep exclusion tests for warehouse/operator-only routes.
  - Keep Next 16 async params tests for account detail pages.
  - Keep `/account/compare` as a brand-owned page, not public compare.

---

### Task 1: Update regression tests to reflect方案 A

**Files:**
- Modify: `lib/account-pages.test.ts`

- [ ] **Step 1: Replace `lib/account-pages.test.ts` with tests for SaaS page sync**

Write this exact file:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const SAAS_SYNC_ACCOUNT_PAGES = [
  ["orders", "@/app/saas/orders/page"],
  ["products", "@/app/saas/products/page"],
  ["inventory", "@/app/saas/inventory/page"],
  ["receiving", "@/app/saas/receiving/page"],
  ["returns", "@/app/saas/returns/page"],
  ["shipping", "@/app/saas/shipping/page"],
  ["analytics", "@/app/saas/analytics/page"],
  ["reports", "@/app/saas/reports/page"],
  ["billing", "@/app/saas/billing/page"],
] as const;

function readAccountPage(route: string) {
  return readFileSync(join(ROOT, "app", "account", ...route.split("/"), "page.tsx"), "utf8");
}

describe("brand account migrated operation pages", () => {
  it("syncs the approved brand account pages from the working SaaS system", () => {
    for (const [route, sourcePath] of SAAS_SYNC_ACCOUNT_PAGES) {
      const source = readAccountPage(route);

      expect(source, route).toContain(`export { default } from "${sourcePath}"`);
    }
  });

  it("keeps excluded warehouse-operator modules out of brand routes", () => {
    const excluded = [
      "clients",
      "warehouses",
      "users",
      "scan",
      "dock",
      "labor",
      "cycle-count",
      "kitting",
      "containers",
    ];

    for (const route of excluded) {
      expect(() => readAccountPage(route), route).toThrow();
    }
  });

  it("uses Next 16 async params for brand account detail pages", () => {
    for (const route of ["orders/[id]", "products/[id]"]) {
      const source = readAccountPage(route);

      expect(source, route).toContain("params: Promise<{ id: string }>");
      expect(source, route).toContain("const { id } = await params");
      expect(source, route).not.toContain("params.id");
    }
  });

  it("keeps account compare as a brand-owned page instead of re-exporting public compare", () => {
    const source = readAccountPage("compare");

    expect(source).not.toContain("@/app/compare/page");
    expect(source).toContain("BrandOperationPage");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails before implementation**

Run:

```powershell
npm --prefix "E:\Flowrid\flowrid" test -- lib/account-pages.test.ts
```

Expected: FAIL because the 9 account pages still render `BrandOperationPage` placeholders instead of re-exporting their SaaS counterparts.

---

### Task 2: Replace Operations account placeholder pages with SaaS pages

**Files:**
- Modify: `app/account/orders/page.tsx`
- Modify: `app/account/products/page.tsx`
- Modify: `app/account/inventory/page.tsx`
- Modify: `app/account/receiving/page.tsx`
- Modify: `app/account/returns/page.tsx`
- Modify: `app/account/shipping/page.tsx`

- [ ] **Step 1: Replace `app/account/orders/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/orders/page";
```

- [ ] **Step 2: Replace `app/account/products/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/products/page";
```

- [ ] **Step 3: Replace `app/account/inventory/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/inventory/page";
```

- [ ] **Step 4: Replace `app/account/receiving/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/receiving/page";
```

- [ ] **Step 5: Replace `app/account/returns/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/returns/page";
```

- [ ] **Step 6: Replace `app/account/shipping/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/shipping/page";
```

- [ ] **Step 7: Run account page tests**

Run:

```powershell
npm --prefix "E:\Flowrid\flowrid" test -- lib/account-pages.test.ts
```

Expected: partial PASS/FAIL. Operations page sync assertions should pass for the first 6 pages; Insights page sync assertions should still fail until Task 3.

---

### Task 3: Replace Insights account placeholder pages with SaaS pages

**Files:**
- Modify: `app/account/analytics/page.tsx`
- Modify: `app/account/reports/page.tsx`
- Modify: `app/account/billing/page.tsx`

- [ ] **Step 1: Replace `app/account/analytics/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/analytics/page";
```

- [ ] **Step 2: Replace `app/account/reports/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/reports/page";
```

- [ ] **Step 3: Replace `app/account/billing/page.tsx`**

Write this exact file:

```ts
export { default } from "@/app/saas/billing/page";
```

- [ ] **Step 4: Run account page tests**

Run:

```powershell
npm --prefix "E:\Flowrid\flowrid" test -- lib/account-pages.test.ts
```

Expected: PASS. The 9 approved account pages now sync from the working SaaS system.

---

### Task 4: Run full verification and inspect routes

**Files:**
- No code changes expected.

- [ ] **Step 1: Run account-related tests**

Run:

```powershell
npm --prefix "E:\Flowrid\flowrid" test -- lib/account-pages.test.ts lib/account-menu.test.ts lib/account-auth.test.ts
```

Expected: PASS with all account-related tests green.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm --prefix "E:\Flowrid\flowrid" run build
```

Expected: PASS. Build should list these routes:

```txt
/account/orders
/account/products
/account/inventory
/account/receiving
/account/returns
/account/shipping
/account/analytics
/account/reports
/account/billing
```

- [ ] **Step 3: Verify local pages if dev server is running**

If `E:\Flowrid\flowrid` dev server is running on port 3002, request:

```powershell
$paths = @(
  "/account/orders",
  "/account/products",
  "/account/inventory",
  "/account/receiving",
  "/account/returns",
  "/account/shipping",
  "/account/analytics",
  "/account/reports",
  "/account/billing"
)
foreach ($path in $paths) {
  $r = Invoke-WebRequest -Uri "http://localhost:3002$path" -UseBasicParsing -TimeoutSec 10
  "$path => $($r.StatusCode)"
}
```

Expected: every path returns `200`.

---

## Self-Review

- Spec coverage: Covers方案 A exactly: Operations six pages and Insights three pages are synced from the previously working SaaS pages. It intentionally does not migrate warehouse/operator-only pages.
- Placeholder scan: No TBD/TODO placeholders are present. The plan contains exact file contents and exact commands.
- Type consistency: Test constants match exact page paths and re-export strings used by implementation tasks.
- Scope check: API still uses `/api/saas/*` by design for this fast sync phase; Brand-specific API and permission refactor is deferred to a separate future plan.
