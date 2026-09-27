/** Formatting and labels for the admin analytics page (pure, testable). */

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 86_400_000;

/** Today in Vietnam time, YYYY-MM-DD. */
export function today(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export type RangePreset = "today" | "7d" | "30d" | "90d" | "365d";

export const PRESETS: { id: RangePreset; label: string; days: number }[] = [
  { id: "today", label: "Hôm nay", days: 1 },
  { id: "7d", label: "7 ngày", days: 7 },
  { id: "30d", label: "30 ngày", days: 30 },
  { id: "90d", label: "90 ngày", days: 90 },
  { id: "365d", label: "12 tháng", days: 365 },
];

/** The last `days` days, ending today. */
export function presetRange(preset: RangePreset, now = new Date()): { from: string; to: string } {
  const days = PRESETS.find((p) => p.id === preset)?.days ?? 30;
  const to = today(now);
  return { from: addDays(to, -(days - 1)), to };
}

/** Every day of the range, so days without visits still show on the chart. */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
}

export const formatNumber = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n));

export const formatPercent = (ratio: number, digits = 0) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(ratio * 100)}%`;

/** "45 giây", "3 phút 05 giây", "1 giờ 02 phút". */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút ${String(s % 60).padStart(2, "0")} giây`;
  return `${Math.floor(m / 60)} giờ ${String(m % 60).padStart(2, "0")} phút`;
}

/** Change against the previous period; null when there is nothing to compare. */
export function change(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return (current - previous) / previous;
}

export function formatDay(day: string, withYear = false): string {
  const [y, m, d] = day.split("-");
  return withYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Truy cập trực tiếp",
  google: "Google",
  bing: "Bing",
  coccoc: "Cốc Cốc",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  zalo: "Zalo",
  youtube: "YouTube",
  x: "X (Twitter)",
  instagram: "Instagram",
  tiktok: "TikTok",
  unknown: "Chưa rõ (trước khi đo)",
};

const MEDIUM_LABELS: Record<string, string> = {
  none: "Trực tiếp",
  organic: "Tìm kiếm tự nhiên",
  social: "Mạng xã hội",
  referral: "Website giới thiệu",
  email: "Email",
  cpc: "Quảng cáo trả phí",
  paid: "Quảng cáo trả phí",
  campaign: "Chiến dịch",
  unknown: "—",
};

export const sourceLabel = (source: string) => SOURCE_LABELS[source] ?? source;
export const mediumLabel = (medium: string) => MEDIUM_LABELS[medium] ?? medium;

export const CLICK_TYPES: Record<string, { label: string; tone: "info" | "success" | "warning" | "accent" | "neutral" }> = {
  contact: { label: "Liên hệ nhanh", tone: "success" },
  download: { label: "Tải tài liệu", tone: "accent" },
  outbound: { label: "Link ra ngoài", tone: "warning" },
  click: { label: "Link / nút", tone: "info" },
};

/** What a contact click reached: phone, email or a chat app. */
export function contactTarget(target: string | null): string {
  if (!target) return "—";
  if (target.startsWith("tel:")) return `Gọi ${target.slice(4)}`;
  if (target.startsWith("mailto:")) return `Email ${target.slice(7)}`;
  if (/zalo/i.test(target)) return `Zalo ${target.replace(/^https?:\/\//, "")}`;
  return target.replace(/^https?:\/\//, "");
}

export const CONTENT_TYPES: Record<string, { label: string; admin: string; site: string }> = {
  project: { label: "Dự án", admin: "/admin/du-an", site: "/du-an" },
  service: { label: "Dịch vụ", admin: "/admin/dich-vu", site: "/dich-vu" },
  course: { label: "Khóa học", admin: "/admin/khoa-hoc", site: "/khoa-hoc" },
  post: { label: "Bài viết", admin: "/admin/tin-tuc", site: "/tin-tuc" },
};

export const LEAD_KINDS: Record<string, { label: string; href: string }> = {
  contact: { label: "Liên hệ", href: "/admin/lien-he" },
  course: { label: "Đăng ký khóa học", href: "/admin/dang-ky-khoa-hoc" },
  appointment: { label: "Lịch tư vấn", href: "/admin/lich-tu-van" },
  newsletter: { label: "Bản tin", href: "/admin/newsletter" },
};

export const FORM_LABELS: Record<string, string> = {
  contact: "Form liên hệ",
  course: "Đăng ký khóa học",
  appointment: "Đặt lịch tư vấn",
  newsletter: "Đăng ký bản tin",
};

export const DEVICE_LABELS: Record<string, string> = { desktop: "Máy tính", mobile: "Điện thoại", tablet: "Máy tính bảng" };

const REGION = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["vi"], { type: "region" }) : null;
export function countryLabel(code: string | null): string {
  if (!code) return "Không xác định";
  try {
    return REGION?.of(code) ?? code;
  } catch {
    return code;
  }
}

export const localeLabel = (locale: string | null) => (locale === "en" ? "Tiếng Anh" : locale === "vi" ? "Tiếng Việt" : "Không rõ");

/** A page path as people know it ("/" is the home page). */
export const pageLabel = (path: string) => (path === "/" ? "Trang chủ" : path);

/** CSV with a BOM so Excel opens Vietnamese text correctly. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return `﻿${rows.map((r) => r.map(cell).join(",")).join("\r\n")}`;
}
