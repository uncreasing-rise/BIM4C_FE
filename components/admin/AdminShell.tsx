"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, Command, ArrowRight, PlusCircle, LayoutDashboard, FileText, Layers, GraduationCap, Wrench, Folder, Mail, Users, FileClock, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { can, currentAdmin, type AdminIdentity } from "@/features/admin/auth";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/trang-chu", label: "Trang chủ", icon: Sparkles },
  { href: "/admin/tin-tuc", label: "Tin tức", icon: FileText },
  { href: "/admin/du-an", label: "Dự án", icon: Layers },
  { href: "/admin/khoa-hoc", label: "Khóa học", icon: GraduationCap },
  { href: "/admin/dich-vu", label: "Dịch vụ", icon: Wrench },
  { href: "/admin/media", label: "Thư viện", icon: Folder },
  { href: "/admin/lien-he", label: "Liên hệ", icon: Mail },
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

  useEffect(() => {
    currentAdmin()
      .then(setUser)
      .catch(() =>
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`),
      );
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

  const links = (
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
            className={`group relative flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
              active
                ? "bg-primary/20 text-teal-300 font-semibold shadow-sm border-l-2 border-primary"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            href={item.href}
            prefetch={false}
            key={item.href}
          >
            <Icon className={`size-4 transition-transform group-hover:scale-110 ${active ? "text-primary" : "text-slate-400 group-hover:text-white"}`} />
            <span>{item.label}</span>
          </Link>
        );
      });

  async function logout() {
    setUser(null);
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-brand-ink px-4 pb-5 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] flex-col justify-center border-b border-white/10 px-3">
          <Link className="flex items-center gap-2 text-2xl font-bold tracking-tight" href="/">
            <span>BIM<span className="text-primary">4C</span></span>
            <span className="rounded bg-teal-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-300 border border-teal-500/30">
              STUDIO
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto pt-5">
          <div>
            <p className="px-3 mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
              QUẢN TRỊ NỘI DUNG
            </p>
            <div className="space-y-1">{links(navigation)}</div>
          </div>
          <div>
            <p className="px-3 mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
              HỆ THỐNG & CÀI ĐẶT
            </p>
            <div className="space-y-1">{links(system)}</div>
          </div>
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-2 pt-4">
          <div className="grid size-9 place-items-center rounded-full bg-primary/20 text-xs font-bold text-teal-300 border border-teal-500/30">
            {user?.name?.slice(0, 2).toUpperCase() ?? "--"}
          </div>
          <span className="flex min-w-0 flex-1 flex-col">
            <strong className="text-xs font-semibold truncate">{user?.name ?? "Đang tải…"}</strong>
            <small className="text-[11px] font-mono text-slate-400 truncate">
              {user?.roles.join(", ")}
            </small>
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:bg-white/10 hover:text-white"
            onClick={() => void logout()}
            aria-label="Đăng xuất"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}

      <main className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            <Menu className="size-5" />
          </Button>

          {/* Quick Command Launcher Button */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-muted/50 px-3.5 py-2 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted w-full max-w-sm"
          >
            <Search className="size-4 text-primary" />
            <span className="flex-1 text-left truncate">Tìm kiếm nhanh tính năng...</span>
            <kbd className="hidden rounded bg-background border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-block">
              Ctrl K
            </kbd>
          </button>

          <div className="flex items-center gap-3 md:gap-5">
            <Link
              className="hidden rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary sm:block"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem Website ↗
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

        <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[.12em] text-muted-foreground font-mono">
                BIM4C // STUDIO ADMIN
              </p>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
