"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Download,
  Eye,
  MousePointerClick,
  RefreshCw,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import {
  analyticsApi,
  type AnalyticsLeads,
  type AnalyticsRealtime,
  type AnalyticsReport,
} from "@/features/admin/api/analytics.api";
import {
  CLICK_TYPES,
  CONTENT_TYPES,
  DEVICE_LABELS,
  FORM_LABELS,
  LEAD_KINDS,
  PRESETS,
  change,
  contactTarget,
  countryLabel,
  daysBetween,
  formatDay,
  formatDuration,
  formatNumber,
  formatPercent,
  localeLabel,
  mediumLabel,
  pageLabel,
  presetRange,
  sourceLabel,
  toCsv,
  type RangePreset,
} from "@/features/admin/analytics-format";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { EmptyRow, Panel, Tag, formatDateTime, table } from "./admin-ui";

type Tab = "overview" | "content" | "sources" | "behaviour" | "leads";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "content", label: "Trang & nội dung" },
  { id: "sources", label: "Nguồn truy cập" },
  { id: "behaviour", label: "Hành vi & thiết bị" },
  { id: "leads", label: "Khách hàng tiềm năng" },
];

type Metric = "pageviews" | "visitors" | "sessions";
const METRICS: { id: Metric; label: string }[] = [
  { id: "pageviews", label: "Lượt xem trang" },
  { id: "visitors", label: "Khách truy cập" },
  { id: "sessions", label: "Phiên truy cập" },
];

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.bim4c.vn").replace(/\/$/, "");
const siteHref = (path: string) => `${SITE_URL}/vi${path === "/" ? "" : path}`;

function download(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Traffic and interest on the public site, measured first-party without
 * cookies (see lib/analytics/tracker and the BE analytics module).
 */
export function AnalyticsDashboard() {
  const [preset, setPreset] = useState<RangePreset | "custom">("30d");
  const [range, setRange] = useState(() => presetRange("30d"));
  const [tab, setTab] = useState<Tab>("overview");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [leads, setLeads] = useState<AnalyticsLeads | null>(null);
  const [live, setLive] = useState<AnalyticsRealtime | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      analyticsApi.report(range.from, range.to, controller.signal),
      analyticsApi.leads(range.from, range.to, controller.signal),
    ])
      .then(([r, l]) => {
        setReport(r.data);
        setLeads(l.data);
        setError("");
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Không thể tải số liệu truy cập");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range, revision]);

  // Who is on the site now, refreshed every 30 s while the page is open.
  const loadLive = useCallback(() => {
    analyticsApi
      .realtime()
      .then((r) => setLive(r.data))
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    loadLive();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadLive();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [loadLive]);

  const choose = (next: RangePreset) => {
    setPreset(next);
    setLoading(true);
    setRange(presetRange(next));
  };
  const setCustom = (from: string, to: string) => {
    if (!from || !to || from > to) return;
    setPreset("custom");
    setLoading(true);
    setRange({ from, to });
  };
  const refresh = () => {
    setLoading(true);
    setRevision((n) => n + 1);
    loadLive();
  };

  if (error && !report) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-border dark:bg-card" role="group" aria-label="Khoảng thời gian">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={preset === p.id}
                onClick={() => choose(p.id)}
                className={cn(
                  "h-8 rounded-md px-3 text-[13px] font-medium transition",
                  preset === p.id ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground" : "text-slate-600 hover:bg-slate-100 dark:text-muted-foreground dark:hover:bg-muted",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-muted-foreground">
            Từ
            <input type="date" value={range.from} max={range.to} onChange={(e) => setCustom(e.target.value, range.to)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 dark:border-border dark:bg-card" />
            đến
            <input type="date" value={range.to} min={range.from} onChange={(e) => setCustom(range.from, e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 dark:border-border dark:bg-card" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge live={live} />
          <button type="button" onClick={refresh} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium hover:bg-slate-50 dark:border-border dark:bg-card" aria-label="Tải lại số liệu">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} /> Làm mới
          </button>
        </div>
      </div>

      {!report ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6" aria-busy="true" aria-label="Đang tải">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[112px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card" />
          ))}
        </div>
      ) : (
        <div className={cn("space-y-5 transition-opacity", loading && "opacity-60")}>
          <Kpis report={report} leads={leads} />
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-border" aria-label="Nhóm số liệu">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition",
                  tab === t.id ? "border-slate-900 text-slate-900 dark:border-primary dark:text-foreground" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-muted-foreground",
                )}
              >
                {t.label}
                {t.id === "leads" && leads ? <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 text-xs dark:bg-muted">{leads.total}</span> : null}
              </button>
            ))}
          </nav>
          {report.totals.pageviews === 0 && tab !== "leads" ? (
            <Panel>
              <div className="px-2 py-10 text-center">
                <Activity className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 font-medium text-slate-800 dark:text-foreground">Chưa có lượt truy cập trong khoảng thời gian này</p>
                <p className="mt-1 text-sm text-slate-500">Số liệu được ghi nhận từ khi hệ thống thống kê được triển khai lên website. Hãy chọn khoảng thời gian khác hoặc quay lại sau.</p>
              </div>
            </Panel>
          ) : (
            <>
              {tab === "overview" && <Overview report={report} live={live} />}
              {tab === "content" && <ContentTab report={report} />}
              {tab === "sources" && <SourcesTab report={report} leads={leads} />}
              {tab === "behaviour" && <BehaviourTab report={report} />}
            </>
          )}
          {tab === "leads" && leads && <LeadsTab leads={leads} range={report.range} />}
          <p className="text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">
            Số liệu do website tự đo, không dùng cookie và không lưu địa chỉ IP: một khách được nhận diện bằng mã ẩn danh đổi mỗi ngày, nên “Khách truy cập” là tổng số khách của từng ngày.
            Trình duyệt bật “Không theo dõi” (Do Not Track/GPC) và các bot không được tính. So sánh với kỳ trước: {formatDay(report.previousRange.from, true)} – {formatDay(report.previousRange.to, true)}.
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Headline numbers --------------------------------------------------------

function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return <span className="text-xs text-slate-400">mới</span>;
  if (Math.abs(value) < 0.005) return <span className="text-xs text-slate-400">không đổi</span>;
  const good = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", good ? "text-emerald-600" : "text-rose-600")}>
      <Icon className="size-3.5" />
      {formatPercent(Math.abs(value))}
    </span>
  );
}

