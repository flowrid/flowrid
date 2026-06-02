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
