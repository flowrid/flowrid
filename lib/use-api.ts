"use client";

// 通用 API 请求 Hook — useApi
// 自动处理 loading / error / 自动刷新

import { useState, useCallback, useRef } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * 通用数据获取 Hook
 *
 * 用法:
 * const { data, loading, error, execute, refresh } = useApi<User[]>("/api/saas/users");
 */
export function useApi<T = any>(
  urlOrFn: string | (() => Promise<Response>),
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate !== false,
    error: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async (fetchOptions?: RequestInit): Promise<T | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = typeof urlOrFn === "function"
        ? await urlOrFn()
        : await fetch(urlOrFn as string, fetchOptions);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setState({ data, loading: false, error: null });
      optionsRef.current.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const message = err.message || "Network error";
      setState({ data: null, loading: false, error: message });
      optionsRef.current.onError?.(message);
      return null;
    }
  }, [urlOrFn]);

  const refresh = useCallback(() => execute(), [execute]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, refresh, reset };
}

/**
 * 通用 Mutation Hook
 *
 * 用法:
 * const { execute, loading, error } = useMutation("/api/saas/orders", "POST");
 */
export function useMutation<T = any>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE" = "POST"
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (body?: any): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message });
      return null;
    }
  }, [url, method]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * 防抖刷新 Hook
 */
export function useDebouncedRefresh(refreshFn: () => void, delay = 300) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  return useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(refreshFn, delay);
  }, [refreshFn, delay]);
}
