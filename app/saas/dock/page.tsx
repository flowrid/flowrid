"use client";

// 月台预约调度

import { useEffect, useState } from "react";
import DockCalendar from "@/components/saas/DockCalendar";

export default function DockPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [warehouseId, setWarehouseId] = useState("");
  const [dockDoor, setDockDoor] = useState("");
  const [apptType, setApptType] = useState("inbound");
  const [carrier, setCarrier] = useState("");
  const [trailerNumber, setTrailerNumber] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduledStart, setScheduledStart] = useState("09:00");
  const [scheduledEnd, setScheduledEnd] = useState("10:00");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchData() {
    try {
      const now = new Date().toISOString().split("T")[0];
      const [apptR, whR] = await Promise.all([
        fetch(`/api/saas/dock?date_from=${now}`),
        fetch("/api/saas/warehouses"),
      ]);
      const apptD = await apptR.json();
      const whD = await whR.json();
      setAppointments(apptD.data || []);
      setWarehouses(whD.data || []);
      if (whD.data?.length > 0 && !warehouseId) setWarehouseId(whD.data[0].id);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId || !dockDoor.trim()) return;
    setCreating(true);
    setMsg(null);
    const start = `${scheduledDate}T${scheduledStart}:00`;
    const end = `${scheduledDate}T${scheduledEnd}:00`;
    try {
      const r = await fetch("/api/saas/dock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse_id: warehouseId, dock_door: dockDoor.trim(),
          appointment_type: apptType, carrier: carrier.trim() || undefined,
          trailer_number: trailerNumber.trim() || undefined,
          scheduled_start: start, scheduled_end: end,
        }),
      });
      if (r.ok) {
        setDockDoor(""); setCarrier(""); setTrailerNumber("");
        setShowForm(false);
        fetchData();
      } else {
        const err = await r.json();
        setMsg(err.error || "Failed");
      }
    } catch { setMsg("Network error"); }
    finally { setCreating(false); }
  }

  async function updateStatus(appt: any, status: string) {
    await fetch(`/api/saas/dock/${appt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  }

  if (loading) return <div className="p-8 animate-pulse space-y-4"><div className="h-8 w-48 bg-black/5 rounded-xl" /><div className="h-64 bg-white/50 rounded-2xl" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Dock Schedule</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#ed6d00] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors">
          {showForm ? "Cancel" : "+ Appointment"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Appointment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Warehouse *</label>
                <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                  {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Dock Door *</label>
                <input type="text" value={dockDoor} onChange={(e) => setDockDoor(e.target.value)} placeholder="e.g. A1"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Type</label>
                <select value={apptType} onChange={(e) => setApptType(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Date *</label>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Start</label>
                <input type="time" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">End</label>
                <input type="time" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Carrier</label>
                <input type="text" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. FedEx Freight"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Trailer #</label>
                <input type="text" value={trailerNumber} onChange={(e) => setTrailerNumber(e.target.value)} placeholder="Optional"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={creating}
                className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
                {creating ? "Scheduling..." : "Schedule"}
              </button>
              {msg && <span className="text-xs text-[#FF3B30]">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      <DockCalendar appointments={appointments}
        onAppointmentClick={(appt) => {
          const nextStatus = appt.status === "scheduled" ? "checked_in" :
            appt.status === "checked_in" ? "loading" :
            appt.status === "loading" ? "completed" : "scheduled";
          updateStatus(appt, nextStatus);
        }}
      />

      {/* Upcoming appointments list */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-3 bg-[#F5F5F7] border-b border-black/5">
          <h3 className="text-sm font-semibold text-[#1D1D1F]">Upcoming Appointments</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[#86868B] border-b border-black/5">
              <th className="px-5 py-2.5">Door</th><th className="px-5 py-2.5">Type</th><th className="px-5 py-2.5">Carrier</th>
              <th className="px-5 py-2.5">Scheduled</th><th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {appointments.slice(0, 10).map((a: any) => (
              <tr key={a.id}>
                <td className="px-5 py-2.5 text-sm font-medium">{a.dock_door}</td>
                <td className="px-5 py-2.5 text-xs capitalize">{a.appointment_type}</td>
                <td className="px-5 py-2.5 text-sm">{a.carrier || "—"}</td>
                <td className="px-5 py-2.5 text-xs text-[#86868B]">{new Date(a.scheduled_start).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-5 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    a.status === "scheduled" ? "bg-[#007AFF]/10 text-[#007AFF]" :
                    a.status === "completed" ? "bg-[#34C759]/10 text-[#34C759]" :
                    a.status === "cancelled" ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#FF9500]/10 text-[#FF9500]"
                  }`}>{a.status.replace(/_/g, " ")}</span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-[#86868B] text-sm">No appointments scheduled</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
