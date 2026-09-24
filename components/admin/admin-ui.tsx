/**
 * Shared admin UI primitives. Every admin screen uses these so spacing,
 * typography, status wording and colours stay consistent.
 */
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-500/15 dark:bg-slate-500/15 dark:text-slate-300",
  info: "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/15 dark:text-blue-300",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/15 dark:text-red-300",
  accent: "bg-teal-50 text-teal-800 ring-teal-600/15 dark:bg-teal-500/15 dark:text-teal-300",
};
const DOT_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-400",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  accent: "bg-teal-500",
};

export type StatusDomain = "content" | "project" | "submission" | "appointment" | "user" | "role" | "audit" | "newsletter";

/** Vietnamese wording for every backend enum, per domain (IN_PROGRESS differs). */
const STATUS: Record<StatusDomain, Record<string, [string, Tone]>> = {
  content: {
    DRAFT: ["Bản nháp", "warning"],
    PUBLISHED: ["Đã xuất bản", "success"],
    ARCHIVED: ["Lưu trữ", "neutral"],
  },
  project: {
    DRAFT: ["Bản nháp", "warning"],
    PROFILED: ["Hồ sơ năng lực", "accent"],
    PLANNED: ["Chuẩn bị triển khai", "info"],
    IN_PROGRESS: ["Đang triển khai", "info"],
    COMPLETED: ["Đã hoàn thành", "success"],
    ARCHIVED: ["Lưu trữ", "neutral"],
    PUBLISHED: ["Đã xuất bản", "success"],
  },
  submission: {
    NEW: ["Mới", "info"],
    IN_PROGRESS: ["Đang xử lý", "warning"],
    RESOLVED: ["Đã xử lý", "success"],
    SPAM: ["Spam", "danger"],
  },
  appointment: {
    REQUESTED: ["Chờ xác nhận", "warning"],
    CONFIRMED: ["Đã xác nhận", "success"],
    CANCELLED: ["Đã hủy", "neutral"],
    COMPLETED: ["Đã diễn ra", "accent"],
    NO_SHOW: ["Vắng mặt", "danger"],
  },
  user: {
    ACTIVE: ["Hoạt động", "success"],
    DISABLED: ["Đã khóa", "neutral"],
  },
  role: {
    SUPER_ADMIN: ["Quản trị cấp cao", "accent"],
    ADMIN: ["Quản trị viên", "info"],
    EDITOR: ["Biên tập viên", "neutral"],
  },
  audit: {
    LOGIN: ["Đăng nhập", "neutral"],
    LOGOUT: ["Đăng xuất", "neutral"],
    CREATE: ["Tạo mới", "success"],
    UPDATE: ["Cập nhật", "info"],
    DELETE: ["Xóa", "danger"],
    PUBLISH: ["Xuất bản", "accent"],
    ARCHIVE: ["Lưu trữ", "neutral"],
    ROLE_CHANGE: ["Đổi vai trò", "warning"],
    SETTINGS_UPDATE: ["Đổi cài đặt", "warning"],
    MEDIA_UPLOAD: ["Tải media", "info"],
    MEDIA_DELETE: ["Xóa media", "danger"],
  },
  newsletter: {
    ACTIVE: ["Đang nhận tin", "success"],
    UNSUBSCRIBED: ["Đã hủy đăng ký", "neutral"],
  },
};

const RESOURCE_LABELS: Record<string, string> = {
  projects: "Dự án",
  services: "Dịch vụ",
  courses: "Khóa học",
  posts: "Bài viết",
  "project-categories": "Danh mục dự án",
  "post-categories": "Danh mục bài viết",
  media: "Thư viện media",
  homepage: "Trang chủ",
  appointments: "Lịch tư vấn",
  contacts: "Liên hệ",
  "course-registrations": "Đăng ký khóa học",
  newsletter: "Bản tin",
  settings: "Cài đặt",
  users: "Người dùng",
  auth: "Phiên đăng nhập",
  "auth.password": "Mật khẩu",
};

/** Human label for an audit-log resource key. */
export function resourceLabel(resource: string | null | undefined): string {
  return (resource && RESOURCE_LABELS[resource]) || resource || "—";
}

export function statusLabel(domain: StatusDomain, value: string | null | undefined): string {
  const key = String(value ?? "").toUpperCase();
  return STATUS[domain][key]?.[0] ?? (value ? String(value) : "—");
}

export function StatusBadge({ domain, value, className }: { domain: StatusDomain; value: string | null | undefined; className?: string }) {
  const key = String(value ?? "").toUpperCase();
  const [label, tone] = STATUS[domain][key] ?? [value ? String(value) : "—", "neutral" as Tone];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset", TONE_CLASSES[tone], className)}>
      <span className={cn("size-1.5 rounded-full", DOT_CLASSES[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}

export function Tag({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-md px-2 text-xs font-medium ring-1 ring-inset", TONE_CLASSES[tone], className)}>
      {children}
    </span>
  );
}

/** Card surface with an optional header row. */
export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  icon: Icon,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            {title && (
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                {Icon && <Icon className="size-4 text-slate-500" />}
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-[13px] text-slate-500 dark:text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-600 dark:text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-slate-400" />}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-muted-foreground">{hint}</div>}
    </>
  );
  const className =
    "block rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors dark:border-border dark:bg-card sm:p-5";
  return href ? (
    <Link href={href} className={cn(className, "hover:border-slate-300 hover:bg-slate-50/60 focus-visible:outline-2 focus-visible:outline-teal-600")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Search / filter / action row above a table. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 border-b border-slate-200 p-3 dark:border-border sm:flex-row sm:items-center sm:p-4", className)}>{children}</div>;
}

/** Consistent table styling, applied as class names on native table elements. */
export const table = {
  wrapper: "overflow-x-auto",
  table: "w-full min-w-[720px] border-collapse text-left text-sm",
  head: "bg-slate-50 text-xs font-medium text-slate-500 dark:bg-muted/40 dark:text-muted-foreground",
  th: "whitespace-nowrap px-4 py-2.5 font-medium",
  row: "border-t border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-border dark:hover:bg-muted/30",
  td: "px-4 py-3 align-middle text-slate-700 dark:text-foreground",
};

export function EmptyRow({ colSpan, title, description }: { colSpan: number; title: string; description?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-foreground">{title}</p>
        {description && <p className="mt-1 text-[13px] text-slate-500">{description}</p>}
      </td>
    </tr>
  );
}

export function formatDateTime(value: string | Date | null | undefined, withTime = true): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  if (!withTime) return day;
  // vi-VN puts the time first; admin tables read better date-first.
  const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  return `${day} ${time}`;
}

const VI_DIACRITICS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

/**
 * Which language versions of a bilingual record are incomplete. Names often
 * read the same in both languages, so "English" counts as missing when it is
 * empty or still contains Vietnamese text (an untranslated copy).
 */
export function missingLanguages(item: {
  title?: string | null;
  description?: string | null;
  title_vi?: string | null;
  description_vi?: string | null;
}): ("EN" | "VI")[] {
  const en = `${item.title ?? ""} ${item.description ?? ""}`;
  const missing: ("EN" | "VI")[] = [];
  if (!item.title?.trim() || !item.description?.trim() || VI_DIACRITICS.test(en)) missing.push("EN");
  if (!item.title_vi?.trim() && !item.description_vi?.trim()) missing.push("VI");
  return missing;
}
