import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { receiveInventory } from "@/lib/saas-wms";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { receivingId, warehouseId, items } = await request.json();
  if (!receivingId || !warehouseId || !items?.length) {
    return NextResponse.json({ error: "Missing receivingId, warehouseId, or items" }, { status: 400 });
  }

  try {
    await receiveInventory(receivingId, TENANT_ID, warehouseId, items);
    return NextResponse.json({ success: true, count: items.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
