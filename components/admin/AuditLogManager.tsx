"use client";

import { useEffect, useState } from "react";
import { Clock, UserCheck } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge, formatDateTime, resourceLabel, table } from "./admin-ui";

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

export function AuditLogManager() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function retry() {
    setLoading(true);
    setError("");
    void adminRequest<{ data: Log[] } | Log[]>("audit-logs?limit=50")
      .then((x) => {
        const list = Array.isArray((x as { data?: Log[] })?.data)
          ? (x as { data: Log[] }).data
          : Array.isArray(x)
            ? x
            : [];
        setLogs(list);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Không thể tải nhật ký"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;
    adminRequest<{ data: Log[] } | Log[]>("audit-logs?limit=50")
      .then((x) => {
        if (!active) return;
        const list = Array.isArray((x as { data?: Log[] })?.data)
          ? (x as { data: Log[] }).data
          : Array.isArray(x)
            ? x
            : [];
        setLogs(list);
        setError("");
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Không thể tải nhật ký");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-xs">
      {error && <ErrorState message={error} onRetry={retry} />}
      <div className="w-full overflow-x-auto">
        <table className={table.table}>
          <thead className={table.head}>
            <tr>
              <th className={table.th}>Thời gian</th>
              <th className={table.th}>Người thực hiện</th>
              <th className={table.th}>Thao tác</th>
              <th className={table.th}>Tài nguyên</th>
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
                  Chưa có nhật ký hoạt động nào.
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
                  <td className={`${table.td} font-mono text-xs text-muted-foreground`}>
                    {x.requestId ? x.requestId.slice(0, 12) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
