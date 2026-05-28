// 审计日志 API
import { NextResponse } from "next/server";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { queryAuditLogs } from "@/lib/audit";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const data = await queryAuditLogs(operator.tenantId, {
    userId: url.searchParams.get("user_id") || undefined,
    action: url.searchParams.get("action") || undefined,
    entityType: url.searchParams.get("entity_type") || undefined,
    entityId: url.searchParams.get("entity_id") || undefined,
    dateFrom: url.searchParams.get("date_from") || undefined,
    dateTo: url.searchParams.get("date_to") || undefined,
    limit: parseInt(url.searchParams.get("limit") || "50"),
    offset: parseInt(url.searchParams.get("offset") || "0"),
  });

  return NextResponse.json(data);
});
