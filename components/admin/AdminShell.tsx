"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  BookOpen,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileClock,
  Folder,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  RotateCw,
  Search,
  Settings,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  can,
  clearAdminAccessToken,
  clearAdminCache,
  currentAdmin,
  getAdminAccessToken,
  type AdminIdentity,
} from "@/features/admin/auth";
import { env } from "@/lib/config/env";
import { toast } from "sonner";
import { statusLabel } from "./admin-ui";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Tổng quan", icon: LayoutDashboard, permission: "dashboard.read" }],
  },
  {
    label: "Nội dung",
    items: [
      { href: "/admin/du-an", label: "Dự án", icon: Layers, permission: "projects.read" },
      { href: "/admin/dich-vu", label: "Dịch vụ", icon: Wrench, permission: "services.read" },
      { href: "/admin/khoa-hoc", label: "Khóa học", icon: GraduationCap, permission: "courses.read" },
      { href: "/admin/tin-tuc", label: "Tin tức & sự kiện", icon: Newspaper, permission: "posts.read" },
      { href: "/admin/chuyen-mon", label: "Chuyên môn BIM", icon: BookOpen, permission: "posts.read" },
      { href: "/admin/trang-chu", label: "Trang chủ & đối tác", icon: Handshake, permission: "homepage.read" },
      { href: "/admin/media", label: "Thư viện media", icon: Folder, permission: "media.read" },
    ],
  },
  {
    label: "Khách hàng",
    items: [
      { href: "/admin/lien-he", label: "Liên hệ", icon: Inbox, permission: "contacts.read" },
      { href: "/admin/lich-tu-van", label: "Lịch tư vấn", icon: CalendarClock, permission: "appointments.read" },
      { href: "/admin/dang-ky-khoa-hoc", label: "Đăng ký khóa học", icon: UserPlus, permission: "course-registrations.read" },
      { href: "/admin/newsletter", label: "Bản tin", icon: Mail, permission: "newsletter.read" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/admin/nguoi-dung", label: "Người dùng", icon: Users, permission: "users.read" },
      { href: "/admin/nhat-ky", label: "Nhật ký hoạt động", icon: FileClock, permission: "audit.read" },
      { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings, permission: "settings.read" },
    ],
  },
];
const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label || "Chung" })));

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

function initials(name?: string) {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  return ((parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)) || "AD").toUpperCase();
}

