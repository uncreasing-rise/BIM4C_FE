"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminRecordsApi,
  type AdminRecord,
  type RecordKind,
} from "@/features/admin/api/records";
import { scrollToPageTop } from "@/lib/utils/scroll";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Download,
  Eye,
  X,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { exportToCsv } from "@/lib/utils/export-csv";
import { toast } from "sonner";
import { formatDateTime, statusLabel, table } from "./admin-ui";
import { useConfirm } from "./ConfirmDialog";

function renderMessageContent(
  rawMessage?: string,
  isCourse?: boolean,
  courseTitle?: string,
  isNewsletter?: boolean,
) {
  if (isCourse) {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
          Khóa học: {courseTitle || "BIM Academy"}
        </span>
        {rawMessage && rawMessage !== courseTitle && (
          <p className="text-xs text-muted-foreground whitespace-pre-line break-words mt-1 leading-relaxed">
            {rawMessage}
          </p>
        )}
      </div>
    );
  }

  if (isNewsletter) {
    return (
      <span className="text-xs text-muted-foreground">
        Đăng ký nhận bản tin định kỳ từ BIM4C
      </span>
    );
  }

  if (!rawMessage || !rawMessage.trim()) {
    return (
      <span className="text-xs text-muted-foreground italic">
        Yêu cầu tư vấn BIM (Không có lời nhắn)
      </span>
    );
  }

  // Parse prefixes like "Project Profile: Cavendish III\n\nBody" or "Solution Overview: Interior design\n\nBody"
  const prefixMatch = rawMessage.match(
    /^(Project Profile|Solution Overview|Dự án|Dịch vụ|Khóa học):\s*([^\n\r]+)(?:[\r\n]+([\s\S]*))?$/i,
  );

  if (prefixMatch) {
    const [, rawPrefix, contextTitle, actualBody] = prefixMatch;
    const label =
      rawPrefix.toLowerCase().includes("project")
        ? "Dự án"
        : rawPrefix.toLowerCase().includes("solution") ||
            rawPrefix.toLowerCase().includes("service")
          ? "Giải pháp"
          : rawPrefix;

    return (
      <div className="space-y-1.5 max-w-sm">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
          <span className="font-bold">{label}:</span>
          <span className="truncate max-w-[200px]">{contextTitle.trim()}</span>
        </div>
        {actualBody?.trim() ? (
          <div className="text-xs text-foreground whitespace-pre-line break-words leading-relaxed pl-0.5">
            {actualBody.trim()}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="text-xs text-foreground whitespace-pre-line break-words leading-relaxed max-w-sm">
      {rawMessage}
    </div>
  );
}

export function RecordsManager({ kind }: { kind: RecordKind }) {
  const { confirm, dialog } = useConfirm();
  const isNewsletter = kind === "newsletter/subscriptions";
  const isCourse = kind === "course-registrations";

  const contentHeader = isCourse
    ? "Khóa học đăng ký"
    : isNewsletter
      ? "Kênh đăng ký"
      : "Nội dung liên hệ";

  const searchPlaceholder = isCourse
    ? "Tìm theo học viên, email, khóa học..."
    : isNewsletter
      ? "Tìm theo email đăng ký..."
      : "Tìm theo tên, email, công ty, nội dung...";

  const [items, setItems] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeDetail, setActiveDetail] = useState<AdminRecord | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const result = await adminRecordsApi.list(
          kind,
          search,
          status,
          page,
          signal,
        );
        if (signal?.aborted) return;
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : Array.isArray(
                  (result as unknown as { items: AdminRecord[] })?.items,
                )
              ? (result as unknown as { items: AdminRecord[] }).items
              : [];
        setItems(list);
        setPages(result?.meta?.totalPages || 1);
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [kind, page, search, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    const t = window.setTimeout(() => void load(controller.signal), 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [load]);

  async function update(item: AdminRecord, value: string) {
    const prevItems = [...items];
    // Optimistic UI update
    setItems((prev) =>
      prev.map((x) =>
        x.id === item.id
          ? {
              ...x,
              status: value,
              isActive: value === "active",
            }
          : x,
      ),
    );
    setBusy(true);
    try {
      await adminRecordsApi.update(
        kind,
        item.id,
        isNewsletter ? { isActive: value === "active" } : { status: value },
      );
      toast.success("Đã cập nhật trạng thái");
      void load();
    } catch (e) {
      setItems(prevItems); // Revert on error
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: AdminRecord) {
    if (
      !(await confirm({
        title: `Xóa bản ghi của “${item.name ?? item.email}”?`,
        description: "Bản ghi và thông tin liên hệ của khách bị xóa vĩnh viễn. Hãy xuất CSV trước nếu cần lưu trữ.",
      }))
    )
      return;
    const prevItems = [...items];
    // Optimistic UI update
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setBusy(true);
    try {
      await adminRecordsApi.remove(kind, item.id);
      toast.success("Đã xóa bản ghi");
      void load();
    } catch (e) {
      setItems(prevItems); // Revert on error
      toast.error(e instanceof Error ? e.message : "Không thể xóa");
    } finally {
      setBusy(false);
    }
  }

  function handleExportCsv() {
    if (!items || items.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    const columns = [
      {
        key: "name",
        header: "Họ và tên",
        format: (r: AdminRecord) => r.name || r.email,
      },
      { key: "email", header: "Email", format: (r: AdminRecord) => r.email },
      {
        key: "phone",
        header: "Số điện thoại",
        format: (r: AdminRecord) => r.phone || "",
      },
      {
        key: "company",
        header: "Công ty / Tổ chức",
        format: (r: AdminRecord) => r.company || "",
      },
      {
        key: "message",
        header: contentHeader,
        format: (r: AdminRecord) =>
          isCourse
            ? r.course?.title || r.message || "Đăng ký khóa học"
            : isNewsletter
              ? "Bản tin BIM4C"
              : r.message || "Yêu cầu tư vấn BIM",
      },
      {
        key: "status",
        header: "Trạng thái",
        format: (r: AdminRecord) =>
          isNewsletter
            ? r.isActive
              ? "Đang hoạt động"
              : "Đã hủy"
            : r.status || "",
      },
      {
        key: "createdAt",
        header: "Thời gian đăng ký",
        format: (r: AdminRecord) =>
          new Date(r.createdAt).toLocaleString("vi-VN"),
      },
      {
        key: "consent",
        header: "Chấp thuận điều khoản CSBM",
        format: (r: AdminRecord) =>
          (r.consentGiven ?? r.consent) ? "Đã đồng ý" : "Chưa",
      },
    ];

    const filePrefix = isNewsletter
      ? "BIM4C_Newsletter_Subscribers"
      : isCourse
        ? "BIM4C_Hoc_Vien_Dang_Ky"
        : "BIM4C_Khach_Hang_Lien_He";

    try {
      exportToCsv(
        filePrefix,
        items as unknown as Record<string, unknown>[],
        columns as unknown as {
          key: string;
          header: string;
          format?: (row: Record<string, unknown>) => string;
        }[],
      );
      toast.success("Đã xuất file CSV.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xuất file");
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {dialog}
      <div className="flex flex-col items-stretch justify-between gap-2 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 bg-white pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 shadow-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
          >
            <option value="">Tất cả trạng thái</option>
            {isNewsletter ? (
              <>
                <option value="active">{statusLabel("newsletter", "ACTIVE")}</option>
                <option value="unsubscribed">{statusLabel("newsletter", "UNSUBSCRIBED")}</option>
              </>
            ) : (
              <>
                <option value="new">{statusLabel("submission", "NEW")}</option>
                <option value="in_progress">{statusLabel("submission", "IN_PROGRESS")}</option>
                <option value="resolved">{statusLabel("submission", "RESOLVED")}</option>
                <option value="spam">{statusLabel("submission", "SPAM")}</option>
              </>
            )}
          </select>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 gap-1.5"
          >
            <Download className="size-4" />
            <span>Xuất CSV</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="m-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className={table.table}>
          <thead className={table.head}>
            <tr>
              <th className={table.th}>Người gửi</th>
              <th className={table.th}>Liên hệ</th>
              <th className={table.th}>{contentHeader}</th>
              <th className={table.th}>Trạng thái</th>
              <th className={table.th}>Thời gian</th>
              <th className={table.th}>Đồng ý điều khoản</th>
              <th className={`${table.th} text-right`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className={table.td}>
                    <div className="h-4 w-32 bg-muted rounded mb-1.5" />
                    <div className="h-3 w-20 bg-muted/60 rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-3.5 w-40 bg-muted rounded mb-1" />
                    <div className="h-3 w-24 bg-muted/60 rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-3.5 w-48 bg-muted rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-7 w-28 bg-muted rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-3.5 w-24 bg-muted rounded" />
                  </td>
                  <td className={table.td}>
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </td>
                  <td className={`${table.td} text-right`}>
                    <div className="h-8 w-8 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  Không tìm thấy bản ghi nào.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={table.row}>
                  <td className={table.td}>
                    <div className="whitespace-nowrap font-medium text-slate-900">
                      {item.name || item.email}
                    </div>
                    {item.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building className="size-3" />
                        <span>{item.company}</span>
                      </div>
                    )}
                  </td>
                  <td className={table.td}>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <Mail className="size-3 text-primary shrink-0" />
                      <a
                        href={`mailto:${item.email}`}
                        className="hover:underline"
                      >
                        {item.email}
                      </a>
                    </div>
                    {item.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Phone className="size-3 shrink-0" />
                        <a
                          href={`tel:${item.phone}`}
                          className="hover:underline"
                        >
                          {item.phone}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className={`${table.td} max-w-md`}>
                    {renderMessageContent(
                      item.message,
                      isCourse,
                      item.course?.title,
                      isNewsletter,
                    )}
                  </td>
                  <td className={table.td}>
                    <select
                      disabled={busy}
                      value={
                        isNewsletter
                          ? item.isActive
                            ? "active"
                            : "unsubscribed"
                          : item.status?.toLowerCase()
                      }
                      onChange={(e) => void update(item, e.target.value)}
                      aria-label={`Trạng thái của ${item.name ?? item.email}`}
                      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20"
                    >
                      {isNewsletter ? (
                        <>
                          <option value="active">{statusLabel("newsletter", "ACTIVE")}</option>
                          <option value="unsubscribed">{statusLabel("newsletter", "UNSUBSCRIBED")}</option>
                        </>
                      ) : (
                        <>
                          <option value="new">{statusLabel("submission", "NEW")}</option>
                          <option value="in_progress">{statusLabel("submission", "IN_PROGRESS")}</option>
                          <option value="resolved">{statusLabel("submission", "RESOLVED")}</option>
                          <option value="spam">{statusLabel("submission", "SPAM")}</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-xs text-slate-500`}>
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className={`${table.td} whitespace-nowrap`}>
                    {(item.consentGiven ?? item.consent) === true ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10"
                      >
                        <CheckCircle2 className="size-3" /> Có
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Chưa ghi nhận
                      </Badge>
                    )}
                  </td>
                  <td className={`${table.td} text-right`}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveDetail(item)}
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                        className="text-muted-foreground hover:text-primary size-8"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        onClick={() => void remove(item)}
                        aria-label={`Xóa bản ghi ${item.email}`}
                        title="Xóa"
                        className="text-muted-foreground hover:text-destructive size-8"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => {
            setPage((x) => x - 1);
            scrollToPageTop();
          }}
          aria-label="Trang trước"
          className="gap-1 h-8 px-3"
        >
          <ChevronLeft className="size-3.5" /> Trước
        </Button>
        <span className="font-medium">
          Trang {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => {
            setPage((x) => x + 1);
            scrollToPageTop();
          }}
          aria-label="Trang sau"
          className="gap-1 h-8 px-3"
        >
          Sau <ChevronRight className="size-3.5" />
        </Button>
      </footer>

      {/* Detail Modal */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    CHI TIẾT YÊU CẦU
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {activeDetail.name || activeDetail.email}
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveDetail(null)}
                className="size-8 text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 border border-border/70 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Họ và tên
                  </span>
                  <strong className="text-foreground font-semibold">
                    {activeDetail.name || "Chưa cung cấp"}
                  </strong>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Công ty / Tổ chức
                  </span>
                  <strong className="text-foreground font-semibold">
                    {activeDetail.company || "Cá nhân"}
                  </strong>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Địa chỉ Email
                  </span>
                  <a
                    href={`mailto:${activeDetail.email}`}
                    className="text-primary hover:underline font-semibold"
                  >
                    {activeDetail.email}
                  </a>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Số điện thoại
                  </span>
                  {activeDetail.phone ? (
                    <a
                      href={`tel:${activeDetail.phone}`}
                      className="text-foreground hover:underline font-semibold"
                    >
                      {activeDetail.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Chưa có</span>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Thời gian gửi
                  </span>
                  <span className="text-foreground font-mono">
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    }).format(new Date(activeDetail.createdAt))}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Chính sách bảo mật
                  </span>
                  <span className="text-emerald-500 font-semibold inline-flex items-center gap-1">
                    <ShieldCheck className="size-3.5" /> Đã chấp thuận điều khoản
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-slate-700 dark:text-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> {contentHeader}
                </label>
                <div className="rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                  {activeDetail.message || "Không có nội dung tin nhắn bổ sung."}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDetail(null)}
                className="text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
