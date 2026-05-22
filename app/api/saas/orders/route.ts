import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { routeOrder } from "@/lib/oms-routing";
import { dispatchWebhookEvent } from "@/lib/webhooks";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { safeErrorMessage } from "@/lib/errors";
import { OrderCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], clients: [], stats: {} });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")) || 1;
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "50"))) || 50;
  const offset = (page - 1) * perPage;

  const { data: orders, count } = await supabase
    .from("orders")
    .select("*, clients(name, company), warehouses(name, code)", { count: "exact" })
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .limit(200);

  const { count: pending } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .in("status", ["pending", "allocated", "picking"]);

  const { count: shipped } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .eq("status", "shipped");

  return NextResponse.json({
    data: orders ?? [],
    clients: clients ?? [],
    stats: {
      total: count ?? 0,
      pending: pending ?? 0,
      shipped: shipped ?? 0,
    },
    pagination: { page, per_page: perPage, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / perPage) },
  });
}

export async function POST(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json();
  const parsed = OrderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 422 });
  }
  Object.assign(body, parsed.data);

  let warehouseId = body.warehouse_id;

  if (!warehouseId && body.order_items && body.shipping_zip) {
    const result = await routeOrder(
      body.order_items,
      body.shipping_zip,
      TENANT_ID
    );
    if (result) {
      warehouseId = result.selected.warehouseId;
    }
  }

  if (!warehouseId) {
    const { data: defaultWh } = await supabase
      .from("warehouses")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    warehouseId = (defaultWh as any)?.id;
    if (!warehouseId) {
      return NextResponse.json({ error: "No warehouse available for this tenant" }, { status: 400 });
    }
  }

  // 显式列出允许的字段，防止字段注入
  const ALLOWED_ORDER_FIELDS = [
    "order_number", "external_order_id", "source",
    "customer_name", "customer_email",
    "shipping_address_line1", "shipping_address_line2",
    "shipping_city", "shipping_state", "shipping_zip", "shipping_country",
    "priority", "notes", "tracking_number",
    "client_id", "shipping_method", "created_at",
  ];

  const insertData: Record<string, unknown> = {
    tenant_id: TENANT_ID,
    warehouse_id: warehouseId,
  };
  for (const field of ALLOWED_ORDER_FIELDS) {
    if (field in body) {
      insertData[field] = body[field];
    }
  }

  const { data, error } = await supabase.from("orders").insert(insertData).select("*, warehouses(name, code)").single();

  if (error) return NextResponse.json({ error: safeErrorMessage(error) }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Failed to create order" }, { status: 500 });

  if (body.order_items && Array.isArray(body.order_items) && body.order_items.length > 0) {
    const allowedItemFields = ["product_id", "quantity_ordered", "unit_price", "notes"];
    await supabase.from("order_items").insert(
      body.order_items.map((item: any) => {
        const itemData: Record<string, unknown> = {
          order_id: (data as any).id,
          quantity_picked: 0,
          quantity_packed: 0,
          quantity_shipped: 0,
        };
        for (const key of allowedItemFields) {
          if (item[key] !== undefined) itemData[key] = item[key];
        }
        return itemData;
      })
    );
  }

  const created = data as Record<string, unknown> | null;
  if (created?.id) {
    dispatchWebhookEvent(TENANT_ID, "order.created", {
      order_id: created.id,
      order_number: created.order_number ?? body.order_number,
      status: created.status ?? "pending",
      customer_name: body.customer_name ?? null,
      shipping_zip: body.shipping_zip ?? null,
    });
  }

  return NextResponse.json(data);
}
