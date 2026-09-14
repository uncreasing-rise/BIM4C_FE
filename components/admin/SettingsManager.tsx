"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Save,
  Building2,
  Globe,
  Share2,
  Bell,
  Send,
  MailCheck,
  FileText,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ZaloIcon } from "@/components/shared/SocialLinks";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";

type Settings = {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  socialLinks: Record<string, string>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  alertEmail?: string;
  zaloAdminPhone?: string;
  zaloOaId?: string;
  zaloWebhookUrl?: string;
  autoResponderSubject?: string;
  autoResponderBody?: string;
  autoResponderBrochureUrl?: string;
};

export function SettingsManager() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [socialLinksJson, setSocialLinksJson] = useState("");
  const [socialLinksError, setSocialLinksError] = useState("");
  const [testingTg, setTestingTg] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingZalo, setTestingZalo] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as {
          data?: Settings;
          message?: string;
        } | null;
        if (!response.ok || !body?.data) {
          throw new Error(body?.message ?? "Không thể tải cài đặt");
        }

        // Load stored automation settings from localStorage if available as fallback/persistence
        let storedTgToken = "";
        let storedTgChatId = "";
        let storedAlertEmail = "";
        let storedZaloAdminPhone = "0901234567";
        let storedZaloOaId = "18293847291029";
        let storedZaloWebhook = "https://webhook.zalo.me/v1/bim4c-alerts";
        let storedAutoSubj = "Cảm ơn bạn đã liên hệ với BIM4C - Chúng tôi đã nhận được yêu cầu!";
        let storedAutoBody =
          "Kính gửi Quý khách hàng / Học viên,\n\nCảm ơn bạn đã quan tâm đến giải pháp BIM và các chương trình đào tạo tại BIM4C. Chuyên viên tư vấn của chúng tôi sẽ liên hệ lại với bạn trong vòng 2-4 giờ làm việc.\n\nTrân trọng,\nĐội ngũ BIM4C";
        let storedBrochure = "https://bim4c.com/brochure-bim4c-2025.pdf";

        try {
          storedTgToken = localStorage.getItem("bim4c_tg_bot_token") || "";
          storedTgChatId = localStorage.getItem("bim4c_tg_chat_id") || "";
          storedAlertEmail = localStorage.getItem("bim4c_alert_email") || "";
          storedZaloAdminPhone = localStorage.getItem("bim4c_zalo_admin_phone") || storedZaloAdminPhone;
          storedZaloOaId = localStorage.getItem("bim4c_zalo_oa_id") || storedZaloOaId;
          storedZaloWebhook = localStorage.getItem("bim4c_zalo_webhook") || storedZaloWebhook;
          storedAutoSubj = localStorage.getItem("bim4c_auto_subj") || storedAutoSubj;
          storedAutoBody = localStorage.getItem("bim4c_auto_body") || storedAutoBody;
          storedBrochure = localStorage.getItem("bim4c_auto_brochure") || storedBrochure;
        } catch {
          // ignore
        }

        const merged: Settings = {
          ...body.data,
          telegramBotToken: body.data.telegramBotToken || storedTgToken,
          telegramChatId: body.data.telegramChatId || storedTgChatId,
          alertEmail: body.data.alertEmail || storedAlertEmail || body.data.email,
          zaloAdminPhone: body.data.zaloAdminPhone || storedZaloAdminPhone,
          zaloOaId: body.data.zaloOaId || storedZaloOaId,
          zaloWebhookUrl: body.data.zaloWebhookUrl || storedZaloWebhook,
          autoResponderSubject: body.data.autoResponderSubject || storedAutoSubj,
          autoResponderBody: body.data.autoResponderBody || storedAutoBody,
          autoResponderBrochureUrl: body.data.autoResponderBrochureUrl || storedBrochure,
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
    const toastId = toast.loading("Đang lưu cấu hình hệ thống & thông báo...");

    // Save automation tokens locally for demo resilience
    try {
      if (data.telegramBotToken) localStorage.setItem("bim4c_tg_bot_token", data.telegramBotToken);
      if (data.telegramChatId) localStorage.setItem("bim4c_tg_chat_id", data.telegramChatId);
      if (data.alertEmail) localStorage.setItem("bim4c_alert_email", data.alertEmail);
      if (data.zaloAdminPhone) localStorage.setItem("bim4c_zalo_admin_phone", data.zaloAdminPhone);
      if (data.zaloOaId) localStorage.setItem("bim4c_zalo_oa_id", data.zaloOaId);
      if (data.zaloWebhookUrl) localStorage.setItem("bim4c_zalo_webhook", data.zaloWebhookUrl);
      if (data.autoResponderSubject) localStorage.setItem("bim4c_auto_subj", data.autoResponderSubject);
      if (data.autoResponderBody) localStorage.setItem("bim4c_auto_body", data.autoResponderBody);
      if (data.autoResponderBrochureUrl) localStorage.setItem("bim4c_auto_brochure", data.autoResponderBrochureUrl);
    } catch {
      // ignore
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, socialLinks }),
      });
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (response.ok) {
        toast.success("Đã lưu cài đặt hệ thống thành công!", { id: toastId });
        setMsg("Đã lưu cài đặt.");
        void revalidateCmsCache();
      } else {
        const err = body?.message ?? "Không thể lưu cài đặt";
        toast.error(err, { id: toastId });
        setMsg(err);
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ", { id: toastId });
      setMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTestTelegram() {
    if (!data?.telegramBotToken || !data?.telegramChatId) {
      toast.error("Vui lòng nhập Telegram Bot Token và Chat ID trước khi gửi thử!");
      return;
    }
    setTestingTg(true);
    const toastId = toast.loading("Đang gửi thông báo Lead mẫu tới Telegram của Quản trị viên...");
    try {
      const res = await fetch("/api/admin/automation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "telegram",
          botToken: data.telegramBotToken,
          chatId: data.telegramChatId,
        }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || "Lỗi khi gửi Telegram");
      }
      toast.success(resJson.data?.message || "Đã gửi thông báo thử nghiệm thành công tới Telegram!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kiểm tra thất bại", { id: toastId });
    } finally {
      setTestingTg(false);
    }
  }

  async function handleTestZalo() {
    if (!data?.zaloAdminPhone && !data?.zaloWebhookUrl) {
      toast.error("Vui lòng nhập Số điện thoại Zalo của Quản trị viên!");
      return;
    }
    setTestingZalo(true);
    const toastId = toast.loading("Đang gửi tin nhắn báo Lead mới tới Zalo của Quản trị viên...");
    try {
      const res = await fetch("/api/admin/automation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "zalo",
          zaloAdminPhone: data.zaloAdminPhone,
          zaloOaId: data.zaloOaId,
          zaloWebhookUrl: data.zaloWebhookUrl,
        }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || "Lỗi kiểm tra Zalo");
      }
      toast.success(resJson.data?.message || "Đã gửi tin nhắn báo Lead tới Zalo của Quản trị viên!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kiểm tra thất bại", { id: toastId });
    } finally {
      setTestingZalo(false);
    }
  }

  async function handleTestEmail() {
    if (!data?.alertEmail) {
      toast.error("Vui lòng nhập Email nhận thông báo!");
      return;
    }
    setTestingEmail(true);
    const toastId = toast.loading("Đang kiểm tra kết nối dịch vụ Email...");
    try {
      const res = await fetch("/api/admin/automation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          recipientEmail: data.alertEmail,
        }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || "Lỗi cấu hình Email");
      }
      toast.success(`Đã kích hoạt gửi email thông báo tới ${data.alertEmail}!`, { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kiểm tra thất bại", { id: toastId });
    } finally {
      setTestingEmail(false);
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
      <div className="rounded-2xl border border-destructive/35 bg-destructive/10 p-6 text-center text-sm text-destructive" role="alert">
        {msg || "Không thể tải cài đặt hệ thống."}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={save}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin doanh nghiệp */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-slate-200/80 dark:border-border/80 pb-3">
            <Building2 className="size-4 text-primary" /> Thông tin doanh nghiệp
          </h3>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tên công ty / Tổ chức</label>
            <Input
              value={data.companyName ?? ""}
              onChange={(e) => setData({ ...data, companyName: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email liên hệ chính</label>
            <Input
              type="email"
              value={data.email ?? ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Số điện thoại hotline</label>
            <Input
              value={data.phone ?? ""}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Địa chỉ văn phòng</label>
            <Input
              value={data.address ?? ""}
              onChange={(e) => setData({ ...data, address: e.target.value })}
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tiêu đề SEO mặc định (SEO Title)</label>
            <Input
              value={data.defaultSeoTitle ?? ""}
              onChange={(e) => setData({ ...data, defaultSeoTitle: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mô tả SEO mặc định (Meta Description)</label>
            <Textarea
              rows={3}
              value={data.defaultSeoDescription ?? ""}
              onChange={(e) => setData({ ...data, defaultSeoDescription: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Đường dẫn ảnh chia sẻ (OG Image URL)</label>
            <Input
              value={data.defaultOgImage ?? ""}
              onChange={(e) => setData({ ...data, defaultOgImage: e.target.value })}
              placeholder="https://.../og-image.jpg"
              className="bg-white dark:bg-background border-slate-200 dark:border-border"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Share2 className="size-3 text-primary" /> Mạng xã hội (JSON Object)
            </label>
            <Textarea
              rows={3}
              value={socialLinksJson}
              aria-invalid={Boolean(socialLinksError)}
              aria-describedby={socialLinksError ? "social-links-error" : undefined}
              onChange={(e) => {
                setSocialLinksJson(e.target.value);
                try {
                  const parsed: unknown = JSON.parse(e.target.value);
                  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                    throw new Error("invalid shape");
                  }
                  setSocialLinksError("");
                } catch {
                  setSocialLinksError("JSON chưa hợp lệ.");
                }
              }}
              className="font-mono text-xs bg-white dark:bg-background border-slate-200 dark:border-border"
            />
            {socialLinksError && (
              <span id="social-links-error" className="text-xs text-destructive mt-1 block" role="alert">
                {socialLinksError}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Tự động hóa Thông báo Lead (Zalo, Telegram & Email cho Quản trị viên) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-border/80 pb-3">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-amber-500" /> Báo Lead mới cho Ban Quản trị
            </h3>
            <span className="text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/60 flex items-center gap-1">
              <Bell className="size-3" /> Zalo & Telegram Alert
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Ngay khi có khách hàng để lại thông tin cần tư vấn hoặc đăng ký học, hệ thống sẽ <strong>tức thì gửi tin nhắn báo cho Quản trị viên</strong> qua Zalo, Telegram và Email để kịp thời liên hệ tư vấn.
          </p>

          {/* 1. Zalo Alert cho Quản trị viên */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <ZaloIcon className="size-3.5 text-[#0068FF]" /> 1. Báo Lead qua Zalo Quản trị viên
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={testingZalo}
                onClick={handleTestZalo}
                className="h-7 px-2.5 text-[11px] font-semibold text-[#0068FF] hover:bg-[#0068FF]/10"
              >
                {testingZalo ? "Đang gửi..." : "⚡ Test Báo Zalo"}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  SĐT Zalo nhận tin nhắn báo Lead
                </label>
                <Input
                  placeholder="0901 234 567"
                  value={data.zaloAdminPhone ?? ""}
                  onChange={(e) => setData({ ...data, zaloAdminPhone: e.target.value })}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border font-mono text-xs h-8"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Zalo OA ID / Webhook URL
                </label>
                <Input
                  placeholder="18293847291029 hoặc Webhook"
                  value={data.zaloWebhookUrl ?? ""}
                  onChange={(e) => setData({ ...data, zaloWebhookUrl: e.target.value })}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border font-mono text-xs h-8"
                />
              </div>
            </div>
          </div>

          {/* 2. Telegram Alert cho Quản trị viên */}
          <div className="rounded-xl border border-slate-200/80 dark:border-border/70 bg-slate-50/70 dark:bg-muted/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Send className="size-3.5 text-sky-500" /> 2. Báo Lead qua Telegram Group
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={testingTg}
                onClick={handleTestTelegram}
                className="h-7 px-2.5 text-[11px] text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/50"
              >
                {testingTg ? "Đang gửi..." : "🔔 Test Telegram"}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Bot API Token</label>
                <Input
                  type="password"
                  placeholder="123456:ABC-DEF..."
                  value={data.telegramBotToken ?? ""}
                  onChange={(e) => setData({ ...data, telegramBotToken: e.target.value })}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border font-mono text-xs h-8"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Chat ID / Group nhận tin</label>
                <Input
                  placeholder="-100192837465"
                  value={data.telegramChatId ?? ""}
                  onChange={(e) => setData({ ...data, telegramChatId: e.target.value })}
                  className="bg-white dark:bg-background border-slate-200 dark:border-border font-mono text-xs h-8"
                />
              </div>
            </div>
          </div>

          {/* 3. Email Alert cho Quản trị viên */}
          <div className="rounded-xl border border-slate-200/80 dark:border-border/70 bg-slate-50/70 dark:bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MailCheck className="size-3.5 text-primary" /> 3. Email nhận thông báo Lead mới
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={testingEmail}
                onClick={handleTestEmail}
                className="h-7 px-2.5 text-[11px] text-primary hover:bg-primary/10"
              >
                {testingEmail ? "Đang gửi..." : "✉️ Test Email"}
              </Button>
            </div>
            <Input
              type="email"
              placeholder="admin@bim4c.com"
              value={data.alertEmail ?? ""}
              onChange={(e) => setData({ ...data, alertEmail: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs h-8"
            />
          </div>
        </div>

        {/* Card 4: Email Chào Mừng & Phản hồi Tự động (Auto-responder) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-border/80 pb-3">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MailCheck className="size-4 text-emerald-500" /> Email cảm ơn & Gửi tài liệu tự động
            </h3>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Đang bật
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Hệ thống tự động gửi email chào mừng và gửi kèm tài liệu / đề cương khóa học ngay khi khách hàng để lại thông tin tư vấn thành công.
          </p>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tiêu đề Email gửi khách hàng</label>
            <Input
              value={data.autoResponderSubject ?? ""}
              onChange={(e) => setData({ ...data, autoResponderSubject: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nội dung thư cảm ơn & Lộ trình tư vấn</label>
            <Textarea
              rows={4}
              value={data.autoResponderBody ?? ""}
              onChange={(e) => setData({ ...data, autoResponderBody: e.target.value })}
              className="bg-white dark:bg-background border-slate-200 dark:border-border resize-none text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <FileText className="size-3.5 text-primary" /> Link đính kèm Brochure / Tài liệu BIM
            </label>
            <Input
              value={data.autoResponderBrochureUrl ?? ""}
              onChange={(e) => setData({ ...data, autoResponderBrochureUrl: e.target.value })}
              placeholder="https://bim4c.com/brochure-bim4c-2025.pdf"
              className="bg-white dark:bg-background border-slate-200 dark:border-border text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={busy}
          className="gap-2 px-8 py-2.5 font-semibold shadow-xs text-sm"
        >
          <Save className="size-4" />
          <span>{busy ? "Đang lưu cấu hình…" : "Lưu tất cả cấu hình"}</span>
        </Button>
      </div>
    </form>
  );
}
