"use client";

import { Button } from "@/components/ui/button";
import { adminRequest } from "@/features/admin/api/http-client";
import { revalidateCmsCache } from "@/features/admin/api/revalidate";
import type { PageContentKey } from "@/features/page-content/types";
import { AlertTriangle, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchBox, matchesSearch } from "./list-controls";
import { BilingualColumnsHeader, BilingualField } from "./bilingual";
import { useConfirm } from "./ConfirmDialog";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Block = { [key: string]: Json };

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

const LONG_FIELDS = ["text", "desc", "description", "answer", "intro", "spec", "heroDesc", "paragraphs", "preparation"];

/** Number of text fields filled in one language but empty in the other. */
function countGaps(vi: Json | undefined, en: Json | undefined): number {
  if (typeof vi === "string" || typeof en === "string") {
    const a = typeof vi === "string" && vi.trim() !== "";
    const b = typeof en === "string" && en.trim() !== "";
    return a !== b ? 1 : 0;
  }
  if (Array.isArray(vi) || Array.isArray(en)) {
    const va = Array.isArray(vi) ? vi : [];
    const ea = Array.isArray(en) ? en : [];
    let total = 0;
    for (let i = 0; i < Math.max(va.length, ea.length); i++) total += countGaps(va[i], ea[i]);
    return total;
  }
  if (isObject(vi) || isObject(en)) {
    const vo = isObject(vi) ? vi : {};
    const eo = isObject(en) ? en : {};
    let total = 0;
    for (const key of new Set([...Object.keys(vo), ...Object.keys(eo)])) total += countGaps(vo[key], eo[key]);
    return total;
  }
  return 0;
}

/**
 * Edits the same field of both languages side by side: strings as a
 * Vietnamese/English input pair, lists row by row, objects recursively.
 */
function PairEditor({
  path,
  name,
  vi,
  en,
  template,
  onChange,
}: {
  path: string;
  name: string;
  vi: Json | undefined;
  en: Json | undefined;
  template?: Json;
  onChange: (vi: Json, en: Json) => void;
}) {
  const sample = vi ?? en ?? template;

  if (typeof sample === "string") {
    const a = typeof vi === "string" ? vi : "";
    const b = typeof en === "string" ? en : "";
    const long = a.length > 90 || b.length > 90 || a.includes("\n") || b.includes("\n") || LONG_FIELDS.includes(name);
    return (
      <BilingualField
        id={path}
        label={humanize(name)}
        vi={a}
        en={b}
        multiline={long}
        rows={3}
        onChange={(lang, value) => onChange(lang === "vi" ? value : a, lang === "en" ? value : b)}
      />
    );
  }

  if (Array.isArray(sample)) {
    const va = Array.isArray(vi) ? vi : [];
    const ea = Array.isArray(en) ? en : [];
    const length = Math.max(va.length, ea.length);
    const itemTemplate = blank(va[0] ?? ea[0] ?? (Array.isArray(template) ? template[0] : "") ?? "");
    const itemLabel = humanize(name);
    return (
      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {itemLabel} ({length})
        </legend>
        {va.length !== ea.length && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3" /> Bản Tiếng Việt có {va.length} mục, bản English có {ea.length} mục — mục thiếu được để trống bên dưới.
          </p>
        )}
        {length === 0 && <p className="text-xs text-muted-foreground">Danh sách trống, khối này sẽ được ẩn trên website.</p>}
        {Array.from({ length }, (_, index) => {
          const itemVi = va[index] ?? structuredClone(itemTemplate);
          const itemEn = ea[index] ?? structuredClone(itemTemplate);
          return (
            <div key={index} className="relative rounded-lg border bg-muted/30 p-3 pr-11">
              <button
                type="button"
                aria-label={`Xóa mục ${index + 1}`}
                title="Xóa mục này ở cả 2 ngôn ngữ"
                onClick={() =>
                  onChange(
                    va.filter((_, i) => i !== index),
                    ea.filter((_, i) => i !== index),
                  )
                }
                className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
              <PairEditor
                path={`${path}.${index}`}
                name={typeof itemVi === "string" ? `${itemLabel} ${index + 1}` : `#${index + 1}`}
                vi={itemVi}
                en={itemEn}
                template={itemTemplate}
                onChange={(nextVi, nextEn) => {
                  const outVi = Array.from({ length }, (_, i) => (i === index ? nextVi : va[i] ?? structuredClone(itemTemplate)));
                  const outEn = Array.from({ length }, (_, i) => (i === index ? nextEn : ea[i] ?? structuredClone(itemTemplate)));
                  onChange(outVi, outEn);
                }}
              />
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...va, structuredClone(itemTemplate)], [...ea, structuredClone(itemTemplate)])}
        >
          <Plus className="size-4" /> Thêm mục (cả 2 ngôn ngữ)
        </Button>
      </fieldset>
    );
  }

  if (isObject(sample)) {
    const vo = isObject(vi) ? vi : {};
    const eo = isObject(en) ? en : {};
    const keys = [...new Set([...Object.keys(isObject(template) ? template : {}), ...Object.keys(vo), ...Object.keys(eo)])];
    return (
      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-primary">{humanize(name)}</legend>
        {keys.map((key) => (
          <PairEditor
            key={key}
            path={`${path}.${key}`}
            name={key}
            vi={vo[key]}
            en={eo[key]}
            template={isObject(template) ? template[key] : undefined}
            onChange={(nextVi, nextEn) => onChange({ ...vo, [key]: nextVi }, { ...eo, [key]: nextEn })}
          />
        ))}
      </fieldset>
    );
  }

  return null;
}

