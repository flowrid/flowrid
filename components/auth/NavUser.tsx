"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function NavUser() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user?.email) {
        const meta = data.session.user.user_metadata;
        setUser({
          email: data.session.user.email,
          role: (meta?.role as string) || "brand",
        });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const meta = session.user.user_metadata;
        setUser({
          email: session.user.email,
          role: (meta?.role as string) || "brand",
        });
      } else {
        setUser(null);
      }
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

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

  const isBrand = user.role === "brand";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
      >
        <span className="truncate max-w-[120px]">{user.email.split("@")[0]}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
          {/* 角色标签 */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              {isBrand ? "Brand Account" : "3PL Partner"}
            </p>
          </div>

          {isBrand ? (
            <>
              <a href="/account/rfqs" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
                My RFQs
              </a>
              <a href="/account/saved" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
                Saved 3PLs
              </a>
              <a href="/compare" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
                Compare List
              </a>
            </>
          ) : (
            <>
              <a href="/account/profile" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
                Company Profile
              </a>
              <a href="/account/rfqs" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
                Received RFQs
              </a>
            </>
          )}

          <div className="border-t border-border mt-1 pt-1">
            <a href="/account/settings" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text transition-colors">
              Account Settings
            </a>
            <a href="/api/auth/signout"
              className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-danger transition-colors">
              Sign out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
