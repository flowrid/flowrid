"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function NavUser() {
  const [user, setUser] = useState<{ email: string; role: string; avatar?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.email) {
        const meta = data.session.user.user_metadata;
        setUser({
          email: data.session.user.email,
          role: (meta?.role as string) || "brand",
          avatar: (meta?.avatar_url as string) || "",
        });
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      void loadUser();
    }, 0);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const meta = session.user.user_metadata;
        setUser({
          email: session.user.email,
          role: (meta?.role as string) || "brand",
          avatar: (meta?.avatar_url as string) || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      clearTimeout(timer);
      listener?.subscription.unsubscribe();
    };
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutside);
    };
  }, [open]);

  function handleOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }

  if (loading) {
    return <span className="w-12 h-5 bg-gray-200 rounded animate-pulse inline-block" />;
  }

  if (!user) {
    return (
      <a href="/login" className="text-sm text-text-secondary hover:text-text transition-colors">
        Login
      </a>
    );
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-1">
      <a
        href="/account"
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {user.email.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="truncate max-w-[100px]">{user.email.split("@")[0]}</span>
      </a>

      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-text-secondary hover:text-text transition-colors cursor-pointer"
      >
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
          <a
            href="/api/auth/signout"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-danger transition-colors"
          >
            Sign out
          </a>
        </div>
      )}
    </div>
  );
}
