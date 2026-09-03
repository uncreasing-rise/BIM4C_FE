"use client";
import { useCallback, useEffect, useState } from "react";
import {
  adminRecordsApi,
  type AdminRecord,
  type RecordKind,
} from "@/features/admin/api/records";
export function RecordsManager({ kind }: { kind: RecordKind }) {
  const newsletter = kind === "newsletter/subscriptions";
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await adminRecordsApi.list(kind, search, status, page, signal);
      if (signal?.aborted) return;
      setItems(result.data);
      setPages(result.meta.totalPages || 1);
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    }
  }, [kind, page, search, status]);
  useEffect(() => {
    const controller = new AbortController();
    const t = window.setTimeout(() => void load(controller.signal), 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [load]);
  async function update(item: AdminRecord, value: string) {
    setBusy(true);
    try {
      await adminRecordsApi.update(
        kind,
        item.id,
        newsletter ? { isActive: value === "active" } : { status: value },
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật");
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: AdminRecord) {
    if (!confirm(`Xóa bản ghi ${item.email}?`)) return;
    setBusy(true);
    try {
      await adminRecordsApi.remove(kind, item.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="overflow-hidden rounded-md border border-border bg-background shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 [&_label]:flex [&_label]:h-10 [&_label]:min-w-52 [&_label]:flex-1 [&_label]:items-center [&_label]:gap-2 [&_label]:border [&_label]:border-border [&_label]:px-3 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:outline-none [&_select]:h-10 [&_select]:border [&_select]:border-border [&_select]:px-3 [&>button]:min-h-10 [&>button]:bg-primary [&>button]:px-4 [&>button]:text-white">
        <label>
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
          />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {newsletter ? (
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
      </div>
      {error && (
        <div className="mx-4 mt-3 flex justify-between bg-primary/10 px-3 py-2.5 text-xs text-primary">
          {error}
        </div>
      )}
      <div className="w-full overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_th]:h-10 [&_th]:border-b [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_td]:h-16 [&_td]:border-b [&_td]:border-border [&_td]:px-4 [&_td]:text-sm [&_td]:text-muted-foreground [&_td_img]:h-[38px] [&_td_img]:w-[54px] [&_td_img]:object-cover">
        <table>
          <thead>
            <tr>
              <th>NGƯỜI GỬI</th>
              <th>LIÊN HỆ</th>
              <th>NỘI DUNG / KHÓA HỌC</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span>
                    <strong>{item.name ?? item.email}</strong>
                    <small>{item.company}</small>
                  </span>
                </td>
                <td>
                  <span>
                    {item.email}
                    <small>{item.phone}</small>
                  </span>
                </td>
                <td>
                  <span>
                    {item.course?.title ??
                      item.message?.slice(0, 80) ??
                      "Đăng ký nhận tin"}
                  </span>
                </td>
                <td>
                  <select
                    disabled={busy}
                    value={
                      newsletter
                        ? item.isActive
                          ? "active"
                          : "unsubscribed"
                        : item.status?.toLowerCase()
                    }
                    onChange={(e) => void update(item, e.target.value)}
                  >
                    {newsletter ? (
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
                <td>
                  {new Intl.DateTimeFormat("vi-VN").format(
                    new Date(item.createdAt),
                  )}
                </td>
                <td>
                  <button disabled={busy} onClick={() => void remove(item)} aria-label={`Xóa bản ghi ${item.email}`}>
                    ⌫
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground [&_button]:size-9 [&_button]:border [&_button]:border-border">
        <button disabled={page <= 1} onClick={() => setPage((x) => x - 1)} aria-label="Trang trước">
          ←
        </button>
        <span>
          Trang {page}/{pages}
        </span>
        <button disabled={page >= pages} onClick={() => setPage((x) => x + 1)} aria-label="Trang sau">
          →
        </button>
      </footer>
    </section>
  );
}
