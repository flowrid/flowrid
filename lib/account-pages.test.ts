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
