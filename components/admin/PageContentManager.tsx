"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminRequest } from "@/features/admin/api/http-client";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { PageContentKey } from "@/features/page-content/types";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Block = { [key: string]: Json };
type Locale = "vi" | "en";

interface PageContentRow {
  key: PageContentKey;
  vi: Block;
  en: Block;
  updatedAt?: string;
}

const TITLED = { title: "", text: "" };

/** Field layout of each block; used when a block (or a list) is empty so admins can refill it. */
const SKELETONS: Record<PageContentKey, Block> = {
  "home.hero": { eyebrow: "", title: "", highlight: "", description: "" },
  company: {
    copyright: "",
    enterpriseInfo: {
      companyName: "",
      internationalName: "",
      shortName: "",
      headquarters: "",
      legalRepresentative: "",
      certificationsTitle: "",
      autodeskCert: "",
    },
  },
  about: {
    eyebrow: "",
    heroTitle: "",
    heroDesc: "",
    letter: { title: "", subtitle: "", paragraphs: [""] },
    visionMission: { vision: TITLED, mission: TITLED },
    workMethod: { eyebrow: "", title: "", intro: "", items: [TITLED] },
    operation: { eyebrow: "", title: "", items: [TITLED] },
    whyChoose: { eyebrow: "", title: "", intro: "", items: [TITLED] },
    whoWeAreEyebrow: "",
    whoWeAreTitle: "",
    whoWeAreP1: "",
    whoWeAreP2: "",
    check1: "",
    check2: "",
    check3: "",
    guidesEyebrow: "",
    guidesTitle: "",
    guidesDesc: "",
    values: {
      integrity: { title: "", desc: "" },
      innovation: { title: "", desc: "" },
      collaboration: { title: "", desc: "" },
    },
    teamEyebrow: "",
    teamTitle: "",
    teamDesc: "",
    teamMembers: [{ name: "", role: "", spec: "", image: "" }],
    ctaEyebrow: "",
    ctaTitle: "",
  },
  "courses.learning": { eyebrow: "", title: "", items: [TITLED] },
  "services.guide": {
    eyebrow: "",
    title: "",
    desc: "",
    items: [{ label: "", slug: "", title: "", description: "", preparation: "" }],
  },
  "services.faq": { eyebrow: "", title: "", desc: "", items: [{ question: "", answer: "" }] },
  contact: {
    commitments: [""],
    officesTitle: "",
    office: { title: "", address: "", phone: "", note: "" },
    map: { eyebrow: "", title: "", desc: "", workingHours: "" },
  },
  detail: {
    trustSignals: {
      ndaTitle: "",
      ndaDesc: "",
      slaTitle: "",
      slaDesc: "",
      expertTitle: "",
      expertDesc: "",
    },
    b2bTraining: { title: "", desc: "", action: "" },
  },
};

const BLOCKS: { key: PageContentKey; label: string; hint: string }[] = [
  { key: "home.hero", label: "Trang chủ · Hero", hint: "Nhãn, tiêu đề và mô tả đầu trang chủ." },
  { key: "about", label: "Giới thiệu", hint: "Thư ngỏ, tầm nhìn, giá trị, đội ngũ và lời kêu gọi." },
  { key: "services.guide", label: "Dịch vụ · Gợi ý bắt đầu", hint: "Các nhu cầu và dịch vụ đề xuất." },
  { key: "services.faq", label: "Dịch vụ · Câu hỏi thường gặp", hint: "Câu hỏi và trả lời trên trang Dịch vụ." },
  { key: "courses.learning", label: "Đào tạo · Cách giảng dạy", hint: "Các giá trị học tập trên trang Đào tạo." },
  { key: "contact", label: "Liên hệ", hint: "Cam kết, văn phòng và thông tin bản đồ." },
  { key: "detail", label: "Trang chi tiết", hint: "Cam kết bảo mật và banner đào tạo doanh nghiệp." },
  { key: "company", label: "Thông tin doanh nghiệp", hint: "Pháp nhân, người đại diện và dòng bản quyền." },
];

const FIELD_LABELS: Record<string, string> = {
  eyebrow: "Nhãn nhỏ",
  title: "Tiêu đề",
  subtitle: "Tiêu đề phụ",
  highlight: "Dòng nhấn mạnh",
  description: "Mô tả",
  desc: "Mô tả",
  text: "Nội dung",
  intro: "Giới thiệu",
  items: "Danh sách",
  paragraphs: "Đoạn văn",
  name: "Họ tên",
  role: "Vai trò",
  spec: "Chuyên môn",
  image: "Ảnh (đường dẫn)",
  question: "Câu hỏi",
  answer: "Trả lời",
  label: "Nhãn nút",
  slug: "Slug dịch vụ liên kết",
  preparation: "Cần chuẩn bị",
  address: "Địa chỉ",
  phone: "Điện thoại",
  note: "Ghi chú",
  action: "Nút hành động",
  copyright: "Dòng bản quyền",
  commitments: "Cam kết",
  teamMembers: "Thành viên",
  metrics: "Chỉ số",
  value: "Giá trị",
};

