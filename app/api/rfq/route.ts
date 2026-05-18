import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * RFQ API — 接收询盘请求并存入 Supabase
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 基础验证
    if (!body.email || !body.category) {
      return NextResponse.json(
        { success: false, error: "Email and category are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("rfq_requests").insert([
      {
        name: body.name || "",
        email: body.email,
        company: body.company || "",
        state: body.state || "",
        category: body.category,
        platform: body.platform || "",
        message: body.message || "",
      },
    ]);

    if (error) {
      console.error("RFQ insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RFQ API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
