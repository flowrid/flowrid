// 报表 API
import { NextResponse } from "next/server";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ReportQuerySchema } from "@/lib/validation";
import { generateReport } from "@/lib/reports";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const params = ReportQuerySchema.parse(Object.fromEntries(url.searchParams));

  const report = await generateReport(operator.tenantId, params as any);
  return NextResponse.json(report);
});
