"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Operator {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: "free" | "pro" | "enterprise";
}

interface WarehouseSelection {
  id: string;
  name: string;
  code: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppState {
  operator: Operator | null;
  tenant: TenantInfo | null;
  activeWarehouse: WarehouseSelection | null;
  toasts: Toast[];
}

interface AppContextValue extends AppState {
  setOperator: (op: Operator | null) => void;
  setTenant: (t: TenantInfo | null) => void;
  setActiveWarehouse: (w: WarehouseSelection | null) => void;
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const FlowridAppContext = createContext<AppContextValue | null>(null);

let toastCounter = 0;

export function AppProvider({ children, initial }: { children: ReactNode; initial?: Partial<AppState> }) {
  const [operator, setOperator] = useState<Operator | null>(initial?.operator ?? null);
  const [tenant, setTenant] = useState<TenantInfo | null>(initial?.tenant ?? null);
  const [activeWarehouse, setActiveWarehouse] = useState<WarehouseSelection | null>(initial?.activeWarehouse ?? null);
  const [toasts, setToasts] = useState<Toast[]>(initial?.toasts ?? []);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => setToasts([]), []);

  return React.createElement(
    FlowridAppContext.Provider,
    {
      value: {
        operator, setOperator,
        tenant, setTenant,
        activeWarehouse, setActiveWarehouse,
        toasts, addToast, removeToast, clearToasts,
      },
    },
    children
  );
}

export function useAppContext() {
  const ctx = useContext(FlowridAppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within <AppProvider>");
  }
  return ctx;
}
