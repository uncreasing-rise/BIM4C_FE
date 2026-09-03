"use client";
import { FormEvent, useEffect, useState } from "react";
type Settings = {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
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
        setData(body.data);
        setSocialLinksJson(JSON.stringify(body.data.socialLinks, null, 2));
        setMsg("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setMsg(
            error instanceof Error
              ? error.message
              : "Không thể tải cài đặt",
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
        "Hãy nhập JSON hợp lệ theo dạng { \"tenMang\": \"https://...\" }.",
      );
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, socialLinks }),
      });
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setMsg(
        response.ok
          ? "Đã lưu cài đặt."
          : (body?.message ?? "Không thể lưu"),
      );
    } catch {
      setMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p>Đang tải…</p>;
  if (!data) return <p role="alert">{msg || "Không thể tải cài đặt"}</p>;
  const field = (key: keyof Settings, label: string, type = "text") => (
    <label>
      {label}
      <input
        type={type}
        value={String(data[key] ?? "")}
        onChange={(e) => setData({ ...data, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <form
      className="grid gap-4 rounded-md border border-border bg-background p-5 shadow-sm [&_label]:grid [&_label]:gap-1.5 [&_input]:min-h-10 [&_input]:border [&_input]:border-border [&_input]:px-3 [&_textarea]:border [&_textarea]:border-border [&_textarea]:p-3"
      onSubmit={save}
    >
      {field("companyName", "Tên công ty")}
      {field("email", "Email", "email")}
      {field("phone", "Điện thoại")}
      {field("address", "Địa chỉ")}
      {field("defaultSeoTitle", "SEO title")}
      {field("defaultSeoDescription", "SEO description")}
      {field("defaultOgImage", "Ảnh OpenGraph", "url")}
      <label>
        Liên kết xã hội (JSON)
        <textarea
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
        />
        {socialLinksError && (
          <span id="social-links-error" className="text-xs text-destructive" role="alert">
            {socialLinksError}
          </span>
        )}
      </label>
      {msg && (
        <p className="mx-4 mt-3 flex justify-between bg-primary/10 px-3 py-2.5 text-xs text-primary">
          {msg}
        </p>
      )}
      <button
        disabled={busy}
        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded bg-primary px-[18px] text-xs font-semibold text-white hover:bg-primary disabled:opacity-50"
      >
        {busy ? "Đang lưu…" : "Lưu cài đặt"}
      </button>
    </form>
  );
}