function Kpi({ label, value, delta, icon: Icon, hint }: { label: string; value: string; delta: number | null; icon: typeof Eye; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card" title={hint}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-600 dark:text-muted-foreground">{label}</span>
        <Icon className="size-4 text-slate-400" />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-foreground">{value}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <Delta value={delta} />
        <span className="text-xs text-slate-400">so với kỳ trước</span>
      </div>
    </div>
  );
}

function Kpis({ report, leads }: { report: AnalyticsReport; leads: AnalyticsLeads | null }) {
  const t = report.totals;
  const p = report.previous;
  const leadCount = leads?.total ?? 0;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi label="Lượt xem trang" value={formatNumber(t.pageviews)} delta={change(t.pageviews, p.pageviews)} icon={Eye} />
      <Kpi label="Khách truy cập" value={formatNumber(t.visitors)} delta={change(t.visitors, p.visitors)} icon={Users} hint="Tổng số khách của từng ngày (mã ẩn danh đổi mỗi ngày)" />
      <Kpi label="Phiên truy cập" value={formatNumber(t.sessions)} delta={change(t.sessions, p.sessions)} icon={Activity} hint={`${t.pagesPerSession.toLocaleString("vi-VN")} trang mỗi phiên`} />
      <Kpi label="Thời gian TB / phiên" value={formatDuration(t.avgSessionMs)} delta={change(t.avgSessionMs, p.avgSessionMs)} icon={Clock} />
      <Kpi label="Tỷ lệ tương tác" value={formatPercent(t.engagementRate)} delta={change(t.engagementRate, p.engagementRate)} icon={MousePointerClick} hint="Phiên xem từ 2 trang, ở lại từ 10 giây hoặc có gửi form" />
      <Kpi
        label="Khách hàng tiềm năng"
        value={formatNumber(leadCount)}
        delta={null}
        icon={UserCheck}
        hint={t.sessions ? `Tỷ lệ chuyển đổi ${formatPercent(t.convertedSessions / t.sessions, 1)} số phiên` : undefined}
      />
    </div>
  );
}

