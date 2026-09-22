"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import { DEFAULT_METRICS, type CompanyMetric } from "@/features/settings/types";
import { BarChart3, Building2, FileText, Globe, Save, Share2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { adminRequest } from "@/features/admin/api/http-client";

type Settings = {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  brochureUrl?: string;
  metrics?: CompanyMetric[];
  socialLinks: Record<string, string>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage?: string;
};

export function SettingsManager() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [socialLinksJson, setSocialLinksJson] = useState("");
  const [socialLinksError, setSocialLinksError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const body = await adminRequest<{ data: Settings }>("settings", {
          signal: controller.signal,
        });
        if (!body?.data) {
          throw new Error("Không thể tải cài đặt");
        }

        const merged: Settings = {
          ...body.data,
          metrics:
            body.data.metrics && Array.isArray(body.data.metrics) && body.data.metrics.length > 0
              ? body.data.metrics
              : DEFAULT_METRICS,
        };
        setData(merged);
        setSocialLinksJson(JSON.stringify(merged.socialLinks, null, 2));
        setMsg("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setMsg(
            error instanceof Error ? error.message : "Không thể tải cài đặt",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const handleMetricChange = (index: number, field: keyof CompanyMetric, val: string) => {
    if (!data) return;
    const currentMetrics = [...(data.metrics || DEFAULT_METRICS)];
    if (!currentMetrics[index]) {
      currentMetrics[index] = { value: "", label_vi: "", label_en: "" };
    }
    currentMetrics[index] = { ...currentMetrics[index], [field]: val };
    setData({ ...data, metrics: currentMetrics });
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    let socialLinks: Record<string, string>;
    try {
      const parsed: unknown = JSON.parse(socialLinksJson);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        Object.values(parsed).some((value) => typeof value !== "string")
      ) {
        throw new Error("invalid shape");
      }
      socialLinks = parsed as Record<string, string>;
      setSocialLinksError("");
    } catch {
      setSocialLinksError(
        'Hãy nhập JSON hợp lệ theo dạng { "facebook": "https://..." }.',
      );
      return;
    }
    setBusy(true);
    setMsg("");
    const toastId = toast.loading("Đang lưu cấu hình hệ thống...");

    try {
      const payload: Settings = {
        companyName: data.companyName,
        email: data.email,
        phone: data.phone || (null as unknown as string),
        address: data.address || (null as unknown as string),
        brochureUrl: data.brochureUrl || (null as unknown as string),
        metrics: data.metrics || DEFAULT_METRICS,
        socialLinks,
        defaultSeoTitle: data.defaultSeoTitle,
        defaultSeoDescription: data.defaultSeoDescription,
        defaultOgImage: data.defaultOgImage || (null as unknown as string),
      };

      await adminRequest<{ data: Settings }>("settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Đã lưu cài đặt hệ thống thành công!", { id: toastId });
      setMsg("Đã lưu cài đặt.");
      await revalidateCmsCache();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Không thể lưu cài đặt";
      toast.error(errorMsg, { id: toastId });
      setMsg(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-sm text-muted-foreground animate-pulse">
        Đang tải thông tin cấu hình hệ thống…
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="rounded-2xl border border-destructive/35 bg-destructive/10 p-6 text-center text-sm text-destructive"
        role="alert"
      >
        {msg || "Không thể tải cài đặt hệ thống."}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={save}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin doanh nghiệp & Hồ sơ năng lực */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200/80 dark:border-border/80 pb-3">
            <Building2 className="size-4 text-primary" /> Thông tin doanh nghiệp
          </h3>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tên công ty / Tổ chức
            </label>
            <Input
              value={data.companyName ?? ""}
              onChange={(e) =>
                setData({ ...data, companyName: e.target.value })
              }
              required
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Email liên hệ chính
            </label>
            <Input
              type="email"
              value={data.email ?? ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Số điện thoại hotline
            </label>
            <Input
              value={data.phone ?? ""}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Địa chỉ văn phòng
            </label>
            <Input
              value={data.address ?? ""}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" /> Đường dẫn tải Brochure / Hồ sơ năng lực (PDF)
            </label>
            <Input
              value={data.brochureUrl ?? ""}
              placeholder="https://www.bim4c.vn/brochure.pdf hoặc /files/hsnl.pdf"
              onChange={(e) => setData({ ...data, brochureUrl: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
        </div>

        {/* Card 2: Cấu hình SEO mặc định & Mạng xã hội */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200/80 dark:border-border/80 pb-3">
            <Globe className="size-4 text-primary" /> SEO mặc định & Liên kết
          </h3>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tiêu đề SEO mặc định (SEO Title)
            </label>
            <Input
              value={data.defaultSeoTitle ?? ""}
              onChange={(e) =>
                setData({ ...data, defaultSeoTitle: e.target.value })
              }
              required
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Mô tả SEO mặc định (Meta Description)
            </label>
            <Textarea
              rows={3}
              value={data.defaultSeoDescription ?? ""}
              onChange={(e) =>
                setData({ ...data, defaultSeoDescription: e.target.value })
              }
              required
              className="bg-white dark:bg-background border-slate-200 dark:border-border resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Đường dẫn ảnh chia sẻ (OG Image URL)
            </label>
            <Input
              value={data.defaultOgImage ?? ""}
              onChange={(e) =>
                setData({ ...data, defaultOgImage: e.target.value })
              }
              placeholder="https://.../og-image.jpg"
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Share2 className="size-3.5 text-primary" /> Liên kết Mạng xã hội
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">LinkedIn Company:</span>
                <Input
                  value={data.socialLinks?.linkedin ?? ""}
                  placeholder="https://linkedin.com/company/bim4c"
                  onChange={(e) => {
                    const next = { ...(data.socialLinks || {}), linkedin: e.target.value };
                    setData({ ...data, socialLinks: next });
                    setSocialLinksJson(JSON.stringify(next, null, 2));
                  }}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">Facebook Fanpage:</span>
                <Input
                  value={data.socialLinks?.facebook ?? ""}
                  placeholder="https://facebook.com/bim4c"
                  onChange={(e) => {
                    const next = { ...(data.socialLinks || {}), facebook: e.target.value };
                    setData({ ...data, socialLinks: next });
                    setSocialLinksJson(JSON.stringify(next, null, 2));
                  }}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">YouTube Channel:</span>
                <Input
                  value={data.socialLinks?.youtube ?? ""}
                  placeholder="https://youtube.com/@bim4c"
                  onChange={(e) => {
                    const next = { ...(data.socialLinks || {}), youtube: e.target.value };
                    setData({ ...data, socialLinks: next });
                    setSocialLinksJson(JSON.stringify(next, null, 2));
                  }}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
                />
              </div>
            </div>
            {socialLinksError && (
              <p className="text-xs text-destructive">{socialLinksError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Chỉ số năng lực & Thành tựu (Track Record Metrics) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200/80 dark:border-border/80 pb-3">
          <BarChart3 className="size-4 text-primary" /> Chỉ số Năng lực & Thành tựu (Track Record Metrics)
        </h3>
        <p className="text-xs text-muted-foreground">
          Các chỉ số này được hiển thị nổi bật trên Trang Chủ (Hero / Stats section) và Trang Giới Thiệu (About Us).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {(data.metrics || DEFAULT_METRICS).map((metric, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-border/80 p-4 bg-slate-50/50 dark:bg-muted/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">Chỉ số #{idx + 1}</span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Giá trị (Số liệu)
                </label>
                <Input
                  value={metric.value}
                  placeholder="50+, 100+, 98%..."
                  onChange={(e) => handleMetricChange(idx, "value", e.target.value)}
                  className="bg-white dark:bg-background text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Nhãn Tiếng Việt
                </label>
                <Input
                  value={metric.label_vi}
                  placeholder="Dự án BIM & Quản lý"
                  onChange={(e) => handleMetricChange(idx, "label_vi", e.target.value)}
                  className="bg-white dark:bg-background text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Nhãn Tiếng Anh
                </label>
                <Input
                  value={metric.label_en}
                  placeholder="BIM & Management Projects"
                  onChange={(e) => handleMetricChange(idx, "label_en", e.target.value)}
                  className="bg-white dark:bg-background text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={busy}
          className="gap-2 px-8 py-2.5 font-semibold shadow-xs text-sm"
        >
          <Save className="size-4" />
          <span>{busy ? "Đang lưu cấu hình…" : "Lưu cài đặt"}</span>
        </Button>
      </div>
    </form>
  );
}
