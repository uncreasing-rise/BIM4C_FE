"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminRequest } from "@/features/admin/api/http-client";
import { Button } from "@/components/ui/button";
import { Panel, StatusBadge, table } from "./admin-ui";

type Rule = { id: string; weekday: number; startTime: string; endTime: string; durationMinutes: number; bufferMinutes: number; isActive: boolean };
type Status = "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
type Appointment = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  topic: string;
  message?: string | null;
  startAt: string;
  endAt: string;
  status: Status;
  meetingUrl?: string | null;
};

const WEEKDAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const TZ = "Asia/Ho_Chi_Minh";
// Mirrors the backend state machine; only valid next steps are offered.
const ACTIONS: Record<Status, { to: Status; label: string; variant: "default" | "outline"; confirm?: string }[]> = {
  REQUESTED: [
    { to: "CONFIRMED", label: "Xác nhận", variant: "default" },
    { to: "CANCELLED", label: "Hủy", variant: "outline", confirm: "Hủy lịch và gửi email báo cho khách?" },
  ],
  CONFIRMED: [
    { to: "COMPLETED", label: "Đã diễn ra", variant: "outline" },
    { to: "NO_SHOW", label: "Vắng mặt", variant: "outline" },
    { to: "CANCELLED", label: "Hủy", variant: "outline", confirm: "Hủy lịch đã xác nhận và gửi email báo cho khách?" },
  ],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};
const FILTERS: { value: Status | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "REQUESTED", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Đã diễn ra" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "NO_SHOW", label: "Vắng mặt" },
];

