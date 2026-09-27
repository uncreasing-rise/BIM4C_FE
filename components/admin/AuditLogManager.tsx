"use client";

import { useCallback, useState } from "react";
import { Clock, UserCheck } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/button";
import { scrollToPageTop } from "@/lib/utils/scroll";
import { StatusBadge, formatDateTime, resourceLabel, statusLabel, table } from "./admin-ui";
import {
  FilterSelect,
  ListFooter,
  SearchBox,
  SortableTh,
  useDebouncedValue,
  useLoader,
  type SortState,
} from "./list-controls";

import { adminRequest } from "@/features/admin/api/http-client";

type Log = {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  createdAt: string;
  actor?: { name: string; email: string };
  requestId?: string;
};

type LogPage = {
  data?: Log[];
  meta?: { total?: number; totalPages?: number };
};

const ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "PUBLISH",
  "ARCHIVE",
  "ROLE_CHANGE",
  "SETTINGS_UPDATE",
  "MEDIA_UPLOAD",
  "MEDIA_DELETE",
];

const RESOURCES = [
  "projects",
  "services",
  "courses",
  "posts",
  "project-categories",
  "post-categories",
  "media",
  "homepage",
  "appointments",
  "contacts",
  "course-registrations",
  "newsletter",
  "settings",
  "users",
  "auth",
];

export function AuditLogManager() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [sort, setSort] = useState<SortState>({ by: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // Any filter or sort change starts again from page 1.
  const changeFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        sortBy: sort.by,
        sortOrder: sort.dir,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (action) params.set("action", action);
      if (resource) params.set("resource", resource);
      try {
        const result = await adminRequest<LogPage | Log[]>(`audit-logs?${params}`, { signal });
        if (signal?.aborted) return;
        const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
        const meta = Array.isArray(result) ? undefined : result?.meta;
        setLogs(list);
        setTotal(Number(meta?.total ?? list.length));
        setPages(meta?.totalPages || 1);
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Không thể tải nhật ký");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, pageSize, sort, debouncedSearch, action, resource],
  );

  useLoader(load);

  const filtered = Boolean(search || action || resource);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-3 dark:border-border sm:flex-row sm:items-center sm:p-4">
        <SearchBox
          value={search}
          onChange={changeFilter(setSearch)}
          placeholder="Tìm theo người thực hiện, tài nguyên, mã bản ghi, request ID..."
        />
        <FilterSelect
          label="Lọc theo thao tác"
          value={action}
          onChange={changeFilter(setAction)}
          allLabel="Mọi thao tác"
          options={ACTIONS.map((value) => ({ value, label: statusLabel("audit", value) }))}
        />
        <FilterSelect
          label="Lọc theo tài nguyên"
          value={resource}
          onChange={changeFilter(setResource)}
          allLabel="Mọi tài nguyên"
          options={RESOURCES.map((value) => ({ value, label: resourceLabel(value) }))}
        />
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 text-xs"
            onClick={() => {
              setSearch("");
              setAction("");
              setResource("");
              setPage(1);
            }}
          >
            Xóa lọc
          </Button>
        )}
      </div>
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      <div className="w-full overflow-x-auto">
        <table className={table.table}>
          <thead className={table.head}>
            <tr>
              <SortableTh label="Thời gian" field="createdAt" sort={sort} onSort={changeFilter(setSort)} firstDir="desc" />
              <th className={table.th}>Người thực hiện</th>
              <SortableTh label="Thao tác" field="action" sort={sort} onSort={changeFilter(setSort)} />
              <SortableTh label="Tài nguyên" field="resource" sort={sort} onSort={changeFilter(setSort)} />
              <th className={table.th}>Request ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                  Đang tải nhật ký kiểm toán...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  {filtered ? "Không có nhật ký nào khớp bộ lọc." : "Chưa có nhật ký hoạt động nào."}
                </td>
              </tr>
            ) : (
              logs.map((x) => (
                <tr key={x.id} className={table.row}>
                  <td className={`${table.td} whitespace-nowrap text-xs text-muted-foreground`}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{formatDateTime(x.createdAt)}</span>
                    </div>
                  </td>
                  <td className={table.td}>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <UserCheck className="size-3.5 text-primary" />
                      <span>{x.actor?.name ?? "Hệ thống"}</span>
                    </div>
                    {x.actor?.email && (
                      <small className="block text-xs text-muted-foreground mt-0.5">
                        {x.actor.email}
                      </small>
                    )}
                  </td>
                  <td className={table.td}>
                    <StatusBadge domain="audit" value={x.action} />
                  </td>
                  <td className={`${table.td} text-sm text-foreground`}>
                    <span className="block">{resourceLabel(x.resource)}</span>
                    {x.resourceId && <span className="block font-mono text-[11px] text-muted-foreground" title={x.resourceId}>{x.resourceId.slice(0, 8)}</span>}
                  </td>
                  <td className={`${table.td} font-mono text-xs text-muted-foreground`} title={x.requestId}>
                    {x.requestId ? x.requestId.slice(0, 12) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ListFooter
        page={page}
        pages={pages}
        total={total}
        pageSize={pageSize}
        itemLabel="nhật ký"
        pageSizes={[20, 50, 100]}
        onPage={(next) => {
          setPage(next);
          scrollToPageTop();
        }}
        onPageSize={changeFilter(setPageSize)}
      />
    </section>
  );
}
