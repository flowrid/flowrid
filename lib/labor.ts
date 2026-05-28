// 劳动力分析 — Labor Analytics
// 拣货员效率、工时统计、绩效指标

import { createServiceClient } from "@/lib/supabase";

export interface PickerStats {
  userId: string;
  userName?: string;
  tasksCompleted: number;
  itemsPicked: number;
  totalTimeMin: number;
  avgTimePerTaskMin: number;
  avgTimePerItemMin: number;
  accuracy: number;
  periodStart: string;
  periodEnd: string;
}

export interface LaborSummary {
  totalPickers: number;
  totalTasks: number;
  totalItemsPicked: number;
  avgProductivity: number; // items/hour
  pickers: PickerStats[];
}

/**
 * 获取劳动力分析数据
 */
export async function getLaborAnalytics(
  tenantId: string,
  warehouseId?: string,
  days: number = 30
): Promise<LaborSummary | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const start = new Date();
  start.setDate(start.getDate() - days);
  const end = new Date();

  let taskQuery = supabase
    .from("pick_tasks")
    .select("*, pick_items(quantity_picked)")
    .eq("tenant_id", tenantId)
    .gte("started_at", start.toISOString())
    .lte("started_at", end.toISOString());

  if (warehouseId) taskQuery = taskQuery.eq("warehouse_id", warehouseId);

  const { data: tasks } = await taskQuery;

  // 按拣货员分组
  const byPicker: Record<string, { tasks: any[]; itemsPicked: number; totalTime: number }> = {};

  for (const task of tasks || []) {
    if (!task.assigned_to) continue;
    const uid = task.assigned_to;
    if (!byPicker[uid]) byPicker[uid] = { tasks: [], itemsPicked: 0, totalTime: 0 };

    byPicker[uid].tasks.push(task);
    const items = (task.pick_items || []).reduce((s: number, pi: any) => s + (pi.quantity_picked || 0), 0);
    byPicker[uid].itemsPicked += items;

    if (task.started_at && task.completed_at) {
      byPicker[uid].totalTime += (new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 60000;
    }
  }

  // 获取用户名称
  const userIds = Object.keys(byPicker);
  let userNames: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);
    for (const u of users || []) {
      userNames[(u as any).id] = (u as any).name;
    }
  }

  const pickers: PickerStats[] = userIds.map((uid) => {
    const p = byPicker[uid];
    const completed = p.tasks.filter((t: any) => t.status === "complete").length;
    return {
      userId: uid,
      userName: userNames[uid] || "Unknown",
      tasksCompleted: completed,
      itemsPicked: p.itemsPicked,
      totalTimeMin: Math.round(p.totalTime * 10) / 10,
      avgTimePerTaskMin: completed > 0 ? Math.round((p.totalTime / completed) * 10) / 10 : 0,
      avgTimePerItemMin: p.itemsPicked > 0 ? Math.round((p.totalTime / p.itemsPicked) * 100) / 100 : 0,
      accuracy: p.tasks.length > 0 ? Math.round((completed / p.tasks.length) * 100) : 0,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    };
  });

  const totalItems = pickers.reduce((s, p) => s + p.itemsPicked, 0);
  const totalHours = pickers.reduce((s, p) => s + p.totalTimeMin, 0) / 60;

  return {
    totalPickers: pickers.length,
    totalTasks: pickers.reduce((s, p) => s + p.tasksCompleted, 0),
    totalItemsPicked: totalItems,
    avgProductivity: totalHours > 0 ? Math.round(totalItems / totalHours) : 0,
    pickers: pickers.sort((a, b) => b.itemsPicked - a.itemsPicked),
  };
}