const dateFmt = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function AppointmentsManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [form, setForm] = useState({ weekday: 1, startTime: "09:00", endTime: "17:00", durationMinutes: 30, bufferMinutes: 10 });

  const fetchAll = useCallback(
    () =>
      Promise.all([
        adminRequest<{ data?: Rule[] }>("appointments/availability/rules"),
        adminRequest<{ data?: Appointment[] }>("appointments"),
      ]).then(([r, a]) => {
        setRules(Array.isArray(r?.data) ? r.data : []);
        setAppointments(Array.isArray(a?.data) ? a.data : []);
        setLoaded(true);
      }),
    [],
  );
  useEffect(() => {
    fetchAll().catch(() => {
      toast.error("Không thể tải lịch tư vấn.");
      setLoaded(true);
    });
  }, [fetchAll]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: appointments.length };
    for (const a of appointments) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [appointments]);
  const visible = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);
  const sortedRules = [...rules].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
  const formInvalid = toMinutes(form.endTime) <= toMinutes(form.startTime);

  async function addRule() {
    if (formInvalid) return;
    setBusyId("rule-form");
    try {
      await adminRequest("appointments/availability/rules", {
        method: "POST",
        body: JSON.stringify({ ...form, isActive: true }),
      });
      await fetchAll();
      toast.success(`Đã thêm khung giờ ${WEEKDAYS[form.weekday]} ${form.startTime}–${form.endTime}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu khung giờ.");
    } finally {
      setBusyId(null);
    }
  }
  async function deleteRule(id: string) {
    setBusyId(id);
    try {
      await adminRequest(`appointments/availability/rules/${id}`, { method: "DELETE" });
      await fetchAll();
      toast.success("Đã xóa khung giờ.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa khung giờ.");
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }
  async function changeStatus(item: Appointment, to: Status) {
    setBusyId(item.id);
    try {
      await adminRequest(`appointments/${item.id}/status`, { method: "PATCH", body: JSON.stringify({ status: to }) });
      await fetchAll();
      toast.success(to === "CONFIRMED" ? `Đã xác nhận lịch với ${item.name}. Email xác nhận đã được gửi.` : "Đã cập nhật trạng thái lịch hẹn.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật lịch hẹn.");
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  const field = "h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <div className="space-y-6">
      <Panel
        title="Lịch hẹn"
        description="Khách chọn khung giờ trống trên website; xác nhận để tạo sự kiện lịch và gửi link họp."
        icon={CalendarClock}
        bodyClassName="p-0"
      >
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-2" role="tablist" aria-label="Lọc theo trạng thái">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] ${filter === f.value ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {f.label}
              <span className="rounded bg-white px-1.5 text-xs tabular-nums text-slate-500 ring-1 ring-slate-200">{counts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className={table.wrapper}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Khách hàng</th>
                <th className={table.th}>Chủ đề</th>
                <th className={table.th}>Thời gian (giờ Việt Nam)</th>
                <th className={table.th}>Trạng thái</th>
                <th className={`${table.th} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                    <Loader2 className="mx-auto size-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                    {filter === "ALL" ? "Chưa có lịch hẹn nào." : "Không có lịch hẹn ở trạng thái này."}
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const start = new Date(item.startAt);
                  const end = new Date(item.endAt);
                  return (
                    <tr key={item.id} className={table.row}>
                      <td className={table.td}>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                        {(item.phone || item.company) && (
                          <p className="text-xs text-slate-500">{[item.phone, item.company].filter(Boolean).join(" · ")}</p>
                        )}
                      </td>
                      <td className={`${table.td} max-w-[260px]`}>
                        <p className="truncate">{item.topic}</p>
                        {item.message && <p className="truncate text-xs text-slate-500" title={item.message}>{item.message}</p>}
                      </td>
                      <td className={`${table.td} whitespace-nowrap`}>
                        <p>{dateFmt.format(start)}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {timeFmt.format(start)}–{timeFmt.format(end)}
                        </p>
                      </td>
                      <td className={table.td}>
                        <StatusBadge domain="appointment" value={item.status} />
                        {item.meetingUrl && (
                          <a href={item.meetingUrl} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline">
                            Google Meet <ExternalLink className="size-3" />
                          </a>
                        )}
                      </td>
                      <td className={`${table.td} text-right`}>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {busyId === item.id ? (
                            <Loader2 className="size-4 animate-spin text-slate-400" />
                          ) : (
                            ACTIONS[item.status].map((action) => {
                              const key = `${item.id}:${action.to}`;
                              return confirming === key ? (
                                <span key={key} className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-600">{action.confirm}</span>
                                  <Button size="sm" variant="destructive" onClick={() => void changeStatus(item, action.to)}>
                                    Đồng ý
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                                    Thôi
                                  </Button>
                                </span>
                              ) : (
                                <Button
                                  key={key}
                                  size="sm"
                                  variant={action.variant}
                                  onClick={() => (action.confirm ? setConfirming(key) : void changeStatus(item, action.to))}
                                >
                                  {action.label}
                                </Button>
                              );
                            })
                          )}
                          {!ACTIONS[item.status].length && <span className="text-xs text-slate-400">Đã kết thúc</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Khung giờ nhận tư vấn"
        description="Website tự chia các khung giờ này thành slot trống cho khách chọn (theo giờ Việt Nam)."
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4">
          <label className="grid gap-1 text-[13px] text-slate-600">
            Ngày trong tuần
            <select value={form.weekday} onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })} className={field}>
              {WEEKDAYS.map((day, i) => (
                <option key={day} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[13px] text-slate-600">
            Từ
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={field} />
          </label>
          <label className="grid gap-1 text-[13px] text-slate-600">
            Đến
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              aria-invalid={formInvalid}
              className={`${field} ${formInvalid ? "border-red-400" : ""}`}
            />
          </label>
          <label className="grid gap-1 text-[13px] text-slate-600">
            Mỗi slot
            <select value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className={field}>
              {[30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m} phút
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[13px] text-slate-600">
            Nghỉ giữa slot
            <select value={form.bufferMinutes} onChange={(e) => setForm({ ...form, bufferMinutes: Number(e.target.value) })} className={field}>
              {[0, 5, 10, 15, 30].map((m) => (
                <option key={m} value={m}>
                  {m} phút
                </option>
              ))}
            </select>
          </label>
          <Button onClick={() => void addRule()} disabled={formInvalid || busyId === "rule-form"}>
            {busyId === "rule-form" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Thêm khung giờ
          </Button>
          {formInvalid && <p className="w-full text-xs text-red-600">Giờ kết thúc phải sau giờ bắt đầu.</p>}
        </div>
        <div className={table.wrapper}>
          <table className={`${table.table} min-w-[560px]`}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Ngày</th>
                <th className={table.th}>Khung giờ</th>
                <th className={table.th}>Slot</th>
                <th className={`${table.th} text-right`}>
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    Chưa có khung giờ. Khách sẽ không thấy lịch trống nào cho đến khi bạn thêm khung giờ.
                  </td>
                </tr>
              ) : (
                sortedRules.map((rule) => (
                  <tr key={rule.id} className={table.row}>
                    <td className={`${table.td} font-medium text-slate-900`}>{WEEKDAYS[rule.weekday]}</td>
                    <td className={`${table.td} tabular-nums`}>
                      {rule.startTime}–{rule.endTime}
                    </td>
                    <td className={`${table.td} text-slate-600`}>
                      {rule.durationMinutes} phút{rule.bufferMinutes ? `, nghỉ ${rule.bufferMinutes} phút` : ""}
                    </td>
                    <td className={`${table.td} text-right`}>
                      {confirming === rule.id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Button size="sm" variant="destructive" disabled={busyId === rule.id} onClick={() => void deleteRule(rule.id)}>
                            Xóa
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                            Thôi
                          </Button>
                        </span>
                      ) : (
                        <Button size="sm" variant="ghost" aria-label={`Xóa khung giờ ${WEEKDAYS[rule.weekday]} ${rule.startTime}`} onClick={() => setConfirming(rule.id)}>
                          <Trash2 className="size-4 text-slate-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
