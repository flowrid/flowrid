"use client";

/**
 * 通知铃铛组件 — Notification Bell
 *
 * v2: 基于 Supabase Realtime 订阅，替代 30s 轮询
 * 借鉴 Ever Demand WebSocket Gateway 模式：
 *   - 实时推送替代定时轮询
 *   - 未读计数 + 下拉列表
 */

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRealtimeNotifications, type RealtimeNotification } from "@/lib/use-realtime";

const TYPE_COLORS: Record<string, string> = {
  info: "bg-[#007AFF]",
  warning: "bg-[#FF9500]",
  success: "bg-[#34C759]",
  error: "bg-[#FF3B30]",
};

interface Props {
  onNotificationClick?: (n: RealtimeNotification) => void;
  userId?: string;
  /** SaaS 用 /api/saas/notifications，Brand 用 /api/account/notifications */
  apiPrefix?: "saas" | "account";
}

export default function NotificationBell({ onNotificationClick, userId, apiPrefix = "saas" }: Props) {
  const t = useTranslations("notifications");
  const { notifications, unreadCount, loading, markRead, markAllRead } = useRealtimeNotifications({ userId });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t("justNow");
    if (min < 60) return t("minutesAgo", { n: min });
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return t("hoursAgo", { n: hrs });
    return t("daysAgo", { n: Math.floor(hrs / 24) });
  }

  return (
    <div ref={ref} className="relative">
      {/* 铃铛按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-black/5 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center leading-none px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-black/5 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <span className="text-sm font-semibold text-[#1D1D1F]">{t("title")}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#ed6d00] font-medium hover:underline">
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#86868B] text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#86868B] text-sm">{t("noNotifications")}</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markRead(n.id);
                    setOpen(false);
                    onNotificationClick?.(n);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-black/[0.02] hover:bg-[#F5F5F7] transition-colors ${!n.is_read ? "bg-[#ed6d00]/[0.03]" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                      {n.type === "success" ? "✓" : n.type === "error" ? "✗" : n.type === "warning" ? "!" : "i"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1D1D1F] truncate">{n.title}</div>
                      {n.body && <div className="text-xs text-[#86868B] mt-0.5 line-clamp-2">{n.body}</div>}
                      <div className="text-[10px] text-[#86868B] mt-1">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#ed6d00] shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
