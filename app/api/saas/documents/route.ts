// 单据生成 API — BOL / Packing Slip / Commercial Invoice
import { NextResponse } from "next/server";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { generateDocument } from "@/lib/documents";

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const doc = await generateDocument(operator.tenantId, {
    orderId: body.order_id,
    type: body.type || "packing_slip",
    shipmentId: body.shipment_id,
  });

  if (!doc) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return new NextResponse(doc.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${doc.type}_${doc.orderId.slice(0, 8)}.html"`,
    },
  });
});
