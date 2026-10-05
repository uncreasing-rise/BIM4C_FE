"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { CompanyMetric } from "@/features/settings/types";
import {
  BarChart3,
  Building2,
  FileText,
  Globe,
  Plus,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { adminRequest } from "@/features/admin/api/http-client";
import { BilingualField, fieldDomId, focusField } from "./bilingual";
import { DEFAULT_DESCRIPTION, DEFAULT_DESCRIPTION_EN, DEFAULT_TITLE, DEFAULT_TITLE_EN } from "@/lib/seo/site";

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
  defaultSeoTitle_vi?: string | null;
  defaultSeoDescription_vi?: string | null;
  defaultOgImage?: string;
};

export function SettingsManager() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [socialLinksJson, setSocialLinksJson] = useState("");
  const [socialLinksError, setSocialLinksError] = useState("");
  // Serialized form state as last loaded/saved, to detect unsaved changes.
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const snapshotOf = (value: Settings | null, links: string) =>
    JSON.stringify([value, links]);
  const dirty =
    Boolean(data) && snapshotOf(data, socialLinksJson) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

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
          metrics: Array.isArray(body.data.metrics) ? body.data.metrics : [],
        };
        setData(merged);
        setSocialLinksJson(JSON.stringify(merged.socialLinks, null, 2));
        setSavedSnapshot(
          snapshotOf(merged, JSON.stringify(merged.socialLinks, null, 2)),
        );
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

  const addMetric = () => {
    if (!data) return;
    setData({
      ...data,
      metrics: [
        ...(data.metrics ?? []),
        { value: "", label_vi: "", label_en: "" },
      ],
    });
  };

  const removeMetric = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      metrics: (data.metrics ?? []).filter((_, i) => i !== index),
    });
  };

  const handleMetricChange = (
    index: number,
    field: keyof CompanyMetric,
    val: string,
  ) => {
    if (!data) return;
    const currentMetrics = [...(data.metrics ?? [])];
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
    // The API requires the English defaults; say which field instead of a generic 400.
    if ((data.defaultSeoTitle ?? "").trim().length < 2) {
      toast.error("Tiêu đề SEO mặc định (English) cần ít nhất 2 ký tự.");
      focusField(fieldDomId("defaultSeoTitle", "en"));
      return;
    }
    if ((data.defaultSeoDescription ?? "").trim().length < 10) {
      toast.error("Mô tả SEO mặc định (English) cần ít nhất 10 ký tự.");
      focusField(fieldDomId("defaultSeoDescription", "en"));
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
        metrics: data.metrics ?? [],
        socialLinks,
        defaultSeoTitle: data.defaultSeoTitle,
        defaultSeoDescription: data.defaultSeoDescription,
        defaultSeoTitle_vi: data.defaultSeoTitle_vi?.trim() || null,
        defaultSeoDescription_vi: data.defaultSeoDescription_vi?.trim() || null,
        defaultOgImage: data.defaultOgImage || (null as unknown as string),
      };

      await adminRequest<{ data: Settings }>("settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Đã lưu cài đặt.", { id: toastId });
      setMsg("");
      setSavedSnapshot(snapshotOf(data, socialLinksJson));
      await revalidateCmsCache();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể lưu cài đặt";
      toast.error(errorMsg, { id: toastId });
      setMsg(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-12 text-center text-sm text-muted-foreground animate-pulse">
        Đang tải thông tin cấu hình hệ thống…
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="rounded-xl border border-destructive/35 bg-destructive/10 p-6 text-center text-sm text-destructive"
        role="alert"
      >
        {msg || "Không thể tải cài đặt hệ thống."}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={save}>
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="text-[13px] text-slate-600" aria-live="polite">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
              <span
                className="size-1.5 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              Có thay đổi chưa lưu
            </span>
          ) : (
            "Mọi thay đổi đã được lưu"
          )}
        </p>
        <Button
          type="submit"
          size="sm"
          disabled={busy || !dirty}
          className="gap-1.5"
        >
          <Save className="size-4" />
          {busy ? "Đang lưu…" : "Lưu cài đặt"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin doanh nghiệp & Hồ sơ năng lực */}
        <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200 dark:border-border/80 pb-3">
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
              <FileText className="size-3.5 text-primary" /> Đường dẫn tải
              Brochure / Hồ sơ năng lực (PDF)
            </label>
            <Input
              value={data.brochureUrl ?? ""}
              placeholder="https://www.bim4c.vn/brochure.pdf hoặc /files/hsnl.pdf"
              onChange={(e) =>
                setData({ ...data, brochureUrl: e.target.value })
              }
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
        </div>

        {/* Card 2: Cấu hình SEO mặc định & Mạng xã hội */}
        <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200 dark:border-border/80 pb-3">
            <Globe className="size-4 text-primary" /> SEO mặc định & Liên kết
          </h3>
          <BilingualField
            id="defaultSeoTitle"
            label="Tiêu đề SEO mặc định (SEO Title)"
            hint="English bắt buộc; Tiếng Việt để trống = dùng mặc định của website"
            maxLength={240}
            vi={data.defaultSeoTitle_vi}
            en={data.defaultSeoTitle}
            placeholderVi={DEFAULT_TITLE}
            placeholderEn={DEFAULT_TITLE_EN}
            onChange={(lang, value) =>
              setData({ ...data, [lang === "vi" ? "defaultSeoTitle_vi" : "defaultSeoTitle"]: value })
            }
          />
          <BilingualField
            id="defaultSeoDescription"
            label="Mô tả SEO mặc định (Meta Description)"
            hint="Nên 120–160 ký tự"
            multiline
            maxLength={500}
            vi={data.defaultSeoDescription_vi}
            en={data.defaultSeoDescription}
            placeholderVi={DEFAULT_DESCRIPTION}
            placeholderEn={DEFAULT_DESCRIPTION_EN}
            onChange={(lang, value) =>
              setData({ ...data, [lang === "vi" ? "defaultSeoDescription_vi" : "defaultSeoDescription"]: value })
            }
          />
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
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                  LinkedIn Company:
                </span>
                <Input
                  value={data.socialLinks?.linkedin ?? ""}
                  placeholder="https://linkedin.com/company/bim4c"
                  onChange={(e) => {
                    const next = {
                      ...(data.socialLinks || {}),
                      linkedin: e.target.value,
                    };
                    setData({ ...data, socialLinks: next });
                    setSocialLinksJson(JSON.stringify(next, null, 2));
                  }}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Facebook Fanpage:
                </span>
                <Input
                  value={data.socialLinks?.facebook ?? ""}
                  placeholder="https://facebook.com/bim4c"
                  onChange={(e) => {
                    const next = {
                      ...(data.socialLinks || {}),
                      facebook: e.target.value,
                    };
                    setData({ ...data, socialLinks: next });
                    setSocialLinksJson(JSON.stringify(next, null, 2));
                  }}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                  YouTube Channel:
                </span>
                <Input
                  value={data.socialLinks?.youtube ?? ""}
                  placeholder="https://youtube.com/@bim4c"
                  onChange={(e) => {
                    const next = {
                      ...(data.socialLinks || {}),
                      youtube: e.target.value,
                    };
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
      <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200 dark:border-border/80 pb-3">
          <BarChart3 className="size-4 text-primary" /> Chỉ số Năng lực & Thành
          tựu (Track Record Metrics)
        </h3>
        <p className="text-xs text-muted-foreground">
          Các chỉ số này được hiển thị nổi bật trên Trang Chủ (Hero / Stats
          section) và Trang Giới Thiệu (About Us).
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
          {(data.metrics ?? []).map((metric, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-border/80 p-4 bg-slate-50/50 dark:bg-muted/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">
                  Chỉ số #{idx + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Xóa chỉ số #${idx + 1}`}
                  onClick={() => removeMetric(idx)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Giá trị (Số liệu)
                </label>
                <Input
                  value={metric.value}
                  placeholder="50+, 100+, 98%..."
                  onChange={(e) =>
                    handleMetricChange(idx, "value", e.target.value)
                  }
                  className="bg-white dark:bg-background text-sm font-bold"
                />
              </div>
              <BilingualField
                id={`metric-${idx}`}
                label="Nhãn hiển thị"
                vi={metric.label_vi}
                en={metric.label_en}
                placeholderVi="Dự án BIM & Quản lý"
                placeholderEn="BIM & Management Projects"
                onChange={(lang, value) =>
                  handleMetricChange(idx, lang === "vi" ? "label_vi" : "label_en", value)
                }
              />
            </div>
          ))}
        </div>
        {!data.metrics?.length && (
          <p className="text-xs text-muted-foreground">
            Chưa có chỉ số nào. Khối số liệu sẽ được ẩn trên website cho đến khi
            bạn thêm.
          </p>
        )}
        <Button type="button" variant="outline" size="sm" onClick={addMetric}>
          <Plus className="size-4" /> Thêm chỉ số
        </Button>
      </div>
    </form>
  );
}
