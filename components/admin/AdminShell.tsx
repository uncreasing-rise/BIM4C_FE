"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  Search,
  LayoutDashboard,
  FileText,
  BookOpen,
  Layers,
  GraduationCap,
  Wrench,
  Folder,
  Mail,
  CalendarClock,
  Users,
  FileClock,
  Settings,
  Handshake,
  RotateCw,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  can,
  currentAdmin,
  clearAdminAccessToken,
  clearAdminCache,
  getAdminAccessToken,
  type AdminIdentity,
} from "@/features/admin/auth";
import { env } from "@/lib/config/env";
import { toast } from "sonner";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/trang-chu", label: "Đối tác & Khách hàng", icon: Handshake },
  { href: "/admin/chuyen-mon", label: "Chuyên môn BIM", icon: BookOpen },
  { href: "/admin/tin-tuc", label: "Tin tức & Sự kiện", icon: FileText },
  { href: "/admin/du-an", label: "Dự án", icon: Layers },
  { href: "/admin/khoa-hoc", label: "Khóa học", icon: GraduationCap },
  { href: "/admin/dich-vu", label: "Dịch vụ", icon: Wrench },
  { href: "/admin/media", label: "Thư viện", icon: Folder },
  { href: "/admin/lien-he", label: "Liên hệ", icon: Mail },
  { href: "/admin/lich-tu-van", label: "Lịch tư vấn", icon: CalendarClock, permission: "appointments.read" },
  { href: "/admin/dang-ky-khoa-hoc", label: "Đăng ký khóa học", icon: GraduationCap },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

const system = [
  {
    href: "/admin/nguoi-dung",
    label: "Người dùng",
    icon: Users,
    permission: "users.read",
  },
  {
    href: "/admin/nhat-ky",
    label: "Nhật ký",
    icon: FileClock,
    permission: "audit.read",
  },
  {
    href: "/admin/cai-dat",
    label: "Cài đặt",
    icon: Settings,
    permission: "settings.read",
  },
];

