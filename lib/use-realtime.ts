/**
 * Supabase Realtime 通知订阅 Hook
 *
 * 借鉴 Ever Demand 的 WebSocket Gateway 架构模式：
 * - Gateway 按角色广播 → Supabase Channel 按 user_id 过滤
 * - Socket.io 事件 → PostgreSQL changes 事件
 * - 替换轮询为推送订阅
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";

export interface RealtimeNotification {
  id: string;
  title: string;
  body?: string;
  type: "info" | "warning" | "success" | "error";
  category?: string;
  is_read: boolean;
  created_at: string;
}

interface UseRealtimeOptions {
  userId?: string;
  limit?: number;
}

export function useRealtimeNotifications(options: UseRealtimeOptions = {}) {
  const { userId, limit = 20 } = options;
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<NonNullable<ReturnType<typeof createBrowserClient>>['channel']>['subscribe']> | null>(null);

  // 初始加载
  const fetchInitial = useCallback(async () => {
    const supabase = createBrowserClient();
    if (!supabase) { setLoading(false); return; }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { setLoading(false); return; }

      const res = await fetch("/api/saas/notifications?limit=" + limit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setNotifications(d.data || []);
        setUnreadCount(d.unreadCount || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [limit]);

  // Supabase Realtime 订阅
  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) return;

    fetchInitial();

    // 订阅 notifications 表的 INSERT 事件
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as RealtimeNotification;
          // 过滤：仅处理当前用户的通知
          if (userId && (newNotif as any).user_id !== userId) return;

          setNotifications((prev) => [newNotif, ...prev].slice(0, limit));
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit, fetchInitial]);

  const markRead = useCallback(async (id: string) => {
    const supabase = createBrowserClient();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;

    await fetch("/api/saas/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mark_read: [id] }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    const supabase = createBrowserClient();
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;

    await fetch("/api/saas/notifications", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchInitial };
}
