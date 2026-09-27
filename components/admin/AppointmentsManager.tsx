"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminRequest } from "@/features/admin/api/http-client";
import { Button } from "@/components/ui/button";
import { Panel, StatusBadge, table } from "./admin-ui";
import { SearchBox, SortableTh, matchesSearch, useClientSort } from "./list-controls";

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

const TZ = "Asia/Ho_Chi_Minh";
// Mirrors the backend state machine; only valid next steps are offered.
const ACTIONS: Record<
  Status,
  {
    to: Status;
    label: string;
    variant: "default" | "outline";
    confirm?: string;
  }[]
> = {
  REQUESTED: [
    { to: "CONFIRMED", label: "Xác nhận", variant: "default" },
    {
      to: "CANCELLED",
      label: "Hủy",
      variant: "outline",
      confirm: "Hủy lịch và gửi email báo cho khách?",
    },
  ],
  CONFIRMED: [
    { to: "COMPLETED", label: "Đã diễn ra", variant: "outline" },
    { to: "NO_SHOW", label: "Vắng mặt", variant: "outline" },
    {
      to: "CANCELLED",
      label: "Hủy",
      variant: "outline",
      confirm: "Hủy lịch đã xác nhận và gửi email báo cho khách?",
    },
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

const dateFmt = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});
const timeFmt = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchAll = useCallback(
    () =>
      adminRequest<{ data?: Appointment[] }>("appointments").then((a) => {
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
  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (filter === "ALL" || a.status === filter) &&
          matchesSearch(search, a.name, a.email, a.phone, a.company, a.topic, a.message),
      ),
    [appointments, filter, search],
  );
  // Latest slot first: upcoming meetings sit above past history.
  const { sorted: visible, sort, setSort } = useClientSort(
    filtered,
    { by: "startAt", dir: "desc" },
    {
      name: (a) => a.name,
      topic: (a) => a.topic,
      startAt: (a) => new Date(a.startAt),
      status: (a) => a.status,
    },
  );

  async function changeStatus(item: Appointment, to: Status) {
    setBusyId(item.id);
    try {
      const result = await adminRequest<{
        notification?: { customer: string; admin?: string };
      }>(`appointments/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: to }),
        timeoutMs: 120000,
      });
      await fetchAll();
      toast.success(`Đã cập nhật lịch hẹn với ${item.name}.`);
      if (result.notification?.customer === "sent")
        toast.success("Email thông báo cho khách đã được gửi.");
      else
        toast.warning(
          "Lịch hẹn đã lưu nhưng email khách chưa được gửi. Vui lòng kiểm tra cấu hình mail và liên hệ trực tiếp.",
        );
      if (result.notification?.admin && result.notification.admin !== "sent")
        toast.warning("Email thông báo nội bộ chưa được gửi.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật lịch hẹn.",
      );
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Lịch hẹn"
        description="Khách tự đề xuất ngày, giờ và thời lượng. Kiểm tra yêu cầu rồi xác nhận để tạo lịch họp; email gửi theo ngôn ngữ khách đã chọn."
        icon={CalendarClock}
        bodyClassName="p-0"
      >
        <div className="px-3 pt-3">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo khách, email, SĐT, công ty, chủ đề..."
            className="max-w-md"
          />
        </div>
        <div
          className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-2"
          role="tablist"
          aria-label="Lọc theo trạng thái"
        >
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
              <span className="rounded bg-white px-1.5 text-xs tabular-nums text-slate-500 ring-1 ring-slate-200">
                {counts[f.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className={table.wrapper}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <SortableTh label="Khách hàng" field="name" sort={sort} onSort={setSort} />
                <SortableTh label="Chủ đề" field="topic" sort={sort} onSort={setSort} />
                <SortableTh label="Thời gian (giờ Việt Nam)" field="startAt" sort={sort} onSort={setSort} firstDir="desc" />
                <SortableTh label="Trạng thái" field="status" sort={sort} onSort={setSort} />
                <th className={`${table.th} text-right`}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    <Loader2 className="mx-auto size-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    {search
                      ? "Không có lịch hẹn nào khớp từ khóa."
                      : filter === "ALL"
                        ? "Chưa có lịch hẹn nào."
                        : "Không có lịch hẹn ở trạng thái này."}
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const start = new Date(item.startAt);
                  const end = new Date(item.endAt);
                  return (
                    <tr key={item.id} className={table.row}>
                      <td className={table.td}>
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                        {(item.phone || item.company) && (
                          <p className="text-xs text-slate-500">
                            {[item.phone, item.company]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className={`${table.td} max-w-[260px]`}>
                        <p className="truncate">{item.topic}</p>
                        {item.message && (
                          <p
                            className="truncate text-xs text-slate-500"
                            title={item.message}
                          >
                            {item.message}
                          </p>
                        )}
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
                          <a
                            href={item.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
                          >
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
                                <span
                                  key={key}
                                  className="flex items-center gap-1.5"
                                >
                                  <span className="text-xs text-slate-600">
                                    {action.confirm}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      void changeStatus(item, action.to)
                                    }
                                  >
                                    Đồng ý
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirming(null)}
                                  >
                                    Thôi
                                  </Button>
                                </span>
                              ) : (
                                <Button
                                  key={key}
                                  size="sm"
                                  variant={action.variant}
                                  onClick={() =>
                                    action.confirm
                                      ? setConfirming(key)
                                      : void changeStatus(item, action.to)
                                  }
                                >
                                  {action.label}
                                </Button>
                              );
                            })
                          )}
                          {!ACTIONS[item.status].length && (
                            <span className="text-xs text-slate-400">
                              Đã kết thúc
                            </span>
                          )}
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
    </div>
  );
}