function LiveBadge({ live }: { live: AnalyticsRealtime | null }) {
  const n = live?.activeSessions ?? 0;
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] dark:border-border dark:bg-card" title="Phiên có hoạt động trong 5 phút gần nhất">
      <span className="relative flex size-2.5">
        {n > 0 && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={cn("relative inline-flex size-2.5 rounded-full", n > 0 ? "bg-emerald-500" : "bg-slate-300")} />
      </span>
      <b className="tabular-nums">{formatNumber(n)}</b> đang xem
    </span>
  );
}

// ---- Chart -----------------------------------------------------------------------

function TrendChart({ report }: { report: AnalyticsReport }) {
  const [metric, setMetric] = useState<Metric>("pageviews");
  const [hover, setHover] = useState<number | null>(null);
  const days = useMemo(() => daysBetween(report.range.from, report.range.to), [report.range]);
  const values = useMemo(() => {
    const byDay = new Map(report.series.map((s) => [s.day, s]));
    return days.map((d) => byDay.get(d)?.[metric] ?? 0);
  }, [days, metric, report.series]);
  const W = 800;
  const H = 220;
  const pad = { l: 36, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...values);
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => pad.l + (days.length === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (days.length - 1));
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const labelEvery = Math.max(1, Math.ceil(days.length / 8));
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <Panel
      title="Xu hướng theo ngày"
      description={`${formatNumber(total)} ${METRICS.find((m) => m.id === metric)!.label.toLowerCase()} trong kỳ`}
      actions={
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-muted">
          {METRICS.map((m) => (
            <button key={m.id} type="button" aria-pressed={metric === m.id} onClick={() => setMetric(m.id)} className={cn("h-7 rounded-md px-2.5 text-xs font-medium", metric === m.id ? "bg-white shadow-sm dark:bg-card" : "text-slate-500")}>
              {m.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label="Biểu đồ truy cập theo ngày" onMouseLeave={() => setHover(null)}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={pad.l} x2={W - pad.r} y1={y(top * f)} y2={y(top * f)} className="stroke-slate-100 dark:stroke-border" />
              <text x={pad.l - 6} y={y(top * f) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                {formatNumber(top * f)}
              </text>
            </g>
          ))}
          <path d={area} className="fill-teal-500/10" />
          <path d={line} className="fill-none stroke-teal-600" strokeWidth={2} strokeLinejoin="round" />
          {days.map((d, i) =>
            i % labelEvery === 0 || i === days.length - 1 ? (
              <text key={d} x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
                {formatDay(d)}
              </text>
            ) : null,
          )}
          {days.map((d, i) => (
            <rect
              key={d}
              x={x(i) - (W - pad.l - pad.r) / Math.max(days.length - 1, 1) / 2}
              y={pad.t}
              width={Math.max((W - pad.l - pad.r) / Math.max(days.length - 1, 1), 4)}
              height={H - pad.t - pad.b}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="stroke-slate-300" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(values[hover])} r={4} className="fill-white stroke-teal-600" strokeWidth={2} />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow" style={{ left: `${(x(hover) / W) * 100}%` }}>
            {formatDay(days[hover], true)}: <b>{formatNumber(values[hover])}</b>
          </div>
        )}
      </div>
    </Panel>
  );
}

// ---- Building blocks -----------------------------------------------------------------

/** Ranked list with proportional bars. */
function Bars({ rows, empty = "Chưa có dữ liệu" }: { rows: { label: ReactNode; value: number; sub?: ReactNode; key: string }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0);
  if (!rows.length) return <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-700 dark:text-foreground">{r.label}</span>
            <span className="shrink-0 tabular-nums text-slate-900 dark:text-foreground">
              {formatNumber(r.value)} <span className="text-xs text-slate-400">{formatPercent(total ? r.value / total : 0)}</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-muted">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          {r.sub && <div className="mt-0.5 text-xs text-slate-500">{r.sub}</div>}
        </li>
      ))}
    </ul>
  );
}

function ExportButton({ name, rows }: { name: string; rows: (string | number | null | undefined)[][] }) {
  return (
    <button type="button" onClick={() => download(name, toCsv(rows))} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium hover:bg-slate-50 dark:border-border" aria-label="Xuất CSV">
      <Download className="size-3.5" /> CSV
    </button>
  );
}

