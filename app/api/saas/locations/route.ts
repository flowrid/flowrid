import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { LocationCreateSchema } from "@/lib/validation";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], zones: [] });

  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouse_id");
  const zone = searchParams.get("zone");
  const search = searchParams.get("search") || "";

  if (!warehouseId || !UUID_RE.test(warehouseId)) {
    return NextResponse.json({ error: "warehouse_id is required" }, { status: 400 });
  }

  // 验证仓库属于当前租户
  const { data: wh } = await supabase
    .from("warehouses")
    .select("id")
    .eq("tenant_id", operator.tenantId)
    .eq("id", warehouseId)
    .single();

  if (!wh) return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });

  let query = supabase
    .from("locations")
    .select("*")
    .eq("warehouse_id", warehouseId)
    .order("zone", { ascending: true })
    .order("aisle", { ascending: true })
    .order("rack", { ascending: true })
    .order("shelf", { ascending: true })
    .order("bin", { ascending: true });

  if (zone) query = query.eq("zone", zone);
  if (search) {
    const s = search.replace(/[%_]/g, "").trim();
    if (s) query = query.or(`barcode.ilike.*${s}*,zone.ilike.*${s}*,aisle.ilike.*${s}*`);
  }

  const { data: locations } = await query;

  // 获取所有 zone（用于筛选器）
  const { data: zones } = await supabase
    .from("locations")
    .select("zone")
    .eq("warehouse_id", warehouseId)
    .order("zone");

  const uniqueZones = [...new Set((zones || []).map((z: any) => z.zone))];

  return NextResponse.json({
    data: locations || [],
    zones: uniqueZones,
    stats: {
      total: locations?.length || 0,
      occupied: locations?.filter((l: any) => l.is_occupied).length || 0,
    },
  });
}

async function handlePost(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = (req as any).validatedBody;

  // 验证仓库归属
  const { data: wh } = await supabase
    .from("warehouses")
    .select("id")
    .eq("tenant_id", operator.tenantId)
    .eq("id", body.warehouse_id)
    .single();

  if (!wh) return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });

  const barcode = body.barcode || `${body.zone}-${body.aisle || ""}-${body.rack || ""}-${body.shelf || ""}-${body.bin || ""}`.replace(/-+$/, "").replace(/--/g, "-");

  const { data, error } = await supabase
    .from("locations")
    .insert({
      warehouse_id: body.warehouse_id,
      zone: body.zone,
      aisle: body.aisle || null,
      rack: body.rack || null,
      shelf: body.shelf || null,
      bin: body.bin || null,
      barcode,
      max_weight_lbs: body.max_weight_lbs || null,
      max_volume_cuft: body.max_volume_cuft || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ location: data });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: LocationCreateSchema });
