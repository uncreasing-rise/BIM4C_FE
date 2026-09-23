"use client";

import { useEffect, useState } from "react";
import { adminRequest } from "@/features/admin/api/http-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Rule = { id: string; weekday: number; startTime: string; endTime: string; durationMinutes: number; bufferMinutes: number; isActive: boolean };
type Appointment = { id: string; name: string; email: string; topic: string; startAt: string; endAt: string; status: string; meetingUrl?: string | null };
const weekdays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export function AppointmentsManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weekday, setWeekday] = useState(1); const [startTime, setStartTime] = useState("09:00"); const [endTime, setEndTime] = useState("17:00");
  const load = async () => {
    const [r, a] = await Promise.all([
      adminRequest<{ data?: unknown }>("appointments/availability/rules"),
      adminRequest<{ data?: unknown }>("appointments"),
    ]);
    setRules(Array.isArray(r?.data) ? (r.data as Rule[]) : []);
    setAppointments(Array.isArray(a?.data) ? (a.data as Appointment[]) : []);
  };
  useEffect(() => { const timer = window.setTimeout(() => { void load().catch(() => toast.error("Không thể tải lịch tư vấn.")); }, 0); return () => window.clearTimeout(timer); }, []);
  async function addRule() { try { await adminRequest("appointments/availability/rules", { method: "POST", body: JSON.stringify({ weekday, startTime, endTime, durationMinutes: 30, bufferMinutes: 10, isActive: true }) }); await load(); toast.success("Đã lưu khung giờ."); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lưu khung giờ."); } }
  async function updateStatus(id: string, status: string) { try { await adminRequest(`appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể cập nhật lịch."); } }
  return <div className="space-y-6">
    <section className="rounded-2xl border bg-card p-6"><h2 className="text-lg font-bold">Khung giờ tư vấn mặc định</h2><p className="mt-1 text-sm text-muted-foreground">Hệ thống tự sinh slot trống theo các khung giờ này, không cần đăng từng lịch.</p><div className="mt-5 grid gap-3 sm:grid-cols-4"><select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className="h-10 rounded-lg border bg-background px-3">{weekdays.map((day, i) => <option key={day} value={i}>{day}</option>)}</select><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /><Button onClick={() => void addRule()}>Thêm khung giờ</Button></div><div className="mt-5 space-y-2">{rules.map((rule) => <div key={rule.id} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{weekdays[rule.weekday]} · {rule.startTime}–{rule.endTime} · slot {rule.durationMinutes} phút</span><Button variant="ghost" size="sm" onClick={() => void adminRequest(`appointments/availability/rules/${rule.id}`, { method: "DELETE" }).then(load)}>Xóa</Button></div>)}</div></section>
    <section className="rounded-2xl border bg-card p-6"><h2 className="text-lg font-bold">Lịch đã đặt</h2><div className="mt-5 space-y-3">{appointments.length ? appointments.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold">{item.name} · {item.topic}</p><p className="text-sm text-muted-foreground">{item.email} · {new Date(item.startAt).toLocaleString("vi-VN")}</p>{item.meetingUrl && <a href={item.meetingUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">Mở Google Meet</a>}</div><select value={item.status} onChange={(e) => void updateStatus(item.id, e.target.value)} className="h-9 rounded-lg border bg-background px-2 text-sm"><option>REQUESTED</option><option>CONFIRMED</option><option>CANCELLED</option><option>COMPLETED</option><option>NO_SHOW</option></select></div>) : <p className="text-sm text-muted-foreground">Chưa có lịch hẹn.</p>}</div></section>
  </div>;
}
