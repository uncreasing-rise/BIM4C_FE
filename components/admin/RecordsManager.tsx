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
    if (!confirm(`Xác nhận xóa bản ghi từ “${item.name ?? item.email}”?`))
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
      toast.success("📥 Đã xuất file Excel/CSV thành công!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xuất file");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/80 p-4 bg-muted/20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-10 bg-background"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả trạng thái</option>
            {isNewsletter ? (
              <>
                <option value="active">Đang hoạt động</option>
                <option value="unsubscribed">Đã hủy</option>
              </>
            ) : (
              <>
                <option value="new">Mới</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="spam">Spam</option>
              </>
            )}
          </select>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="gap-1.5 h-10 font-semibold shadow-xs"
          >
            <Download className="size-4 text-primary" />
            <span>Xuất Excel</span>
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
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/80 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Người gửi</th>
              <th className="px-5 py-3.5">Thông tin liên hệ</th>
              <th className="px-5 py-3.5">{contentHeader}</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5">Thời gian</th>
              <th className="px-5 py-3.5">Chấp thuận điều khoản</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 bg-muted rounded mb-1.5" />
                    <div className="h-3 w-20 bg-muted/60 rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-40 bg-muted rounded mb-1" />
                    <div className="h-3 w-24 bg-muted/60 rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-48 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-7 w-28 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-3.5 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </td>
                  <td className="px-5 py-4 text-right">
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
                <tr
                  key={item.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground">
                      {item.name || item.email}
                    </div>
                    {item.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building className="size-3" />
                        <span>{item.company}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4 max-w-md">
                    {renderMessageContent(
                      item.message,
                      isCourse,
                      item.course?.title,
                      isNewsletter,
                    )}
                  </td>
                  <td className="px-5 py-4">
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
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-hidden"
                    >
                      {isNewsletter ? (
                        <>
                          <option value="active">Đang hoạt động</option>
                          <option value="unsubscribed">Đã hủy</option>
                        </>
                      ) : (
                        <>
                          <option value="new">Mới</option>
                          <option value="in_progress">Đang xử lý</option>
                          <option value="resolved">Đã giải quyết</option>
                          <option value="spam">Spam</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.createdAt))}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {(item.consentGiven ?? item.consent) === true ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/10"
                      >
                        <CheckCircle2 className="size-3" /> Đã đồng ý
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Không có
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
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

      <footer className="flex items-center justify-between border-t border-border/80 px-5 py-3.5 text-xs text-muted-foreground bg-muted/20">
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
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase text-primary">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-muted/40 p-4 border border-border/70 text-xs">
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> {contentHeader}
                </label>
                <div className="rounded-2xl border border-border bg-background p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
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