const humanize = (key: string) =>
  FIELD_LABELS[key] ??
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const isObject = (value: Json | undefined): value is Block =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Stored values over the skeleton, so fields added to a block later still get an input. */
function withSkeleton(skeleton: Json, value: Json | undefined): Json {
  if (value === undefined || value === null) return structuredClone(skeleton);
  if (isObject(skeleton) && isObject(value)) {
    const merged: Block = { ...value };
    for (const [key, child] of Object.entries(skeleton)) merged[key] = withSkeleton(child, value[key]);
    return merged;
  }
  return value;
}

/** Empty copy of a value's shape, used as the template for a new list item. */
function blank(value: Json): Json {
  if (Array.isArray(value)) return [];
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
  return typeof value === "string" ? "" : value;
}

function FieldEditor({
  name,
  value,
  template,
  onChange,
}: {
  name: string;
  value: Json;
  template?: Json;
  onChange: (value: Json) => void;
}) {
  if (typeof value === "string") {
    const long = value.length > 90 || value.includes("\n") || ["text", "desc", "description", "answer", "intro", "spec"].includes(name);
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{humanize(name)}</span>
        {long ? (
          <Textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </label>
    );
  }

  if (Array.isArray(value)) {
    const itemTemplate = blank(value[0] ?? (Array.isArray(template) ? template[0] : "") ?? "");
    return (
      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">{humanize(name)}</legend>
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground">Danh sách trống, khối này sẽ được ẩn trên website.</p>
        )}
        {value.map((item, index) => (
          <div key={index} className="relative rounded-lg border bg-muted/30 p-3 pr-11">
            <button
              type="button"
              aria-label={`Xóa mục ${index + 1}`}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
            <FieldEditor
              name={typeof item === "string" ? `${humanize(name)} ${index + 1}` : `#${index + 1}`}
              value={item}
              onChange={(next) => onChange(value.map((current, i) => (i === index ? next : current)))}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, structuredClone(itemTemplate)])}>
          <Plus className="size-4" /> Thêm mục
        </Button>
      </fieldset>
    );
  }

  if (isObject(value)) {
    return (
      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">{humanize(name)}</legend>
        {Object.entries(value).map(([key, child]) => (
          <FieldEditor
            key={key}
            name={key}
            value={child}
            template={isObject(template) ? template[key] : undefined}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </fieldset>
    );
  }

  return null;
}

/** Edits the bilingual page copy blocks served by `/page-content`. */
export function PageContentManager() {
  const [rows, setRows] = useState<Partial<Record<PageContentKey, PageContentRow>>>({});
  const [active, setActive] = useState<PageContentKey>("home.hero");
  const [locale, setLocale] = useState<Locale>("vi");
  const [draft, setDraft] = useState<{ vi: Block; en: Block } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminRequest<{ data: PageContentRow[] }>("page-content")
      .then((body) => setRows(Object.fromEntries(body.data.map((row) => [row.key, row]))))
      .catch((error: Error) => toast.error(error.message || "Không thể tải nội dung trang"))
      .finally(() => setLoading(false));
  }, []);

  const skeleton = SKELETONS[active];
  const initial = useMemo(
    () => ({
      vi: withSkeleton(skeleton, rows[active]?.vi) as Block,
      en: withSkeleton(skeleton, rows[active]?.en) as Block,
    }),
    [active, rows, skeleton],
  );
  const current = draft ?? initial;
  const block = BLOCKS.find((item) => item.key === active);

  const selectBlock = (key: PageContentKey) => {
    if (draft && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    setDraft(null);
    setActive(key);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = await adminRequest<{ data: PageContentRow }>(`page-content/${encodeURIComponent(active)}`, {
        method: "PATCH",
        body: JSON.stringify(current),
      });
      setRows((prev) => ({ ...prev, [active]: body.data }));
      setDraft(null);
      await revalidateCmsCache(["page-content"]);
      toast.success("Đã lưu nội dung");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu nội dung");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải nội dung…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <nav aria-label="Khối nội dung" className="space-y-1">
        {BLOCKS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => selectBlock(item.key)}
            aria-current={active === item.key}
            className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted aria-[current=true]:bg-primary aria-[current=true]:text-white"
          >
            <span className="block font-medium">{item.label}</span>
            {!rows[item.key] && <span className="text-xs opacity-75">Chưa có nội dung, đang ẩn</span>}
          </button>
        ))}
      </nav>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">{block?.label}</h2>
            <p className="text-sm text-muted-foreground">{block?.hint} Trường để trống sẽ không hiển thị.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 rounded-lg border p-0.5" role="tablist" aria-label="Ngôn ngữ">
              {(["vi", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={locale === code}
                  onClick={() => setLocale(code)}
                  className="rounded-md px-3 py-1 text-xs font-semibold aria-selected:bg-primary aria-selected:text-white"
                >
                  {code === "vi" ? "Tiếng Việt" : "English"}
                </button>
              ))}
            </div>
            <Button type="button" onClick={save} disabled={saving || !draft}>
              <Save className="size-4" /> {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </header>

        <div className="space-y-3">
          {Object.entries(current[locale]).map(([key, value]) => (
            <FieldEditor
              key={`${active}-${locale}-${key}`}
              name={key}
              value={value}
              template={skeleton[key]}
              onChange={(next) =>
                setDraft({ ...current, [locale]: { ...current[locale], [key]: next } })
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
