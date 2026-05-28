// 通知中心 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { NotificationListSchema } from "@/lib/validation";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread_only") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  let query = supabase!
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  // 匹配当前用户或被广播的通知 (user_id IS NULL)
  query = query.or(`user_id.eq.${operator.userId},user_id.is.null`);

  if (unreadOnly) query = query.eq("is_read", false);

  const { data, count } = await query;

  const unreadCount = (data || []).filter((n: any) => !n.is_read).length;

  return NextResponse.json({ data, total: count, unreadCount });
});

export const PATCH = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  // 标记已读
  if (body.mark_read) {
    const ids = Array.isArray(body.mark_read) ? body.mark_read : [body.mark_read];
    await supabase!
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("tenant_id", operator.tenantId);

    return NextResponse.json({ success: true });
  }

  // 全部已读
  if (body.mark_all_read) {
    await supabase!
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("tenant_id", operator.tenantId)
      .eq("is_read", false)
      .or(`user_id.eq.${operator.userId},user_id.is.null`);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});