/** Edits the bilingual page copy blocks served by `/page-content`. */
export function PageContentManager() {
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState<Partial<Record<PageContentKey, PageContentRow>>>({});
  const [active, setActive] = useState<PageContentKey>("home.hero");
  const [draft, setDraft] = useState<{ vi: Block; en: Block } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const shownBlocks = BLOCKS.filter((item) => matchesSearch(blockSearch, item.label, item.hint, item.key));

  useEffect(() => {
    adminRequest<{ data: PageContentRow[] }>("page-content")
      .then((body) => setRows(Object.fromEntries(body.data.map((row) => [row.key, row]))))
      .catch((error: Error) => toast.error(error.message || "Không thể tải nội dung trang"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!draft) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft]);

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
  const gaps = useMemo(
    () =>
      Object.fromEntries(
        BLOCKS.map(({ key }) => [
          key,
          key === active ? countGaps(current.vi, current.en) : countGaps(rows[key]?.vi, rows[key]?.en),
        ]),
      ) as Record<PageContentKey, number>,
    [active, current, rows],
  );

  const selectBlock = async (key: PageContentKey) => {
    if (key === active) return;
    if (
      draft &&
      !(await confirm({
        title: "Bỏ các thay đổi chưa lưu?",
        description: `Những chỉnh sửa trong khối “${block?.label}” sẽ bị mất.`,
        confirmLabel: "Bỏ thay đổi",
        cancelLabel: "Tiếp tục chỉnh sửa",
      }))
    )
      return;
    setDraft(null);
    setActive(key);
  };

  const save = async () => {
    const missing = countGaps(current.vi, current.en);
    if (
      missing > 0 &&
      !(await confirm({
        title: `Còn ${missing} ô chỉ có một ngôn ngữ`,
        description: "Những ô viền vàng sẽ hiển thị trống ở phiên bản ngôn ngữ còn thiếu trên website. Vẫn lưu?",
        confirmLabel: "Vẫn lưu",
        cancelLabel: "Quay lại bổ sung",
        tone: "default",
      }))
    )
      return;
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
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {dialog}
      <nav aria-label="Khối nội dung" className="space-y-1">
        <SearchBox value={blockSearch} onChange={setBlockSearch} placeholder="Tìm khối nội dung..." className="mb-2" />
        {shownBlocks.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">Không có khối nào khớp.</p>}
        {shownBlocks.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => void selectBlock(item.key)}
            aria-current={active === item.key}
            className="group w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted aria-[current=true]:bg-primary aria-[current=true]:text-white"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium">{item.label}</span>
              {gaps[item.key] > 0 && (
                <span
                  className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 group-aria-[current=true]:bg-white/20 group-aria-[current=true]:text-white dark:text-amber-400"
                  title={`${gaps[item.key]} ô chỉ có một ngôn ngữ`}
                >
                  {gaps[item.key]} thiếu
                </span>
              )}
            </span>
            {!rows[item.key] && <span className="text-xs opacity-75">Chưa có nội dung, đang ẩn</span>}
          </button>
        ))}
      </nav>

      <section className="min-w-0 space-y-4">
        <header className="sticky top-14 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-1 pb-4 pt-2 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold">{block?.label}</h2>
            <p className="text-sm text-muted-foreground">
              {block?.hint} Trường để trống sẽ không hiển thị.{" "}
              {gaps[active] > 0 ? (
                <span className="font-medium text-amber-700 dark:text-amber-400">{gaps[active]} ô đang thiếu một ngôn ngữ (viền vàng).</span>
              ) : (
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Đủ cả 2 ngôn ngữ.</span>
              )}
            </p>
          </div>
          <Button type="button" onClick={() => void save()} disabled={saving || !draft}>
            <Save className="size-4" /> {saving ? "Đang lưu…" : draft ? "Lưu" : "Đã lưu"}
          </Button>
        </header>

        <BilingualColumnsHeader />
        <div className="space-y-4">
          {Object.keys(current.vi).map((key) => (
            <PairEditor
              key={`${active}-${key}`}
              path={`${active}.${key}`}
              name={key}
              vi={current.vi[key]}
              en={current.en[key]}
              template={skeleton[key]}
              onChange={(nextVi, nextEn) =>
                setDraft({ vi: { ...current.vi, [key]: nextVi }, en: { ...current.en, [key]: nextEn } })
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