export function AdminShell({
  children,
  title,
  description,
  action,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    currentAdmin()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        setQuery("");
        setCursor(0);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
        setMenuOpen(false);
        setOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const allowed = (item: NavItem) => !item.permission || can(user, item.permission);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ITEMS.filter((item) => (!item.permission || can(user, item.permission)) && (!q || item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)));
  }, [query, user]);
  const current = ALL_ITEMS.find((item) => isActive(pathname, item.href));

  async function logout() {
    clearAdminCache();
    setUser(null);
    setMenuOpen(false);
    try {
      const token = getAdminAccessToken();
      await fetch(`${env.apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch {
      // The session is cleared locally either way.
    }
    clearAdminAccessToken();
    router.replace("/admin/login");
    router.refresh();
  }

  async function purgeCache() {
    setRevalidating(true);
    const toastId = toast.loading("Đang làm mới bộ nhớ đệm website…");
    try {
      const token = getAdminAccessToken();
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; data?: { message?: string } };
      if (!res.ok) throw new Error(data.message || "Không thể làm mới bộ nhớ đệm");
      toast.success("Website đã được làm mới. Nội dung mới sẽ hiển thị ngay.", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể làm mới bộ nhớ đệm", { id: toastId });
    } finally {
      setRevalidating(false);
    }
  }

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <div className="admin-workspace min-h-screen bg-slate-50 text-slate-900 dark:bg-background dark:text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
        Bỏ qua điều hướng
      </a>

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Điều hướng quản trị"
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-border dark:bg-card lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 dark:border-border">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="relative size-7 overflow-hidden rounded-md ring-1 ring-slate-200">
              <Image src="/images/bim4c-logo.png" alt="" fill sizes="28px" className="object-contain" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              BIM4C <span className="font-normal text-slate-500">Quản trị</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter(allowed);
            if (!items.length) return null;
            return (
              <div key={group.label || "root"}>
                {group.label && (
                  <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">{group.label}</p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors ${
                            active
                              ? "bg-slate-100 font-medium text-slate-900 dark:bg-muted dark:text-foreground"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`size-4 shrink-0 ${active ? "text-teal-600" : "text-slate-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-border">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ExternalLink className="size-4 text-slate-400" />
            Mở website
          </Link>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-border dark:bg-background/90 sm:px-6">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            aria-controls="admin-sidebar"
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </button>

          <nav aria-label="Vị trí" className="hidden min-w-0 items-center gap-1.5 text-[13px] text-slate-500 md:flex">
            <Link href="/admin" className="hover:text-slate-900">
              Quản trị
            </Link>
            {current && current.href !== "/admin" && (
              <>
                <ChevronRight className="size-3.5 text-slate-300" />
                <span className="text-slate-400">{current.group}</span>
                <ChevronRight className="size-3.5 text-slate-300" />
                <span className="truncate font-medium text-slate-900 dark:text-foreground">{current.label}</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCommandOpen(true);
                setQuery("");
                setCursor(0);
              }}
              className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-border dark:bg-card sm:w-60"
              aria-label="Tìm kiếm nhanh"
            >
              <Search className="size-4" />
              <span className="hidden flex-1 text-left sm:inline">Tìm kiếm…</span>
              <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 font-sans text-[11px] text-slate-500 sm:inline">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              disabled={revalidating}
              onClick={() => void purgeCache()}
              title="Làm mới bộ nhớ đệm website (hiển thị ngay nội dung vừa sửa)"
              aria-label="Làm mới bộ nhớ đệm website"
              className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            >
              <RotateCw className={`size-4 ${revalidating ? "animate-spin" : ""}`} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-9 items-center gap-2 rounded-md pl-1 pr-1.5 hover:bg-slate-100 dark:hover:bg-muted"
              >
                <span className="grid size-7 place-items-center rounded-full bg-teal-600 text-[11px] font-semibold text-white">
                  {initials(user?.name)}
                </span>
                <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-slate-700 md:inline">
                  {user?.name ?? "…"}
                </span>
                <ChevronDown className="hidden size-3.5 text-slate-400 md:block" />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-11 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-border dark:bg-card">
                  <div className="border-b border-slate-100 px-3 py-2.5 dark:border-border">
                    <p className="truncate text-sm font-medium">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    {user?.roles?.[0] && (
                      <p className="mt-1 text-xs text-teal-700">{user.roles.map((r) => statusLabel("role", r)).join(", ")}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void logout()}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="size-4 text-slate-400" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Command palette */}
        {commandOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh]" onMouseDown={() => setCommandOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Tìm kiếm nhanh"
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-border dark:bg-card"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-border">
                <Search className="size-4 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCursor(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCursor((c) => Math.min(results.length - 1, c + 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCursor((c) => Math.max(0, c - 1));
                    } else if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
                  }}
                  placeholder="Tìm trang quản trị…"
                  aria-label="Tìm trang quản trị"
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <kbd className="rounded border border-slate-200 px-1.5 text-[11px] text-slate-500">Esc</kbd>
              </div>
              <ul className="max-h-80 overflow-y-auto p-1.5" role="listbox">
                {results.length === 0 ? (
                  <li className="px-3 py-8 text-center text-sm text-slate-500">Không có trang phù hợp.</li>
                ) : (
                  results.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href} role="option" aria-selected={index === cursor}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(index)}
                          onClick={() => go(item.href)}
                          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm ${index === cursor ? "bg-slate-100 dark:bg-muted" : ""}`}
                        >
                          <Icon className="size-4 text-slate-400" />
                          <span className="flex-1">{item.label}</span>
                          <span className="text-xs text-slate-400">{item.group}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        )}

        <main id="admin-main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-foreground">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

