"use client";
import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/audit-logs?limit=50", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message);
        return r.json();
      })
      .then((x) => setLogs(x.data))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <section className="overflow-hidden rounded-md border border-[#dbe7e5] bg-white shadow-sm">
      <p className="mx-4 mt-3 flex justify-between bg-[#eaf8f7] px-3 py-2.5 text-xs text-[#09a7a5]">
        {error}
      </p>
      <div className="w-full overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_th]:h-10 [&_th]:border-b [&_th]:border-[#dbe7e5] [&_th]:bg-[#f5fafa] [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_td]:h-16 [&_td]:border-b [&_td]:border-[#dbe7e5] [&_td]:px-4 [&_td]:text-label [&_td]:text-[#667775] [&_td_img]:h-[38px] [&_td_img]:w-[54px] [&_td_img]:object-cover">
        <table>
          <thead>
            <tr>
              <th>THỜI GIAN</th>
              <th>NGƯỜI THỰC HIỆN</th>
              <th>THAO TÁC</th>
              <th>TÀI NGUYÊN</th>
              <th>REQUEST ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((x) => (
              <tr key={x.id}>
                <td>{new Date(x.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  {x.actor?.name ?? "Hệ thống"}
                  <small>{x.actor?.email}</small>
                </td>
                <td>{x.action}</td>
                <td>
                  {x.resource} {x.resourceId}
                </td>
                <td>{x.requestId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
