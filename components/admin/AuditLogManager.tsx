"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, UserCheck, Activity, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    let active = true;
    fetch("/api/admin/audit-logs?limit=50", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => null);
          throw new Error(body?.message || `Lỗi HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((x) => {
        if (!active) return;
        const list = Array.isArray(x?.data)
          ? x.data
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
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card shadow-xs">
      {error && (
        <div className="m-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200/80 dark:border-border bg-slate-50/80 dark:bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Thời gian</th>
              <th className="px-5 py-3.5">Người thực hiện</th>
              <th className="px-5 py-3.5">Thao tác</th>
              <th className="px-5 py-3.5">Tài nguyên</th>
              <th className="px-5 py-3.5">Request ID</th>
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
                <tr key={x.id} className="hover:bg-slate-50/70 dark:hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{new Date(x.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="font-mono text-xs border-primary/30 bg-primary/5 text-primary">
                      <Activity className="size-3 mr-1" />
                      {x.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-foreground">
                    <span className="flex items-center gap-1">
                      <Database className="size-3 text-muted-foreground" />
                      {x.resource} {x.resourceId ? `(${x.resourceId})` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
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
