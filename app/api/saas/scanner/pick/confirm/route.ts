import { NextResponse } from "next/server";
import { confirmPickItem } from "@/lib/saas-wms";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { pickItemId, quantityPicked } = await request.json();
  if (!pickItemId || !quantityPicked) {
    return NextResponse.json({ error: "Missing pickItemId or quantityPicked" }, { status: 400 });
  }

  try {
    const result = await confirmPickItem(pickItemId, quantityPicked);
    if (!result) return NextResponse.json({ error: "Pick item not found" }, { status: 404 });
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
