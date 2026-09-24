"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FilePen, Inbox, Mail } from "lucide-react";
import { getDashboard, type DashboardStats, type RecentContent } from "@/features/admin/api/dashboard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Panel, StatCard, StatusBadge, Tag, formatDateTime, table } from "./admin-ui";

const DOMAINS = [
  { key: "projects", type: "project", label: "Dự án", href: "/admin/du-an" },
  { key: "services", type: "service", label: "Dịch vụ", href: "/admin/dich-vu" },
  { key: "courses", type: "course", label: "Khóa học", href: "/admin/khoa-hoc" },
  { key: "posts", type: "post", label: "Tin tức & bài viết", href: "/admin/tin-tuc" },
] as const;
const TYPE_LABEL: Record<string, string> = { project: "Dự án", service: "Dịch vụ", course: "Khóa học", post: "Bài viết" };
const TYPE_HREF: Record<string, string> = { project: "/admin/du-an", service: "/admin/dich-vu", course: "/admin/khoa-hoc", post: "/admin/tin-tuc" };

// Projects are public in every status except draft/archived.
const PUBLIC_STATUSES = ["published", "profiled", "planned", "in_progress", "completed"];

function count(byStatus: Record<string, number> | undefined, keys: string[]) {
  return keys.reduce((n, k) => n + (byStatus?.[k] ?? byStatus?.[k.toUpperCase()] ?? 0), 0);
}
function groupCount<T extends { _count: number }>(rows: T[] | undefined, match: (row: T) => boolean) {
  return (rows ?? []).filter(match).reduce((n, r) => n + r._count, 0);
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentContent[]>([]);
  const [error, setError] = useState("");

  const fetchData = useCallback(
    () =>
      getDashboard()
        .then(([s, r]) => {
          setStats(s.data);
          setRecent(r.data ?? []);
        })
        .catch((e: unknown) => setError(e instanceof Error ? e.message : "Không thể tải dữ liệu tổng quan")),
    [],
  );
  useEffect(() => {
    void fetchData();
  }, [fetchData]);
  const retry = () => {
    setError("");
    void fetchData();
  };

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!stats)
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Đang tải">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );

  const domainStats = DOMAINS.map((d) => {
    const s = stats[d.key];
    return {
      ...d,
      total: s?.total ?? 0,
      published: count(s?.byStatus, PUBLIC_STATUSES),
      drafts: count(s?.byStatus, ["draft"]),
      archived: count(s?.byStatus, ["archived"]),
    };
  });
  const total = domainStats.reduce((n, d) => n + d.total, 0);
  const published = domainStats.reduce((n, d) => n + d.published, 0);
  const drafts = domainStats.reduce((n, d) => n + d.drafts, 0);
  const newContacts = groupCount(stats.contacts, (r) => r.status === "NEW");
  const newRegistrations = groupCount(stats.registrations, (r) => r.status === "NEW");
  const subscribers = groupCount(stats.newsletter, (r) => r.isActive);

  const inbox = [
    { label: "Liên hệ", href: "/admin/lien-he", rows: stats.contacts ?? [] },
    { label: "Đăng ký khóa học", href: "/admin/dang-ky-khoa-hoc", rows: stats.registrations ?? [] },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Đã xuất bản"
          value={published}
          hint={`${total ? Math.round((published / total) * 100) : 0}% trên ${total} mục nội dung`}
          icon={CheckCircle2}
        />
        <StatCard label="Bản nháp" value={drafts} hint="Chưa hiển thị trên website" icon={FilePen} />
        <StatCard
          label="Yêu cầu mới"
          value={newContacts + newRegistrations}
          hint={`${newContacts} liên hệ · ${newRegistrations} đăng ký`}
          icon={Inbox}
          href="/admin/lien-he"
        />
        <StatCard label="Người nhận bản tin" value={subscribers} hint="Đang đăng ký nhận tin" icon={Mail} href="/admin/newsletter" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Nội dung theo trạng thái" className="xl:col-span-2" bodyClassName="p-0">
          <div className={table.wrapper}>
            <table className={`${table.table} min-w-[560px]`}>
              <thead className={table.head}>
                <tr>
                  <th className={table.th}>Loại nội dung</th>
                  <th className={`${table.th} text-right`}>Tổng</th>
                  <th className={`${table.th} text-right`}>Đã xuất bản</th>
                  <th className={`${table.th} text-right`}>Bản nháp</th>
                  <th className={`${table.th} text-right`}>Lưu trữ</th>
                  <th className={table.th}>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {domainStats.map((d) => (
                  <tr key={d.key} className={table.row}>
                    <td className={`${table.td} font-medium text-slate-900`}>{d.label}</td>
                    <td className={`${table.td} text-right tabular-nums`}>{d.total}</td>
                    <td className={`${table.td} text-right tabular-nums`}>{d.published}</td>
                    <td className={`${table.td} text-right tabular-nums ${d.drafts ? "text-amber-700" : ""}`}>{d.drafts}</td>
                    <td className={`${table.td} text-right tabular-nums text-slate-500`}>{d.archived}</td>
                    <td className={`${table.td} text-right`}>
                      <Link href={d.href} className="inline-flex items-center gap-1 text-[13px] font-medium text-teal-700 hover:text-teal-900">
                        Quản lý <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Yêu cầu từ khách hàng" description="Theo trạng thái xử lý">
          <div className="space-y-5">
            {inbox.map((box) => {
              const sum = box.rows.reduce((n, r) => n + r._count, 0);
              return (
                <div key={box.href}>
                  <div className="mb-2 flex items-center justify-between">
                    <Link href={box.href} className="text-[13px] font-medium text-slate-900 hover:text-teal-700">
                      {box.label}
                    </Link>
                    <span className="text-xs tabular-nums text-slate-500">{sum} tổng</span>
                  </div>
                  {sum ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"].map((status) => {
                        const n = groupCount(box.rows, (r) => r.status === status);
                        return n ? (
                          <li key={status} className="flex items-center gap-1.5">
                            <StatusBadge domain="submission" value={status} />
                            <span className="text-xs tabular-nums text-slate-600">{n}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-slate-500">Chưa có yêu cầu.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Cập nhật gần đây" description="10 mục nội dung được chỉnh sửa gần nhất" bodyClassName="p-0">
        <div className={table.wrapper}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Nội dung</th>
                <th className={table.th}>Loại</th>
                <th className={table.th}>Trạng thái</th>
                <th className={table.th}>Cập nhật</th>
                <th className={table.th}>
                  <span className="sr-only">Mở</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                    Chưa có nội dung nào.
                  </td>
                </tr>
              ) : (
                recent.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className={table.row}>
                    <td className={table.td}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                          {item.image && <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[420px] truncate font-medium text-slate-900">{item.title}</span>
                          <span className="block max-w-[420px] truncate text-xs text-slate-500">/{item.slug}</span>
                        </span>
                      </div>
                    </td>
                    <td className={table.td}>
                      <Tag>{TYPE_LABEL[item.type] ?? item.type}</Tag>
                    </td>
                    <td className={table.td}>
                      <StatusBadge domain={item.type === "project" ? "project" : "content"} value={item.status} />
                    </td>
                    <td className={`${table.td} whitespace-nowrap text-slate-500`}>{formatDateTime(item.updatedAt)}</td>
                    <td className={`${table.td} text-right`}>
                      <Link
                        href={TYPE_HREF[item.type] ?? "/admin"}
                        className="text-[13px] font-medium text-teal-700 hover:text-teal-900"
                        aria-label={`Mở danh sách ${TYPE_LABEL[item.type] ?? ""}`}
                      >
                        Mở
                      </Link>
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
