"use client";

// 月台预约日历组件 — Dock Appointment Calendar
// 周视图日历 + 时段选择

import { useState } from "react";
import { useTranslations } from "next-intl";

interface DockAppointment {
  id: string;
  dock_door: string;
  appointment_type: string;
  carrier?: string;
  trailer_number?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
}

interface Props {
  appointments: DockAppointment[];
  onSlotClick?: (start: Date, end: Date) => void;
  onAppointmentClick?: (appt: DockAppointment) => void;
  dockDoors?: string[];
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-[#007AFF]",
  checked_in: "bg-[#FF9500]",
  loading: "bg-[#ed6d00]",
  completed: "bg-[#34C759]",
  cancelled: "bg-[#FF3B30]/30",
};

export default function DockCalendar({ appointments, onSlotClick, onAppointmentClick, dockDoors }: Props) {
  const t = useTranslations("dockCalendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + weekOffset * 7);

  const doors = dockDoors || [...new Set(appointments.map((a) => a.dock_door))];
  if (doors.length === 0) doors.push(t("dock1"), t("dock2"));

  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6am - 8pm
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  function getApptStyle(appt: DockAppointment) {
    const start = new Date(appt.scheduled_start);
    const end = new Date(appt.scheduled_end);
    const dayIdx = days.findIndex((d) => d.toDateString() === start.toDateString());
    const hourStart = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / 3600000;

    if (dayIdx < 0) return null;
    return {
      dayIdx,
      top: ((hourStart - 6) / 14) * 100,
      height: Math.max((duration / 14) * 100, 4),
    };
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="text-sm text-[#86868B] hover:text-[#1D1D1F]">&larr; Prev</button>
        <span className="text-sm font-semibold text-[#1D1D1F]">
          {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
          {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="text-sm text-[#86868B] hover:text-[#1D1D1F]">Next &rarr;</button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-black/5">
            <div className="px-2 py-2 text-[10px] font-medium text-[#86868B] uppercase">{t("door")}</div>
            {days.map((d) => (
              <div key={d.toISOString()} className={`px-2 py-2 text-center text-xs font-medium ${d.toDateString() === today.toDateString() ? "text-[#ed6d00]" : "text-[#1D1D1F]"}`}>
                {d.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" })}<br />
                <span className="text-[#86868B]">{d.getDate()}</span>
              </div>
            ))}
          </div>

          {/* Door rows */}
          {doors.map((door) => (
            <div key={door} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-black/[0.02] min-h-[60px]">
              <div className="px-2 py-2 text-xs font-medium text-[#86868B] flex items-center">{door}</div>
              {days.map((d, di) => {
                const dayAppts = appointments.filter((a) => {
                  const start = new Date(a.scheduled_start);
                  return start.toDateString() === d.toDateString() && a.dock_door === door;
                });

                return (
                  <div
                    key={di}
                    className="relative border-l border-black/[0.02] cursor-pointer hover:bg-[#F5F5F7]/50"
                    onClick={() => {
                      const start = new Date(d);
                      start.setHours(9, 0, 0);
                      const end = new Date(d);
                      end.setHours(10, 0, 0);
                      onSlotClick?.(start, end);
                    }}
                  >
                    {dayAppts.map((appt) => {
                      const style = getApptStyle(appt);
                      if (!style) return null;
                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-[9px] text-white font-medium truncate ${STATUS_COLORS[appt.status] || "bg-[#8E8E93]"}`}
                          style={{ top: `${style.top}%`, height: `${style.height}%` }}
                          onClick={(e) => { e.stopPropagation(); onAppointmentClick?.(appt); }}
                        >
                          {appt.carrier || appt.appointment_type} {appt.trailer_number || ""}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
