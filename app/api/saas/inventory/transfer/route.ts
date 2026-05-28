// 库存转移 API
import { NextResponse } from "next/server";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { executeTransfer } from "@/lib/transfer";

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = await executeTransfer(operator.tenantId, operator.userId, body);
  return NextResponse.json(result, { status: result.status === "failed" ? 400 : 200 });
});
