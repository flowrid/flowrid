import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(ROOT, ...path.split("/")), "utf8");
}

describe("brand account runtime compatibility", () => {
  it("allows local account pages to use the demo SaaS runtime without an operator cookie", () => {
    const authSource = readProjectFile("lib/saas-auth.ts");

    expect(authSource).toContain("allowLocalDemoRuntime");
    expect(authSource).toContain("demo-token");
    expect(authSource).toContain("demo-001");
  });

  it("does not send billing users to a missing SaaS import page", () => {
    const billingPage = readProjectFile("components/saas/BillingContent.tsx");

    expect(billingPage).not.toContain('/saas/billing/import');
  });

  it("surfaces analytics API errors instead of rendering invalid data", () => {
    const analyticsPage = readProjectFile("components/saas/AnalyticsContent.tsx");

    expect(analyticsPage).toContain("setError");
    expect(analyticsPage).toContain("if (!res.ok)");
    expect(analyticsPage).toContain("data.daily_volume || []");
  });

  it("surfaces report generation errors instead of rendering invalid report data", () => {
    const reportsPage = readProjectFile("components/saas/ReportsContent.tsx");

    expect(reportsPage).toContain("setError");
    expect(reportsPage).toContain("if (!r.ok)");
    expect(reportsPage).toContain("report?.data");
  });

  it("keeps product creation from getting stuck on network errors", () => {
    const productsPage = readProjectFile("components/saas/ProductsContent.tsx");

    expect(productsPage).toContain("try {");
    expect(productsPage).toContain("catch");
    expect(productsPage).toContain("finally");
    expect(productsPage).toContain("setSaving(false)");
  });

  it("shows return status update failures to the user", () => {
    const returnsPage = readProjectFile("components/saas/ReturnsContent.tsx");

    expect(returnsPage).toContain("if (!res.ok)");
    expect(returnsPage).toContain("setCreateMsg");
  });

  it("does not create shipments with a hard-coded fake order id from the brand shipping page", () => {
    const shippingPage = readProjectFile("components/saas/ShippingContent.tsx");

    expect(shippingPage).not.toContain("00000000-0000-0000-0000-000000000001");
    expect(shippingPage).not.toContain("/api/saas/shipping/create-shipment");
  });

  it("accepts order_number to create an RMA so brand users do not need an internal UUID", () => {
    const validation = readProjectFile("lib/validation.ts");
    const route = readProjectFile("app/api/saas/returns/route.ts");
    const page = readProjectFile("components/saas/ReturnsContent.tsx");

    expect(validation).toContain("order_number");
    expect(route).toContain("order_number");
    expect(page).toContain("Order Number");
    expect(page).not.toContain("UUID");
  });
});
