"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-[#FF3B30]/10 text-[#FF3B30]",
  manager: "bg-[#ed6d00]/10 text-[#ed6d00]",
  supervisor: "bg-[#AF52DE]/10 text-[#AF52DE]",
  operator: "bg-[#007AFF]/10 text-[#007AFF]",
  picker: "bg-[#34C759]/10 text-[#34C759]",
  viewer: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function UsersPage() {
  const t = useTranslations("saasContent.users");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");

  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("operator");

  async function fetchUsers() {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      const r = await fetch(`/api/saas/users?${params.toString()}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setUsers(d.data || []);
      setStats(d.stats || { total: 0, active: 0 });
    } catch (e: any) {
      setError(e.message || t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setCreateMsg(t("nameEmailRequired"));
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const r = await fetch("/api/saas/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
      });
      if (r.ok) {
        setEmail(""); setName(""); setRole("operator");
        fetchUsers();
      } else {
        const err = await r.json();
        setCreateMsg(err.error || t("failedToCreate"));
      }
    } catch {
      setCreateMsg(t("networkError"));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(user: any) {
    try {
      await fetch(`/api/saas/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      fetchUsers();
    } catch { }
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchUsers(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );

  const roleOptions = ["admin", "manager", "supervisor", "operator", "picker", "viewer"];

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("title")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{t("subtitle", { total: stats.total, active: stats.active })}</p>
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">{t("allRoles")}</option>
          {roleOptions.map((r) => <option key={r} value={r}>{t(r as any)}</option>)}
        </select>
      </div>

      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("inviteUser")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("name")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("role")}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                {roleOptions.map((r) => <option key={r} value={r}>{t(r as any)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? t("creating") : t("inviteUserBtn")}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">{t("nameLabel")}</th>
                <th className="px-5 py-3.5">{t("emailLabel")}</th>
                <th className="px-5 py-3.5">{t("roleLabel")}</th>
                <th className="px-5 py-3.5">{t("status")}</th>
                <th className="px-5 py-3.5">{t("lastLogin")}</th>
                <th className="px-5 py-3.5 text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{u.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${ROLE_STYLES[u.role] || ""}`}>{cap(u.role)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${u.is_active ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>
                      {u.is_active ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : t("never")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => toggleActive(u)} className="text-xs text-[#ed6d00] font-medium hover:text-[#FF8A1F]">
                      {u.is_active ? t("deactivate") : t("activate")}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noUsers")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );
}