export function AdminShell({
  children,
  title,
  description,
  action,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [revalidating, setRevalidating] = useState(false);

  useEffect(() => {
    let active = true;
    currentAdmin()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        }
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allLinks = [...navigation, ...system];
  const filteredLinks = searchQuery.trim()
    ? allLinks.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allLinks;

  const renderNavLinks = (
    items: Array<{
      href: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      permission?: string;
    }>,
  ) =>
    items
      .filter((item) => !item.permission || can(user, item.permission))
      .map((item) => {
        const active =
          pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            onClick={() => setOpen(false)}
            className={`group relative flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
              active
                ? "bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 shadow-xs border-l-2 border-teal-400 font-bold"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
            href={item.href}
            prefetch={false}
            key={item.href}
          >
            <Icon
              className={`size-4 transition-transform duration-150 group-hover:scale-110 ${
                active ? "text-teal-400" : "text-slate-400 group-hover:text-teal-300"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      });

  async function logout() {
    clearAdminCache();
    setUser(null);
    setOpen(false);
    try {
      await fetch(`${env.apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAdminAccessToken()
          ? { Authorization: `Bearer ${getAdminAccessToken()}` }
          : undefined,
      });
    } catch {}
    clearAdminAccessToken();
    router.replace("/admin/login");
    router.refresh();
  }

  async function handlePurgeCache() {
    setRevalidating(true);
    const toastId = toast.loading("Đang làm mới bộ nhớ đệm (ISR Cache)...");
    try {
      const res = await fetch("/api/revalidate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi xóa cache");
      toast.success(data.data?.message || "Đã làm mới bộ nhớ đệm toàn bộ website!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa cache thất bại", { id: toastId });
    } finally {
      setRevalidating(false);
    }
  }

  return (
    <div className="admin-workspace min-h-screen bg-slate-50/60 dark:bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar Navigation */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-[#04181f] px-4 pb-5 text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Brand Header */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-2">
          <Link className="flex items-center gap-2.5 font-black tracking-tight" href="/admin">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-teal-500/30 bg-white/95 p-0.5 shadow-md shadow-teal-500/20">
              <Image
                src="/images/bim4c-logo.png"
                alt="BIM4C Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg text-white font-extrabold">BIM<span className="text-teal-400">4C</span></span>
                <span className="rounded bg-teal-500/20 px-1 py-0.2 text-[9px] font-bold font-mono text-teal-300 border border-teal-500/30">
                  CMS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Control Center</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto pt-5 pr-1">
          <div>
            <p className="px-3 mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              QUẢN TRỊ NỘI DUNG
            </p>
            <div className="space-y-1">{renderNavLinks(navigation)}</div>
          </div>
          <div>
            <p className="px-3 mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HỆ THỐNG & CÀI ĐẶT
            </p>
            <div className="space-y-1">{renderNavLinks(system)}</div>
          </div>
        </nav>

        {/* User Identity Card Footer */}
        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4">
          <div className="grid size-9 place-items-center rounded-xl bg-teal-500/20 text-xs font-bold text-teal-300 border border-teal-500/30">
            {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
          </div>
          <span className="flex min-w-0 flex-1 flex-col">
            <strong className="text-xs font-semibold truncate text-slate-100">{user?.name ?? "Admin"}</strong>
            <small className="text-[10px] font-mono text-teal-400 truncate">
              {user?.roles?.join(", ") || "Super Admin"}
            </small>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:bg-white/10 hover:text-white size-8"
            onClick={() => void logout()}
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}

      {/* Main Content Area */}
      <main className="min-w-0 lg:col-start-2 flex flex-col min-h-screen">
        {/* Top Sticky Header Bar */}
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200/80 dark:border-border/80 bg-white/95 dark:bg-background/90 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Quick Command Search Launcher */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-border/80 bg-slate-100/80 dark:bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-muted w-full"
            >
              <Search className="size-4 text-primary" />
              <span className="flex-1 text-left truncate">Tìm kiếm nhanh tính năng...</span>
              <kbd className="hidden rounded bg-white dark:bg-background border border-slate-200 dark:border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-block">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5 md:gap-3">
            {/* Cache Revalidate Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={revalidating}
              onClick={() => void handlePurgeCache()}
              title="Làm mới toàn bộ bộ nhớ đệm (ISR Cache) của website"
              className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <RotateCw className={`size-3.5 ${revalidating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{revalidating ? "Đang xóa cache…" : "Làm mới Cache"}</span>
            </Button>

            {/* Live Website Link */}
            <Link
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:border-primary/40 hover:text-primary"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Xem Website</span>
              <ExternalLink className="size-3" />
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => void logout()}
            >
              Đăng xuất
            </Button>
          </div>
        </header>

        {/* Command Palette Modal */}
        {commandOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center border-b border-border px-4 py-3">
                <Search className="size-4 text-primary mr-3 shrink-0" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gõ tên trang hoặc tính năng muốn tới..."
                  className="border-0 shadow-none focus-visible:ring-0 text-sm h-8 bg-transparent px-0"
                />
                <kbd
                  onClick={() => setCommandOpen(false)}
                  className="rounded bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground cursor-pointer"
                >
                  ESC
                </kbd>
              </div>

              <div className="max-h-72 overflow-y-auto p-2">
                <p className="px-3 py-1 text-[11px] font-mono uppercase text-muted-foreground font-semibold">
                  Điều hướng nhanh
                </p>
                {filteredLinks.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">
                    Không tìm thấy kết quả phù hợp.
                  </p>
                ) : (
                  filteredLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          setCommandOpen(false);
                          router.push(item.href);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="size-4 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.href}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Container */}
        <div className="flex-1 mx-auto w-full max-w-[1440px] p-4 md:p-8">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-[.12em] text-teal-600 dark:text-teal-400 font-mono uppercase">
                BIM4C // ENTERPRISE CMS
              </p>
              <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </div>
            {action}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