function PagesTable({ report, limit }: { report: AnalyticsReport; limit?: number }) {
  const rows = limit ? report.pages.slice(0, limit) : report.pages;
  return (
    <div className={table.wrapper}>
      <table className={table.table}>
        <thead className={table.head}>
          <tr>
            <th className={table.th}>Trang</th>
            <th className={cn(table.th, "text-right")}>Lượt xem</th>
            <th className={cn(table.th, "text-right")}>Khách</th>
            <th className={cn(table.th, "text-right")}>Thời gian xem TB</th>
            <th className={cn(table.th, "text-right")}>Đọc tới</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((p) => (
              <tr key={p.path} className={table.row}>
                <td className={cn(table.td, "max-w-[360px]")}>
                  <a href={siteHref(p.path)} target="_blank" rel="noreferrer" className="block truncate font-medium hover:underline" title={p.path}>
                    {pageLabel(p.path)}
                  </a>
                </td>
                <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(p.views)}</td>
                <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(p.visitors)}</td>
                <td className={cn(table.td, "text-right tabular-nums")}>{formatDuration(p.avgMs)}</td>
                <td className={cn(table.td, "text-right tabular-nums")}>{p.scroll == null ? "—" : `${p.scroll}%`}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5} title="Chưa có lượt xem" />
          )}
        </tbody>
      </table>
    </div>
  );
}

function ContentTable({ report, limit }: { report: AnalyticsReport; limit?: number }) {
  const rows = limit ? report.content.slice(0, limit) : report.content;
  return (
    <div className={table.wrapper}>
      <table className={table.table}>
        <thead className={table.head}>
          <tr>
            <th className={table.th}>Nội dung</th>
            <th className={table.th}>Loại</th>
            <th className={cn(table.th, "text-right")}>Lượt xem</th>
            <th className={cn(table.th, "text-right")}>Khách</th>
            <th className={cn(table.th, "text-right")}>Thời gian xem TB</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((c) => {
              const type = CONTENT_TYPES[c.type];
              return (
                <tr key={`${c.type}:${c.slug}`} className={table.row}>
                  <td className={cn(table.td, "max-w-[360px]")}>
                    <span className="block truncate font-medium" title={c.title ?? c.slug}>
                      {c.title ?? c.slug}
                    </span>
                    <span className="block truncate text-xs text-slate-400">{c.slug}</span>
                  </td>
                  <td className={table.td}>
                    {type ? (
                      <Link href={type.admin} className="hover:underline">
                        <Tag>{type.label}</Tag>
                      </Link>
                    ) : (
                      c.type
                    )}
                  </td>
                  <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(c.views)}</td>
                  <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(c.visitors)}</td>
                  <td className={cn(table.td, "text-right tabular-nums")}>{formatDuration(c.avgMs)}</td>
                </tr>
              );
            })
          ) : (
            <EmptyRow colSpan={5} title="Chưa có ai xem dự án, dịch vụ, khóa học hay bài viết" />
          )}
        </tbody>
      </table>
    </div>
  );
}

function sourceRows(report: AnalyticsReport) {
  return report.sources.map((s) => ({
    key: `${s.source}|${s.medium}`,
    label: (
      <>
        {sourceLabel(s.source)} <span className="text-xs text-slate-400">· {mediumLabel(s.medium)}</span>
      </>
    ),
    value: s.sessions,
    sub: s.conversions ? `${formatNumber(s.conversions)} phiên có gửi form (${formatPercent(s.conversions / s.sessions, 1)})` : undefined,
  }));
}

// ---- Tabs -------------------------------------------------------------------------------

