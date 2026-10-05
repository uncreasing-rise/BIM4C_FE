"use client";

import { useRef } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCopy, Plus, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Side-by-side Vietnamese / English editing helpers. Every translatable field
 * renders both languages next to each other so editors can spot missing or
 * untranslated text at a glance instead of switching tabs.
 */

export type Lang = "vi" | "en";

export const LANGS: Lang[] = ["vi", "en"];

export const LANG_META: Record<Lang, { flag: string; name: string; short: string }> = {
  vi: { flag: "🇻🇳", name: "Tiếng Việt", short: "VI" },
  en: { flag: "🇬🇧", name: "English", short: "EN" },
};

const VI_DIACRITICS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

/** True when text meant to be English still contains Vietnamese diacritics. */
export const looksVietnamese = (text: string | null | undefined) => VI_DIACRITICS.test(text ?? "");

export const filled = (value: string | null | undefined) => Boolean(value && value.trim());

/** DOM id of one language input of a field; used by the checklist to jump to it. */
export const fieldDomId = (id: string, lang: Lang) => `bf-${id}-${lang}`;

/** Scrolls to a field (or a container holding inputs) and focuses it. */
export function focusField(domId: string) {
  const el = document.getElementById(domId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const target =
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
      ? el
      : el.querySelector<HTMLElement>("input, textarea, select, button");
  window.setTimeout(() => target?.focus({ preventScroll: true }), 300);
  el.classList.add("ring-2", "ring-amber-400", "ring-offset-2");
  window.setTimeout(() => el.classList.remove("ring-2", "ring-amber-400", "ring-offset-2"), 1800);
}

export interface TranslationIssue {
  /** DOM id to jump to. */
  target: string;
  /** Human readable field name. */
  label: string;
  lang?: Lang;
  severity: "error" | "warning";
  message: string;
}

/** Status of one language cell, shown under the input. */
function cellStatus(
  lang: Lang,
  value: string,
  other: string,
  required: boolean,
  maxLength?: number,
): { tone: "error" | "warning" | "ok" | "none"; text: string } {
  if (maxLength && value.length > maxLength)
    return { tone: "error", text: `Quá dài: ${value.length}/${maxLength} ký tự` };
  if (!filled(value)) {
    if (filled(other)) return { tone: "warning", text: `Chưa có bản ${LANG_META[lang].name} — bên kia đã nhập` };
    if (required) return { tone: "error", text: "Bắt buộc nhập" };
    return { tone: "none", text: "" };
  }
  if (lang === "en" && looksVietnamese(value))
    return { tone: "warning", text: "Có vẻ vẫn còn chữ tiếng Việt" };
  if (lang === "en" && value.trim().length > 12 && value.trim() === other.trim())
    return { tone: "warning", text: "Giống hệt bản Tiếng Việt — đã dịch chưa?" };
  return { tone: "ok", text: "" };
}

const inputBase =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-background dark:text-foreground";

const toneBorder = {
  error: "border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60",
  warning: "border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-amber-500/20 dark:border-amber-500/60 dark:bg-amber-500/5",
  ok: "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-border",
  none: "border-slate-300 focus:border-teal-600 focus:ring-teal-600/20 dark:border-border",
};

/** Header row naming the two columns; place once above a group of bilingual fields. */
export function BilingualColumnsHeader({ className }: { className?: string }) {
  return (
    <div className={cn("hidden md:grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground", className)}>
      {LANGS.map((lang) => (
        <div key={lang} className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
          <span className="text-sm">{LANG_META[lang].flag}</span>
          {LANG_META[lang].name}
        </div>
      ))}
    </div>
  );
}

function LangTag({ lang }: { lang: Lang }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground md:hidden">
      <span>{LANG_META[lang].flag}</span>
      {LANG_META[lang].name}
    </span>
  );
}

function StatusLine({ tone, text }: { tone: "error" | "warning" | "ok" | "none"; text: string }) {
  if (!text) return null;
  const Icon = tone === "error" ? XCircle : AlertTriangle;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium",
        tone === "error" ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-400",
      )}
    >
      <Icon className="size-3 shrink-0" />
      {text}
    </p>
  );
}

export interface BilingualFieldProps {
  id: string;
  label: string;
  hint?: string;
  vi: string | null | undefined;
  en: string | null | undefined;
  onChange: (lang: Lang, value: string) => void;
  /** Each language must be filled. */
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholderVi?: string;
  placeholderEn?: string;
  /** Larger, bolder input (titles). */
  emphasis?: boolean;
}

