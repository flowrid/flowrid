"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function NavUser() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user?.email) {
        setUser({ email: data.session.user.email });
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <span className="w-12 h-5 bg-gray-200 rounded animate-pulse" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary truncate max-w-[140px]">
          {user.email.split("@")[0]}
        </span>
        <a
          href="/api/auth/signout"
          className="text-xs text-text-secondary hover:text-danger transition-colors"
        >
          Sign out
        </a>
      </div>
    );
  }

  return (
    <a href="/login" className="hover:text-text transition-colors">
      Login
    </a>
  );
}