function Overview({ report, live }: { report: AnalyticsReport; live: AnalyticsRealtime | null }) {
  return (
    <div className="space-y-5">
      <TrendChart report={report} />
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Trang được xem nhiều" className="xl:col-span-2" bodyClassName="p-0">
          <PagesTable report={report} limit={8} />
        </Panel>
        <Panel title="Nguồn truy cập" description="Theo số phiên">
          <Bars rows={sourceRows(report).slice(0, 7)} />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Nội dung được quan tâm" className="xl:col-span-2" bodyClassName="p-0">
          <ContentTable report={report} limit={8} />
        </Panel>
        <Panel title="Đang xem ngay lúc này" description="5 phút gần nhất">
          {live?.pages.length ? (
            <Bars rows={live.pages.map((p) => ({ key: p.path, label: pageLabel(p.path), value: p.sessions }))} />
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Không có ai trên website lúc này</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ContentTab({ report }: { report: AnalyticsReport }) {
  return (
    <div className="space-y-5">
      <Panel
        title="Nội dung được quan tâm"
        description="Dự án, dịch vụ, khóa học và bài viết được xem nhiều nhất"
        bodyClassName="p-0"
        actions={<ExportButton name={`noi-dung-${report.range.from}-${report.range.to}.csv`} rows={[["Tiêu đề", "Loại", "Slug", "Lượt xem", "Khách", "Thời gian xem TB (giây)"], ...report.content.map((c) => [c.title ?? "", CONTENT_TYPES[c.type]?.label ?? c.type, c.slug, c.views, c.visitors, c.avgMs == null ? "" : Math.round(c.avgMs / 1000)])]} />}
      >
        <ContentTable report={report} />
      </Panel>
      <Panel
        title="Tất cả các trang"
        bodyClassName="p-0"
        actions={<ExportButton name={`trang-${report.range.from}-${report.range.to}.csv`} rows={[["Trang", "Lượt xem", "Khách", "Thời gian xem TB (giây)", "Đọc tới (%)"], ...report.pages.map((p) => [p.path, p.views, p.visitors, p.avgMs == null ? "" : Math.round(p.avgMs / 1000), p.scroll ?? ""])]} />}
      >
        <PagesTable report={report} />
      </Panel>
      <Panel title="Trang đích" description="Trang đầu tiên khách vào website, và bao nhiêu phiên từ đó có gửi form">
        <Bars rows={report.entries.map((e) => ({ key: e.key, label: pageLabel(e.key), value: e.sessions, sub: e.conversions ? `${formatNumber(e.conversions)} phiên có gửi form` : undefined }))} />
      </Panel>
    </div>
  );
}

function SourcesTab({ report, leads }: { report: AnalyticsReport; leads: AnalyticsLeads | null }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Nguồn & kênh"
          description="Khách đến từ đâu, theo số phiên"
          actions={<ExportButton name={`nguon-${report.range.from}-${report.range.to}.csv`} rows={[["Nguồn", "Kênh", "Phiên", "Phiên có gửi form"], ...report.sources.map((s) => [sourceLabel(s.source), mediumLabel(s.medium), s.sessions, s.conversions])]} />}
        >
          <Bars rows={sourceRows(report)} />
        </Panel>
        <Panel title="Khách hàng tiềm năng theo nguồn" description="Form liên hệ, đăng ký khóa học, lịch tư vấn và bản tin">
          <Bars rows={(leads?.bySource ?? []).map((s) => ({ key: `${s.source}|${s.medium}`, label: `${sourceLabel(s.source)} · ${mediumLabel(s.medium)}`, value: s.leads }))} empty="Chưa có khách hàng tiềm năng trong kỳ" />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Website giới thiệu" description="Trang web khác dẫn khách tới">
          <Bars rows={report.referrers.map((r) => ({ key: r.key, label: r.key, value: r.sessions }))} empty="Chưa có website nào dẫn khách tới" />
        </Panel>
        <Panel title="Chiến dịch (UTM)" description="Gắn ?utm_source=…&utm_medium=…&utm_campaign=… vào link quảng cáo để theo dõi">
          <Bars rows={report.campaigns.map((c) => ({ key: `${c.campaign}|${c.source}`, label: `${c.campaign} · ${sourceLabel(c.source)}`, value: c.sessions, sub: c.conversions ? `${formatNumber(c.conversions)} phiên có gửi form` : undefined }))} empty="Chưa có lượt truy cập từ link có gắn UTM" />
        </Panel>
      </div>
    </div>
  );
}

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function Heatmap({ report }: { report: AnalyticsReport }) {
  const cells = new Map(report.heatmap.map((c) => [`${c.dow}:${c.hour}`, c.views]));
  const max = Math.max(1, ...report.heatmap.map((c) => c.views));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0.5 text-[10px]">
        <thead>
          <tr>
            <th />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="font-normal text-slate-400">
                {h % 3 === 0 ? `${h}h` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOW.map((d, i) => (
            <tr key={d}>
              <th className="pr-1 text-right font-normal text-slate-500">{d}</th>
              {Array.from({ length: 24 }, (_, h) => {
                const v = cells.get(`${i + 1}:${h}`) ?? 0;
                return (
                  <td key={h} title={`${d} ${h}:00–${h + 1}:00 · ${formatNumber(v)} lượt xem`} className="h-6 rounded-sm" style={{ background: v ? `rgba(13,148,136,${0.12 + (0.88 * v) / max})` : "rgba(148,163,184,0.12)" }} />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BehaviourTab({ report }: { report: AnalyticsReport }) {
  const byKey = (rows: { key: string | null; sessions: number }[], label: (k: string | null) => string) =>
    rows.map((r) => ({ key: String(r.key), label: label(r.key), value: r.sessions }));
  return (
    <div className="space-y-5">
      <Panel
        title="Khách bấm vào đâu"
        description="Gọi điện, email, Zalo, tải hồ sơ năng lực, link ra ngoài và các link/nút trên trang"
        bodyClassName="p-0"
        actions={<ExportButton name={`click-${report.range.from}-${report.range.to}.csv`} rows={[["Loại", "Nội dung", "Đích", "Lượt bấm", "Phiên"], ...report.clicks.map((c) => [CLICK_TYPES[c.type]?.label ?? c.type, c.label ?? "", c.target ?? "", c.clicks, c.sessions])]} />}
      >
        <div className={table.wrapper}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Loại</th>
                <th className={table.th}>Nút / link</th>
                <th className={table.th}>Dẫn tới</th>
                <th className={cn(table.th, "text-right")}>Lượt bấm</th>
                <th className={cn(table.th, "text-right")}>Phiên</th>
              </tr>
            </thead>
            <tbody>
              {report.clicks.length ? (
                report.clicks.map((c, i) => (
                  <tr key={`${c.type}:${c.target}:${i}`} className={table.row}>
                    <td className={table.td}>
                      <Tag tone={CLICK_TYPES[c.type]?.tone ?? "neutral"}>{CLICK_TYPES[c.type]?.label ?? c.type}</Tag>
                    </td>
                    <td className={cn(table.td, "max-w-[260px] truncate")} title={c.label ?? ""}>
                      {c.label || "—"}
                    </td>
                    <td className={cn(table.td, "max-w-[300px] truncate text-slate-500")} title={c.target ?? ""}>
                      {c.type === "contact" ? contactTarget(c.target) : c.target ? pageLabel(c.target) : "—"}
                    </td>
                    <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(c.clicks)}</td>
                    <td className={cn(table.td, "text-right tabular-nums")}>{formatNumber(c.sessions)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5} title="Chưa có lượt bấm nào" />
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Form đã gửi">
          <Bars rows={report.forms.map((f) => ({ key: String(f.key), label: FORM_LABELS[f.key ?? ""] ?? f.key ?? "—", value: f.submissions }))} empty="Chưa có form nào được gửi" />
        </Panel>
        <Panel title="Khách tìm gì trên website" description="Từ khóa gõ vào ô tìm kiếm">
          <Bars rows={report.searches.map((s) => ({ key: s.key, label: `“${s.key}”`, value: s.searches }))} empty="Chưa có lượt tìm kiếm" />
        </Panel>
      </div>
      <Panel title="Khung giờ truy cập" description="Lượt xem trang theo thứ và giờ (giờ Việt Nam)">
        <Heatmap report={report} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Thiết bị">
          <Bars rows={byKey(report.devices, (k) => DEVICE_LABELS[k ?? ""] ?? k ?? "—")} />
        </Panel>
        <Panel title="Trình duyệt">
          <Bars rows={byKey(report.browsers, (k) => k ?? "—")} />
        </Panel>
        <Panel title="Hệ điều hành">
          <Bars rows={byKey(report.systems, (k) => k ?? "—")} />
        </Panel>
        <Panel title="Quốc gia">
          <Bars rows={byKey(report.countries, countryLabel)} />
        </Panel>
        <Panel title="Ngôn ngữ trang">
          <Bars rows={byKey(report.locales, localeLabel)} />
        </Panel>
      </div>
    </div>
  );
}

function LeadsTab({ leads, range }: { leads: AnalyticsLeads; range: { from: string; to: string } }) {
  const [kind, setKind] = useState<string>("all");
  const items = kind === "all" ? leads.items : leads.items.filter((i) => i.kind === kind);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(LEAD_KINDS).map(([key, k]) => (
          <Link key={key} href={k.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 dark:border-border dark:bg-card">
            <div className="flex items-center justify-between text-[13px] font-medium text-slate-600 dark:text-muted-foreground">
              {k.label}
              <Target className="size-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{formatNumber(leads.byKind[key] ?? 0)}</div>
          </Link>
        ))}
      </div>
      <Panel
        title="Khách hàng tiềm năng và nguồn của họ"
        description="Mỗi người gửi form: đến từ đâu, vào trang nào đầu tiên và đã xem những trang nào trước khi gửi"
        bodyClassName="p-0"
        actions={
          <div className="flex items-center gap-2">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-border dark:bg-card" aria-label="Loại">
              <option value="all">Tất cả</option>
              {Object.entries(LEAD_KINDS).map(([key, k]) => (
                <option key={key} value={key}>
                  {k.label}
                </option>
              ))}
            </select>
            <ExportButton
              name={`khach-hang-tiem-nang-${range.from}-${range.to}.csv`}
              rows={[
                ["Thời gian", "Loại", "Tên", "Email", "Chi tiết", "Nguồn", "Kênh", "Chiến dịch", "Website giới thiệu", "Trang đích", "Các trang đã xem"],
                ...items.map((i) => [
                  formatDateTime(i.createdAt),
                  LEAD_KINDS[i.kind]?.label ?? i.kind,
                  i.name ?? "",
                  i.email,
                  i.detail ?? "",
                  i.attribution ? sourceLabel(i.attribution.source) : "",
                  i.attribution ? mediumLabel(i.attribution.medium) : "",
                  i.attribution?.campaign ?? "",
                  i.attribution?.referrer ?? "",
                  i.attribution?.landingPage ?? "",
                  (i.attribution?.pages ?? []).join(" → "),
                ]),
              ]}
            />
          </div>
        }
      >
        <div className={table.wrapper}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Khách</th>
                <th className={table.th}>Loại</th>
                <th className={table.th}>Nguồn</th>
                <th className={table.th}>Hành trình trên website</th>
                <th className={table.th}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((i) => (
                  <tr key={`${i.kind}:${i.id}`} className={cn(table.row, "align-top")}>
                    <td className={cn(table.td, "max-w-[220px]")}>
                      <span className="block truncate font-medium">{i.name ?? i.email}</span>
                      {i.name && <span className="block truncate text-xs text-slate-500">{i.email}</span>}
                      {i.detail && <span className="block truncate text-xs text-slate-400">{i.detail}</span>}
                    </td>
                    <td className={table.td}>
                      <Link href={LEAD_KINDS[i.kind]?.href ?? "#"} className="hover:underline">
                        <Tag>{LEAD_KINDS[i.kind]?.label ?? i.kind}</Tag>
                      </Link>
                    </td>
                    <td className={table.td}>
                      {i.attribution ? (
                        <>
                          <span className="block font-medium">{sourceLabel(i.attribution.source)}</span>
                          <span className="block text-xs text-slate-500">
                            {mediumLabel(i.attribution.medium)}
                            {i.attribution.campaign ? ` · ${i.attribution.campaign}` : ""}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa ghi nhận</span>
                      )}
                    </td>
                    <td className={cn(table.td, "max-w-[380px] text-xs text-slate-600 dark:text-muted-foreground")}>
                      {i.attribution?.pages?.length ? (
                        <span className="line-clamp-3" title={i.attribution.pages.join(" → ")}>
                          {i.attribution.pages.map(pageLabel).join(" → ")}
                        </span>
                      ) : i.attribution?.landingPage ? (
                        pageLabel(i.attribution.landingPage)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={cn(table.td, "whitespace-nowrap text-xs")}>{formatDateTime(i.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5} title="Chưa có khách hàng tiềm năng trong kỳ" />
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
