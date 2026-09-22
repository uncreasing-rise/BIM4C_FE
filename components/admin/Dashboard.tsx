"use client";
import {
  getDashboard,
  type DashboardStats,
  type RecentContent,
} from "@/features/admin/api/dashboard";
import {
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Database,
  Edit3,
  FileText,
  FolderPlus,
  GraduationCap,
  Layers,
  Plus,
  Server,
  ShieldCheck,
  TrendingUp,
  Users,
  Radio,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { useEffect, useState } from "react";

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

  function retry() {
    setError("");
    void getDashboard()
      .then(([s, r]) => {
        setStats(s.data);
        setRecent(r.data || []);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Không thể tải dashboard"),
      );
  }

  useEffect(() => {
    void getDashboard()
      .then(([s, r]) => {
        setStats(s.data);
        setRecent(r.data || []);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Không thể tải dashboard"),
      );
  }, []);

  if (error)
    return <ErrorState message={error} onRetry={retry} />;

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
  const contactsCount = Array.isArray(stats.contacts)
    ? stats.contacts.reduce((n, x) => n + (x?._count ?? 0), 0)
    : 0;
  const registrationsCount = Array.isArray(stats.registrations)
    ? stats.registrations.reduce((n, x) => n + (x?._count ?? 0), 0)
    : 0;
  const newsletterCount = Array.isArray(stats.newsletter)
    ? stats.newsletter.reduce((n, x) => n + (x?._count ?? 0), 0)
    : 0;
  const leads = contactsCount + registrationsCount;

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
      color:
        "from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20",
    },
    {
      title: "Bản nháp",
      value: drafts,
      sub: "Đang biên tập",
      icon: Edit3,
      badge: "Cần duyệt",
      color:
        "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20",
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
                  <span className="text-muted-foreground font-mono">
                    {card.sub}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                    {card.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Analytics & Performance Charts */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Growth Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border/70 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Chỉ số Tăng trưởng & Tương tác
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Phân tích lưu lượng yêu cầu đối tác và đăng ký đào tạo
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary font-mono border border-primary/20">
              <Activity className="size-3 animate-pulse text-primary" /> REALTIME
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Users className="size-3.5 text-blue-500" /> Liên hệ tư vấn BIM
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{contactsCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Trực tiếp website</span>
                <span className="text-emerald-500 font-semibold font-mono">+{contactsCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-teal-500" /> Học viên ghi danh
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{registrationsCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>BIM Academy</span>
                <span className="text-teal-500 font-semibold font-mono">+{registrationsCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-500" /> Đăng ký bản tin
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{newsletterCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>Newsletter</span>
                <span className="text-amber-500 font-semibold font-mono">+{newsletterCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-primary/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <Radio className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Trạng thái đồng bộ dữ liệu</div>
                <div className="text-[11px] text-muted-foreground">Các kênh tiếp nhận thông tin phản hồi hoạt động liên tục 24/7</div>
              </div>
            </div>
            <Link
              href="/admin/lien-he"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Xem liên hệ <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Content Distribution Breakdown */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border/70 pb-4 mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Cơ cấu Danh mục Nội
              dung
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Phân bổ tỷ trọng các chuyên mục trong hệ thống
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                name: "Khóa học Đào tạo (Academy)",
                count: stats.courses?.total ?? 0,
                color: "bg-teal-500",
              },
              {
                name: "Dự án BIM Tiêu biểu",
                count: stats.projects?.total ?? 0,
                color: "bg-primary",
              },
              {
                name: "Tin tức & Chuyên san",
                count: stats.posts?.total ?? 0,
                color: "bg-emerald-500",
              },
              {
                name: "Giải pháp Dịch vụ BIM4C",
                count: stats.services?.total ?? 0,
                color: "bg-amber-500",
              },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {cat.count} mục
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    style={{
                      width: `${total ? (cat.count / total) * 100 : 0}%`,
                    }}
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
            <span>Độ phủ hệ sinh thái</span>
            <span className="font-bold text-primary">{total} mục nội dung</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts & System Health */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
              <Plus className="size-4 text-primary" /> Phím tắt tác vụ nhanh
              (Quick Actions)
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Khởi tạo nội dung mới và truy cập nhanh các nghiệp vụ quản trị
              trọng tâm
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/du-an"
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
            >
              <div className="size-9 rounded-lg bg-teal-500/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Layers className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                Thêm Dự Án
              </span>
              <span className="text-[10px] text-muted-foreground">
                Portfolio BIM
              </span>
            </Link>

            <Link
              href="/admin/tin-tuc"
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
            >
              <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileText className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                Viết Bài Mới
              </span>
              <span className="text-[10px] text-muted-foreground">
                Tin tức & Blog
              </span>
            </Link>

            <Link
              href="/admin/khoa-hoc"
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
            >
              <div className="size-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                Tạo Khóa Học
              </span>
              <span className="text-[10px] text-muted-foreground">Academy</span>
            </Link>

            <Link
              href="/admin/media"
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-center"
            >
              <div className="size-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FolderPlus className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                Tải Media
              </span>
              <span className="text-[10px] text-muted-foreground">
                Thư viện tệp
              </span>
            </Link>
          </div>
        </div>

        {/* System & Services Health */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border/70 pb-4 mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" /> Tình trạng Hệ thống
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giám sát hạ tầng máy chủ và bảo mật dữ liệu
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <Database className="size-3.5 text-primary" /> Cơ sở dữ liệu PostgreSQL
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-500 font-mono text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Sẵn sàng
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <Server className="size-3.5 text-blue-500" /> API Gateway & Cache
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-500 font-mono text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Hoạt động
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <FolderPlus className="size-3.5 text-purple-500" /> Lưu trữ Media CDN
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-500 font-mono text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Kết nối
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
            <span>Bảo mật phiên quản trị</span>
            <span className="font-bold text-emerald-500">Mã hóa 256-bit</span>
          </div>
        </div>
      </div>

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
                <th className="py-3.5 pl-6 pr-4 font-semibold">
                  TIÊU ĐỀ & ĐƯỜNG DẪN
                </th>
                <th className="px-4 py-3.5 font-semibold">PHÂN LOẠI</th>
                <th className="px-4 py-3.5 font-semibold">TRẠNG THÁI</th>
                <th className="px-4 py-3.5 font-semibold">CẬP NHẬT</th>
                <th className="py-3.5 pl-4 pr-6 text-right font-semibold">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    Chưa có hoạt động cập nhật nội dung nào gần đây.
                  </td>
                </tr>
              ) : (
                recent.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
                          <Image
                            src={item.image || "/images/service-design.jpg"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
