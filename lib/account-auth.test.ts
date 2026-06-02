import { describe, expect, it } from "vitest";
import { getBearerToken, isAllowedBrandRole } from "./account-auth";

describe("account auth helpers", () => {
  it("extracts a bearer token from the authorization header", () => {
    const req = new Request("https://www.flowrid.com/api/account/integrations", {
      headers: { Authorization: "Bearer supabase-access-token" },
    });

    expect(getBearerToken(req)).toBe("supabase-access-token");
  });

  it("returns null for missing or malformed authorization headers", () => {
    expect(getBearerToken(new Request("https://www.flowrid.com"))).toBeNull();
    expect(
      getBearerToken(
        new Request("https://www.flowrid.com", {
          headers: { Authorization: "Basic abc" },
        })
      )
    ).toBeNull();
  });

  it("allows missing roles as brand users and rejects 3pl roles", () => {
    expect(isAllowedBrandRole(undefined)).toBe(true);
    expect(isAllowedBrandRole("brand")).toBe(true);
    expect(isAllowedBrandRole("3pl")).toBe(false);
  });
});
