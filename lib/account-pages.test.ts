import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const SAAS_SYNC_ROUTES = [
  "orders",
  "products",
  "inventory",
  "receiving",
  "returns",
  "shipping",
  "analytics",
  "reports",
  "billing",
] as const;

function readProjectFile(path: string) {
  return readFileSync(join(ROOT, ...path.split("/")), "utf8");
}

function readAccountPage(route: string) {
  return readFileSync(join(ROOT, "app", "account", ...route.split("/"), "page.tsx"), "utf8");
}

function accountPageFileExists(route: string) {
  return existsSync(join(ROOT, "app", "account", ...route.split("/"), "page.tsx"));
}

describe("brand account migrated operation pages", () => {
  it("routes the approved brand account pages via shared content components", () => {
    for (const route of SAAS_SYNC_ROUTES) {
      const accountPageExists = accountPageFileExists(route);
      expect(accountPageExists, `${route} page file should exist`).toBe(true);

      const pageSource = readAccountPage(route);
      expect(pageSource, `${route} page should re-export Content component`).toContain(`@/components/saas/`);

      const contentComponent = readProjectFile(`components/saas/${route.charAt(0).toUpperCase() + route.slice(1)}Content.tsx`);
      expect(contentComponent.length, `${route} Content component should not be empty`).toBeGreaterThan(100);
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
