"use client";

// 通知铃铛组件 — Notification Bell
// 顶部通知图标 + 下拉列表

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { authedFetch } from "@/lib/authed-fetch";

interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  category?: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  info: "i",
  warning: "!",
  success: "&#x2713;",
  error: "&#x2717;",
};

const TYPE_COLORS: Record<string, string> = {
  info: "bg-[#007AFF]",
  warning: "bg-[#FF9500]",
  success: "bg-[#34C759]",
  error: "bg-[#FF3B30]",
};

interface Props {
  onNotificationClick?: (n: Notification) => void;
}

export default function NotificationBell({ onNotificationClick }: Props) {
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const r = await authedFetch("/api/saas/notifications?limit=20");
      if (!r.ok) return;
      const d = await r.json();
      setNotifications(d.data || []);
      setUnreadCount(d.unreadCount || 0);
    } catch {}
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s 轮询
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markRead(id: string) {
    await authedFetch("/api/saas/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_read: [id] }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    setLoading(true);
    await authedFetch("/api/saas/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setLoading(false);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t("justNow");
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-black/5 transition-colors"
      >
        <svg className="w-5 h-5 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-black/5 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <span className="text-sm font-semibold text-[#1D1D1F]">{t("title")}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} disabled={loading} className="text-xs text-[#ed6d00] font-medium hover:text-[#FF8A1F]">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#86868B] text-sm">{t("noNotifications")}</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markRead(n.id);
                    onNotificationClick?.(n);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-black/[0.02] hover:bg-[#F5F5F7] transition-colors ${!n.is_read ? "bg-[#ed6d00]/[0.02]" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                      {n.type === "success" ? <>&#x2713;</> : n.type === "error" ? <>&#x2717;</> : n.type === "warning" ? "!" : "i"}
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
