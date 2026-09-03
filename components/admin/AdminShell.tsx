"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { can, currentAdmin, type AdminIdentity } from "@/features/admin/auth";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: "⌂" },
  { href: "/admin/trang-chu", label: "Trang chủ", icon: "◦" },
  { href: "/admin/tin-tuc", label: "Tin tức", icon: "▤" },
  { href: "/admin/du-an", label: "Dự án", icon: "◇" },
  { href: "/admin/khoa-hoc", label: "Khóa học", icon: "▱" },
  { href: "/admin/dich-vu", label: "Dịch vụ", icon: "◈" },
  { href: "/admin/media", label: "Thư viện", icon: "▧" },
  { href: "/admin/lien-he", label: "Liên hệ", icon: "✉" },
  { href: "/admin/dang-ky-khoa-hoc", label: "Đăng ký khóa học", icon: "▥" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "◎" },
];
const system = [
  {
    href: "/admin/nguoi-dung",
    label: "Người dùng",
    icon: "♙",
    permission: "users.read",
  },
  {
    href: "/admin/nhat-ky",
    label: "Nhật ký",
    icon: "≡",
    permission: "audit.read",
  },
  {
    href: "/admin/cai-dat",
    label: "Cài đặt",
    icon: "⚙",
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
  useEffect(() => {
    currentAdmin()
      .then(setUser)
      .catch(() =>
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`),
      );
  }, [pathname, router]);
  const links = (
    items: Array<{
      href: string;
      label: string;
      icon: string;
      permission?: string;
    }>,
  ) =>
    items
      .filter((item) => !item.permission || can(user, item.permission))
      .map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            onClick={() => setOpen(false)}
            className={`relative flex min-h-[46px] items-center gap-3 rounded-md px-3 text-sm font-medium transition ${active ? "bg-background/10 text-white before:absolute before:-left-4 before:h-[22px] before:w-[3px] before:bg-primary" : "text-white/70 hover:bg-background/10 hover:text-white"}`}
            href={item.href}
            prefetch={false}
            key={item.href}
          >
            <span className="w-[22px] text-center text-lg text-white/60">
              {item.icon}
            </span>
            {item.label}
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
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-foreground px-4 pb-[18px] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[86px] flex-col justify-center border-b border-white/10 px-3">
          <Link className="text-2xl font-bold leading-none" href="/">
            BIM<span className="text-primary">4C</span>
          </Link>
          <small className="mt-2 text-xs font-semibold tracking-[.18em] text-white/50">
            CONTENT STUDIO
          </small>
        </div>
        <nav className="pt-[18px]">
          <p className="mx-3 mb-2 mt-[18px] text-xs font-semibold tracking-[.14em] text-white/40">
            QUẢN TRỊ
          </p>
          {links(navigation)}
          <p className="mx-3 mb-2 mt-[18px] text-xs font-semibold tracking-[.14em] text-white/40">
            HỆ THỐNG
          </p>
          {links(system)}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-2 pt-4">
          <div className="grid size-[38px] place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user?.name?.slice(0, 2).toUpperCase() ?? "--"}
          </div>
          <span className="flex min-w-0 flex-1 flex-col">
            <strong className="text-xs">{user?.name ?? "Đang tải…"}</strong>
            <small className="text-xs text-white/50">
              {user?.roles.join(", ")}
            </small>
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => void logout()}
            aria-label="Đăng xuất"
          >
            <LogOut />
          </Button>
        </div>
      </aside>
      {open && (
        <Button
          variant="ghost"
          className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <main className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
          >
            <Menu />
          </Button>
          <div className="relative w-[min(440px,45vw)]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="bg-muted pl-9 text-xs"
              aria-label="Tìm kiếm toàn hệ thống"
              placeholder="Tìm nội dung, dự án, khóa học..."
            />
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              className="hidden text-xs font-semibold text-muted-foreground sm:block"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem website ↗
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => void logout()}
            >
              Đăng xuất
            </Button>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-[.12em] text-muted-foreground">
                BIM4C / ADMIN
              </p>
              <h1 className="mb-1.5 text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
            {action}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
