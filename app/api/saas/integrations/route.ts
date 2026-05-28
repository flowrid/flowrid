// 集成管理 API — 通用 connect / status / disconnect
// 支持多平台: amazon, woocommerce, bigcommerce, ebay, walmart, netsuite, quickbooks, shipstation, edi

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { testWooCommerceConnection, saveWooCommerceCredentials } from "@/lib/woocommerce";
import { testShipStationConnection, saveShipStationCredentials } from "@/lib/shipstation";
import { saveAmazonCredentials } from "@/lib/amazon";
import { saveBigCommerceCredentials } from "@/lib/bigcommerce";
import { saveEbayCredentials } from "@/lib/ebay";
import { saveWalmartCredentials } from "@/lib/walmart";
import { saveNetSuiteCredentials } from "@/lib/netsuite";
import { saveQuickBooksCredentials } from "@/lib/quickbooks";
import { saveEDIConnection } from "@/lib/edi";

const SAVE_FN: Record<string, Function> = {
  amazon: saveAmazonCredentials,
  woocommerce: saveWooCommerceCredentials,
  bigcommerce: saveBigCommerceCredentials,
  ebay: saveEbayCredentials,
  walmart: saveWalmartCredentials,
  netsuite: saveNetSuiteCredentials,
  quickbooks: saveQuickBooksCredentials,
  shipstation: saveShipStationCredentials,
  edi: saveEDIConnection,
};

const TEST_FN: Record<string, Function> = {
  woocommerce: testWooCommerceConnection,
  shipstation: testShipStationConnection,
};

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase!
    .from("integration_connections")
    .select("*")
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ connections: data || [] });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const platform = body.platform as string;

  // Test connection
  if (body.action === "test") {
    const testFn = TEST_FN[platform];
    if (!testFn) return NextResponse.json({ error: "Test not supported for this platform" }, { status: 400 });
    const ok = await testFn(body.credentials || {});
    return NextResponse.json({ success: ok, message: ok ? "Connection successful" : "Connection failed" });
  }

  // Save connection
  const saveFn = SAVE_FN[platform];
  if (!saveFn) return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });

  const connectionId = await saveFn(operator.tenantId, body.credentials || {});
  if (!connectionId) return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });

  return NextResponse.json({ connectionId, platform, status: "connected" }, { status: 201 });
});

export const DELETE = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const platform = url.searchParams.get("platform");
  if (!platform) return NextResponse.json({ error: "platform required" }, { status: 400 });

  const supabase = createServiceClient();
  await supabase!
    .from("integration_connections")
    .delete()
    .eq("tenant_id", operator.tenantId)
    .eq("platform_name", platform);

  return NextResponse.json({ success: true });
});
