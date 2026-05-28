// Kitting / 组装 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { assembleKit, disassembleKit } from "@/lib/kitting";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase!
    .from("kits")
    .select("*, kit_components(*, products(sku, name)), products!kits_kit_product_id_fkey(sku, name)")
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  // 创建 Kit 定义
  if (!body.action || body.action === "create") {
    const { data: kit, error } = await supabase!
      .from("kits")
      .insert({
        tenant_id: operator.tenantId,
        kit_product_id: body.kit_product_id,
        labor_cost: body.labor_cost,
        instructions: body.instructions,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (body.components?.length) {
      await supabase!.from("kit_components").insert(
        body.components.map((c: any) => ({
          kit_id: (kit as any).id,
          component_product_id: c.product_id,
          quantity_per_kit: c.quantity_per_kit || 1,
        }))
      );
    }

    return NextResponse.json({ kit }, { status: 201 });
  }

  // 执行组装
  if (body.action === "assemble") {
    const result = await assembleKit(operator.tenantId, body.warehouse_id, body.kit_product_id, body.quantity || 1, body.location_id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  // 执行拆解
  if (body.action === "disassemble") {
    const result = await disassembleKit(operator.tenantId, body.warehouse_id, body.kit_product_id, body.quantity || 1);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});