/** One translatable text field: Vietnamese on the left, English on the right. */
export function BilingualField({
  id,
  label,
  hint,
  vi,
  en,
  onChange,
  required = false,
  multiline = false,
  rows = 3,
  maxLength,
  placeholderVi,
  placeholderEn,
  emphasis = false,
}: BilingualFieldProps) {
  const values: Record<Lang, string> = { vi: vi ?? "", en: en ?? "" };
  const placeholders: Record<Lang, string | undefined> = { vi: placeholderVi, en: placeholderEn };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <label htmlFor={fieldDomId(id, "vi")} className="text-[13px] font-semibold text-slate-800 dark:text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {LANGS.map((lang) => {
          const other: Lang = lang === "vi" ? "en" : "vi";
          const status = cellStatus(lang, values[lang], values[other], required, maxLength);
          const props = {
            id: fieldDomId(id, lang),
            value: values[lang],
            placeholder: placeholders[lang],
            lang,
            "aria-invalid": status.tone === "error" || undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(lang, e.target.value),
            className: cn(inputBase, toneBorder[status.tone], emphasis && "py-2.5 text-base font-bold"),
          };
          return (
            <div key={lang} className="space-y-1">
              <LangTag lang={lang} />
              {multiline ? <textarea rows={rows} {...props} /> : <input {...props} />}
              <div className="flex min-h-4 items-start justify-between gap-2">
                <StatusLine {...status} />
                <span className="ml-auto flex shrink-0 items-center gap-2">
                  {!filled(values[lang]) && filled(values[other]) && (
                    <button
                      type="button"
                      onClick={() => onChange(lang, values[other])}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
                      title={`Chép nội dung bản ${LANG_META[other].name} sang để dịch tiếp`}
                    >
                      <ClipboardCopy className="size-3" /> Chép từ {LANG_META[other].short}
                    </button>
                  )}
                  {maxLength && values[lang].length > maxLength * 0.8 && (
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
                        values[lang].length > maxLength ? "font-bold text-red-600" : "text-muted-foreground",
                      )}
                    >
                      {values[lang].length}/{maxLength}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Shared (non-translated) field label, so editors know it applies to both languages. */
export function SharedBadge() {
  return (
    <span className="rounded-full bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
      Dùng chung 2 ngôn ngữ
    </span>
  );
}

/** Aligns two lists to the same length so rows pair up. */
function pad(list: string[], length: number) {
  return Array.from({ length }, (_, i) => list[i] ?? "");
}

export interface BilingualListFieldProps {
  id: string;
  label: string;
  hint?: string;
  vi: string[] | null | undefined;
  en: string[] | null | undefined;
  onChange: (next: { vi: string[]; en: string[] }) => void;
  placeholderVi?: string;
  placeholderEn?: string;
  addLabel?: string;
}

/**
 * List of short texts where row N in Vietnamese pairs with row N in English.
 * Enter adds a row, Backspace on an empty row (both sides empty) removes it,
 * pasting several lines fills consecutive rows of that language.
 */
export function BilingualListField({
  id,
  label,
  hint,
  vi,
  en,
  onChange,
  placeholderVi,
  placeholderEn,
  addLabel = "Thêm dòng",
}: BilingualListFieldProps) {
  const viList = vi ?? [];
  const enList = en ?? [];
  const length = Math.max(viList.length, enList.length, 1);
  const rows: Record<Lang, string[]> = { vi: pad(viList, length), en: pad(enList, length) };
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const placeholders: Record<Lang, string | undefined> = { vi: placeholderVi, en: placeholderEn };

  const emit = (next: Record<Lang, string[]>) => onChange({ vi: next.vi, en: next.en });
  const focusLater = (index: number, lang: Lang) =>
    window.setTimeout(() => refs.current[`${lang}-${index}`]?.focus(), 30);

  const setCell = (index: number, lang: Lang, value: string) => {
    const next = { vi: [...rows.vi], en: [...rows.en] };
    const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
    if (value.includes("\n") && lines.length > 1) {
      lines.forEach((line, offset) => {
        const at = index + offset;
        if (at >= next[lang].length) {
          next.vi.push("");
          next.en.push("");
        }
        next[lang][at] = line;
      });
    } else {
      next[lang][index] = value;
    }
    emit(next);
  };

  const addRow = (after: number, lang: Lang = "vi") => {
    const next = { vi: [...rows.vi], en: [...rows.en] };
    next.vi.splice(after + 1, 0, "");
    next.en.splice(after + 1, 0, "");
    emit(next);
    focusLater(after + 1, lang);
  };

  const removeRow = (index: number) => {
    emit({ vi: rows.vi.filter((_, i) => i !== index), en: rows.en.filter((_, i) => i !== index) });
  };

  const missing = LANGS.map((lang) => ({
    lang,
    count: rows[lang].filter((value, i) => !filled(value) && filled(rows[lang === "vi" ? "en" : "vi"][i])).length,
  })).filter((m) => m.count > 0);

  return (
    <div className="space-y-2" id={`bf-${id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">
          {hint ? `${hint} · ` : ""}
          {length} dòng · <kbd className="rounded border border-border bg-muted/40 px-1 font-mono text-[10px]">Enter</kbd> thêm dòng
        </span>
      </div>
      {missing.length > 0 && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3" />
          {missing.map((m) => `${m.count} dòng thiếu bản ${LANG_META[m.lang].name}`).join(" · ")}
        </p>
      )}
      <BilingualColumnsHeader className="pl-8 pr-10" />
      <div className="space-y-2">
        {rows.vi.map((_, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {index + 1}
            </span>
            <div className="grid flex-1 gap-2 md:grid-cols-2">
              {LANGS.map((lang) => {
                const other: Lang = lang === "vi" ? "en" : "vi";
                const value = rows[lang][index];
                const warn =
                  (!filled(value) && filled(rows[other][index])) || (lang === "en" && looksVietnamese(value));
                return (
                  <div key={lang} className="space-y-0.5">
                    <LangTag lang={lang} />
                    <input
                      id={index === 0 ? fieldDomId(id, lang) : undefined}
                      ref={(el) => {
                        refs.current[`${lang}-${index}`] = el;
                      }}
                      lang={lang}
                      value={value}
                      placeholder={placeholders[lang]}
                      onChange={(e) => setCell(index, lang, e.target.value)}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text");
                        if (text.includes("\n")) {
                          e.preventDefault();
                          setCell(index, lang, text);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRow(index, lang);
                        } else if (
                          e.key === "Backspace" &&
                          !rows.vi[index] &&
                          !rows.en[index] &&
                          rows.vi.length > 1
                        ) {
                          e.preventDefault();
                          removeRow(index);
                          focusLater(Math.max(0, index - 1), lang);
                        }
                      }}
                      className={cn(inputBase, warn ? toneBorder.warning : toneBorder.ok)}
                    />
                    {lang === "en" && looksVietnamese(value) && (
                      <StatusLine tone="warning" text="Có vẻ vẫn còn chữ tiếng Việt" />
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.vi.length === 1 && !rows.vi[0] && !rows.en[0]}
              className="mt-1 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
              title="Xóa dòng này (cả 2 ngôn ngữ)"
              aria-label={`Xóa dòng ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addRow(rows.vi.length - 1)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/** Completion summary + clickable list of everything missing or wrong. */
export function TranslationChecklist({
  issues,
  progress,
  className,
}: {
  issues: TranslationIssue[];
  progress: Record<Lang, { done: number; total: number }>;
  className?: string;
}) {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-xs space-y-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">Kiểm tra song ngữ</h3>
        {issues.length === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3" /> Đầy đủ
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-muted-foreground">
            {errors.length > 0 && <span className="text-red-600 dark:text-red-400">{errors.length} lỗi</span>}
            {errors.length > 0 && warnings.length > 0 && " · "}
            {warnings.length > 0 && <span className="text-amber-700 dark:text-amber-400">{warnings.length} cần xem</span>}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {LANGS.map((lang) => {
          const { done, total } = progress[lang];
          const pct = total ? Math.round((done / total) * 100) : 100;
          return (
            <div key={lang} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {LANG_META[lang].flag} {LANG_META[lang].name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {done}/{total} ô
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {issues.length > 0 && (
        <ul className="max-h-[45vh] space-y-1 overflow-y-auto pr-1">
          {[...errors, ...warnings].map((issue, index) => (
            <li key={`${issue.target}-${index}`}>
              <button
                type="button"
                onClick={() => focusField(issue.target)}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-muted"
              >
                {issue.severity === "error" ? (
                  <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                )}
                <span className="min-w-0">
                  <span className="font-semibold text-foreground">
                    {issue.lang && <span className="mr-1">{LANG_META[issue.lang].flag}</span>}
                    {issue.label}
                  </span>
                  <span className="block text-muted-foreground">{issue.message}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Bấm vào từng mục để nhảy tới ô cần sửa. Lỗi đỏ phải sửa trước khi lưu; mục vàng vẫn lưu được nhưng website sẽ
        hiển thị thiếu hoặc lấy tạm bản ngôn ngữ còn lại.
      </p>
    </div>
  );
}
