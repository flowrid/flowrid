/**
 * Brand 端通知 API
 * GET: 获取当前 Brand 用户的通知列表
 * PATCH: 标记已读
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ data: [], unreadCount: 0 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ data: [], unreadCount: 0 });

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authData.user.id)
    .eq("is_read", false);

  return NextResponse.json({ data: data || [], unreadCount: unreadCount || 0 });
}

export async function PATCH(request: Request) {
  const supabase = createServerClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.mark_all_read) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", authData.user.id)
      .eq("is_read", false);
  } else if (body.mark_read && Array.isArray(body.mark_read)) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", authData.user.id)
      .in("id", body.mark_read);
  }

  return NextResponse.json({ success: true });
}
