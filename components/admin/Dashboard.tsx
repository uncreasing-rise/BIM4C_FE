"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Edit3,
  Users,
  ArrowUpRight,
  TrendingUp,
  Database,
  Layers,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  getDashboard,
  type DashboardStats,
  type RecentContent,
} from "@/features/admin/api/dashboard";

const href: Record<string, string> = {
  project: "/admin/du-an",
  post: "/admin/tin-tuc",
  course: "/admin/khoa-hoc",
  service: "/admin/dich-vu",
};

const label: Record<string, string> = {
  project: "Dự án",
  post: "Tin tức",
  course: "Khóa học",
  service: "Dịch vụ",
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentContent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void getDashboard()
      .then(([s, r]) => {
        setStats(s.data);
        setRecent(r.data);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Không thể tải dashboard"),
      );
  }, []);

  if (error)
    return (
      <section className="overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center text-sm text-destructive shadow-sm">
        <p className="font-semibold">{error}</p>
      </section>
    );

  if (!stats)
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-border/80 bg-card/60 p-6 animate-pulse"
          />
        ))}
      </div>
    );

  const domains = [
    stats.projects,
    stats.posts,
    stats.courses,
    stats.services,
  ].filter(Boolean);

  const total = domains.reduce((n, x) => n + (x?.total ?? 0), 0);
  const published = domains.reduce(
    (n, x) =>
      n +
      (x?.byStatus?.published ?? x?.byStatus?.PUBLISHED ?? 0) +
      (x?.byStatus?.planned ?? x?.byStatus?.PLANNED ?? 0) +
      (x?.byStatus?.in_progress ?? x?.byStatus?.IN_PROGRESS ?? 0) +
      (x?.byStatus?.completed ?? x?.byStatus?.COMPLETED ?? 0),
    0,
  );
  const drafts = domains.reduce(
    (n, x) => n + (x?.byStatus?.draft ?? x?.byStatus?.DRAFT ?? 0),
    0,
  );
  const leads =
    (Array.isArray(stats.contacts)
      ? stats.contacts.reduce((n, x) => n + (x?._count ?? 0), 0)
      : 0) +
    (Array.isArray(stats.registrations)
      ? stats.registrations.reduce((n, x) => n + (x?._count ?? 0), 0)
      : 0);

  const cards = [
    {
      title: "Tổng nội dung",
      value: total,
      sub: "Dự án, bài viết, dịch vụ và khóa học",
      icon: Database,
      badge: "Nội dung",
      color: "from-teal-500/20 to-teal-500/5 text-primary border-primary/20",
    },
    {
      title: "Đã xuất bản",
      value: published,
      sub: `${total ? Math.round((published / total) * 100) : 0}% tổng dữ liệu`,
      icon: CheckCircle2,
      badge: "Đã đăng",
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "Bản nháp",
      value: drafts,
      sub: "Đang biên tập",
      icon: Edit3,
      badge: "Cần duyệt",
      color: "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20",
    },
    {
      title: "Liên hệ & Học viên",
      value: leads,
      sub: "Từ Website & Academy",
      icon: Users,
      badge: "Yêu cầu",
      color: "from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20",
    },
  ];

  return (
    <>
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={`flex size-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} border`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {card.value}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">{card.sub}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                    {card.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 p-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Nội dung cập nhật gần đây
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Dữ liệu thời gian thực từ cơ sở dữ liệu hệ thống
            </p>
          </div>
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-teal-600 dark:text-teal-300">
            AUTO SYNC
          </span>
        </header>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 pl-6 pr-4 font-semibold">TIÊU ĐỀ & ĐƯỜNG DẪN</th>
                <th className="px-4 py-3.5 font-semibold">PHÂN LOẠI</th>
                <th className="px-4 py-3.5 font-semibold">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 font-semibold">CẬP NHẬT</th>
                <th className="py-3.5 pl-4 pr-6 text-right font-semibold">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recent.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <strong className="block truncate font-semibold text-foreground">
                          {item.title}
                        </strong>
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          /{item.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
                      {label[item.type]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-teal-600 dark:text-teal-300 border border-teal-500/20">
                      <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN", {
                      dateStyle: "medium",
                    }).format(new Date(item.updatedAt))}
                  </td>
                  <td className="py-4 pl-4 pr-6 text-right">
                    <Link
                      aria-label={`Mở danh sách ${label[item.type]}`}
                      href={href[item.type]}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
