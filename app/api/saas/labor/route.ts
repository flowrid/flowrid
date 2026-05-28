// 劳动力分析 API
import { NextResponse } from "next/server";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { getLaborAnalytics } from "@/lib/labor";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const warehouseId = url.searchParams.get("warehouse_id") || undefined;
  const days = parseInt(url.searchParams.get("days") || "30");

  const data = await getLaborAnalytics(operator.tenantId, warehouseId, days);
  return NextResponse.json(data);
});
