"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  client_since?: string;
  billing_terms?: string;
}

export default function ClientsPage() {
  const t = useTranslations("saasContent.clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");

  async function fetchClients() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const r = await fetch(`/api/saas/clients?${params.toString()}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setClients(d.data || []);
    } catch (e: any) {
      setError(e.message || t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchClients(); }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setCreateMsg(t("nameEmailRequired"));
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const r = await fetch("/api/saas/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), company: company.trim() || undefined, email: email.trim(), phone: phone.trim() || undefined, address_city: addrCity.trim() || undefined, address_state: addrState.trim() || undefined }),
      });
      if (r.ok) {
        setName(""); setCompany(""); setEmail(""); setPhone(""); setAddrCity(""); setAddrState("");
        fetchClients();
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

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/saas/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch { } finally {
      setDeleting(null);
    }
  }

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchClients(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("title")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{clients.length === 1 ? t("subtitle_one", { n: clients.length }) : t("subtitle_other", { n: clients.length })}</p>
        </div>
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
        />
      </div>

      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("newClient")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("name")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("company")}</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("phone")}</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("city")}</label>
              <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("state")}</label>
              <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? t("creating") : t("createClient")}
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
                <th className="px-5 py-3.5">{t("companyLabel")}</th>
                <th className="px-5 py-3.5">{t("emailLabel")}</th>
                <th className="px-5 py-3.5">{t("phoneLabel")}</th>
                <th className="px-5 py-3.5">{t("locationLabel")}</th>
                <th className="px-5 py-3.5">{t("billingLabel")}</th>
                <th className="px-5 py-3.5 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-black/[0.01]">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{c.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{c.company || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{c.email}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{c.phone || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{c.billing_terms || "net_30"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="text-xs text-[#FF3B30] hover:text-[#FF6B6B] disabled:opacity-50">
                      {deleting === c.id ? "..." : t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noClients")}</td></tr>
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
