// 审计日志 — Audit Trail
// 记录所有关键操作，支持追溯和合规

import { createServiceClient } from "@/lib/supabase";

export type AuditAction =
  | "order.created" | "order.updated" | "order.deleted" | "order.status_changed"
  | "product.created" | "product.updated" | "product.deleted"
  | "inventory.adjusted" | "inventory.transferred" | "inventory.received"
  | "user.created" | "user.updated" | "user.deactivated" | "user.login"
  | "warehouse.created" | "warehouse.updated"
  | "location.created" | "location.updated"
  | "shipment.created" | "shipment.cancelled"
  | "return.created" | "return.processed"
  | "settings.updated" | "integration.connected" | "integration.disconnected"
  | "billing.updated" | "api_key.created" | "api_key.revoked"
  | "qc.check_completed"
  | string;

export interface AuditEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * 写入审计日志 — 异步不阻塞
 */
export async function writeAuditLog(entry: AuditEntry) {
  const supabase = createServiceClient();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    tenant_id: entry.tenantId,
    user_id: entry.userId || null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId || null,
    old_values: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
    new_values: entry.newValues ? JSON.stringify(entry.newValues) : null,
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
  }).select("*");
}

/**
 * 便捷函数 — 从 Request 提取上下文并记录
 */
export async function audit(
  req: Request,
  tenantId: string,
  userId: string | undefined,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  metadata?: Record<string, any>,
) {
  writeAuditLog({
    tenantId,
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
    metadata,
  }).catch(() => {});
}

/**
 * 查询审计日志
 */
export async function queryAuditLogs(
  tenantId: string,
  options?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const supabase = createServiceClient();
  if (!supabase) return { data: [], total: 0 };

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1);

  if (options?.userId) query = query.eq("user_id", options.userId);
  if (options?.action) query = query.eq("action", options.action);
  if (options?.entityType) query = query.eq("entity_type", options.entityType);
  if (options?.entityId) query = query.eq("entity_id", options.entityId);
  if (options?.dateFrom) query = query.gte("created_at", options.dateFrom);
  if (options?.dateTo) query = query.lte("created_at", options.dateTo);

  const { data, count } = await query;

  return {
    data: (data || []).map((e: any) => ({
      ...e,
      old_values: typeof e.old_values === "string" ? safeJsonParse(e.old_values) : e.old_values,
      new_values: typeof e.new_values === "string" ? safeJsonParse(e.new_values) : e.new_values,
      metadata: typeof e.metadata === "string" ? safeJsonParse(e.metadata) : e.metadata,
    })),
    total: count || 0,
  };
}

function safeJsonParse(s: string | null) {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return s; }
}
