import type { AdminContent, AdminContentType } from "@/features/admin/types";
import type { ContentBlock } from "@/features/shared/schemas/content-block.schema";
import { isSafeMediaReference } from "@/features/shared/schemas/content-block.schema";
import { LANG_META, fieldDomId, filled, looksVietnamese, type Lang, type TranslationIssue } from "./bilingual";

type Row = Record<string, unknown>;

/** A translatable text field stored as `<en>` + `<en>_vi`. Limits mirror the database columns. */
export interface TextSpec {
  id: string;
  label: string;
  en: string;
  vi: string;
  max: number;
  /** Must exist in at least one language (the other falls back on save). */
  required?: boolean;
  /** Missing in either language is worth flagging even if the other is empty too. */
  important?: boolean;
}

export interface ListSpec {
  id: string;
  label: string;
  en: string;
  vi: string;
}

export const CORE_FIELDS: TextSpec[] = [
  { id: "title", label: "Tiêu đề", en: "title", vi: "title_vi", max: 240, required: true, important: true },
  { id: "description", label: "Mô tả tóm tắt", en: "description", vi: "description_vi", max: 1000, important: true },
  { id: "eyebrow", label: "Nhãn nổi bật (eyebrow)", en: "eyebrow", vi: "eyebrow_vi", max: 160 },
  { id: "meta", label: "Thông tin phụ (meta)", en: "meta", vi: "meta_vi", max: 240 },
];

export const SEO_FIELDS: TextSpec[] = [
  { id: "seoTitle", label: "Tiêu đề SEO", en: "seoTitle", vi: "seoTitle_vi", max: 240 },
  { id: "seoDescription", label: "Mô tả SEO", en: "seoDescription", vi: "seoDescription_vi", max: 1000 },
];

export const PROJECT_FIELDS: TextSpec[] = [
  { id: "location", label: "Địa điểm", en: "location", vi: "location_vi", max: 180, required: true },
  { id: "investor", label: "Chủ đầu tư", en: "investor", vi: "investor_vi", max: 1000 },
  { id: "contractPackage", label: "Gói thầu / Dịch vụ", en: "contractPackage", vi: "contractPackage_vi", max: 500 },
  { id: "expectedCompletion", label: "Dự kiến hoàn thành", en: "expectedCompletion", vi: "expectedCompletion_vi", max: 180 },
  { id: "scale", label: "Quy mô công trình", en: "scale", vi: "scale_vi", max: 2000 },
];

export const COURSE_FIELDS: TextSpec[] = [
  { id: "duration", label: "Thời lượng", en: "duration", vi: "duration_vi", max: 160 },
  { id: "level", label: "Cấp độ", en: "level", vi: "level_vi", max: 160 },
  { id: "price", label: "Học phí", en: "price", vi: "price_vi", max: 160 },
  { id: "instructor", label: "Giảng viên", en: "instructor", vi: "instructor_vi", max: 240 },
];

export const POST_FIELDS: TextSpec[] = [
  { id: "authorName", label: "Tác giả", en: "authorName", vi: "authorName_vi", max: 160 },
];

export const COURSE_LISTS: ListSpec[] = [
  { id: "learningOutcomes", label: "Mục tiêu & chuẩn đầu ra", en: "learningOutcomes", vi: "learningOutcomes_vi" },
  { id: "softwareStack", label: "Phần mềm & công nghệ", en: "softwareStack", vi: "softwareStack_vi" },
];

export const SERVICE_LISTS: ListSpec[] = [
  { id: "highlights", label: "Hạng mục bàn giao", en: "highlights", vi: "highlights_vi" },
];

const BLOCK_LABEL: Record<ContentBlock["type"], string> = {
  "rich-text": "Văn bản",
  image: "Hình ảnh",
  gallery: "Thư viện ảnh",
  quote: "Trích dẫn",
  "feature-list": "Danh sách",
  video: "Video",
  divider: "Đường phân cách",
};

export const blockDomId = (index: number, lang: Lang) => `block-${index}-${lang}`;

const str = (value: unknown) => (typeof value === "string" ? value : "");

function specsFor(type: AdminContentType) {
  const text = [...CORE_FIELDS];
  const lists: ListSpec[] = [];
  if (type === "Dự án") text.push(...PROJECT_FIELDS);
  if (type === "Khóa học") {
    text.push(...COURSE_FIELDS);
    lists.push(...COURSE_LISTS);
  }
  if (type === "Dịch vụ") lists.push(...SERVICE_LISTS);
  if (type === "Tin tức" || type === "Chuyên môn") text.push(...POST_FIELDS);
  text.push(...SEO_FIELDS);
  return { text, lists };
}

/** Translatable text of a block in reading order (used for completeness checks). */
function blockTexts(block: ContentBlock): string[] {
  switch (block.type) {
    case "rich-text":
      return [block.heading ?? "", block.content ?? ""];
    case "image":
      return [block.image?.alt ?? "", block.image?.caption ?? ""];
    case "quote":
      return [block.quote ?? ""];
    case "feature-list":
      return [block.heading ?? "", ...(block.items ?? [])];
    case "video":
      return [block.title ?? ""];
    default:
      return [];
  }
}

/** The one thing a block cannot be saved without, or null when it is fine. */
function blockError(block: ContentBlock): string | null {
  switch (block.type) {
    case "rich-text":
      return filled(block.content) ? null : "Khối văn bản chưa có nội dung";
    case "image":
      if (!filled(block.image?.url)) return "Chưa chọn ảnh";
      return isSafeMediaReference(block.image.url.trim()) ? null : "Ảnh phải là URL https:// hoặc đường dẫn bắt đầu bằng /";
    case "gallery":
      if (!block.images?.length) return "Thư viện ảnh chưa có ảnh nào";
      return block.images.every((img) => filled(img.url)) ? null : "Có ảnh trong thư viện chưa hợp lệ";
    case "quote":
      return filled(block.quote) ? null : "Câu trích dẫn đang để trống";
    case "feature-list":
      if (!block.items?.some(filled)) return "Danh sách chưa có dòng nào";
      return null;
    case "video":
      if (!filled(block.url)) return "Chưa nhập đường dẫn video";
      return isSafeMediaReference(block.url.trim()) ? null : "Video phải là URL https:// hoặc đường dẫn bắt đầu bằng /";
    default:
      return null;
  }
}

export interface ContentCheck {
  issues: TranslationIssue[];
  errors: TranslationIssue[];
  progress: Record<Lang, { done: number; total: number }>;
}

/**
 * Everything wrong or untranslated in a content record. Errors mirror what the
 * API would reject; warnings are gaps the website papers over by falling back
 * to the other language.
 */
export function checkContent(editor: AdminContent, type: AdminContentType): ContentCheck {
  const row = editor as unknown as Row;
  const issues: TranslationIssue[] = [];
  const progress = { vi: { done: 0, total: 0 }, en: { done: 0, total: 0 } };
  const count = (vi: boolean, en: boolean) => {
    progress.vi.total += 1;
    progress.en.total += 1;
    if (vi) progress.vi.done += 1;
    if (en) progress.en.done += 1;
  };

  const { text, lists } = specsFor(type);

  for (const spec of text) {
    const vi = str(row[spec.vi]);
    const en = str(row[spec.en]);
    const hasVi = filled(vi);
    const hasEn = filled(en);

    if (spec.required && !hasVi && !hasEn) {
      issues.push({ target: fieldDomId(spec.id, "vi"), label: spec.label, severity: "error", message: "Bắt buộc — nhập ít nhất một ngôn ngữ" });
    } else if (spec.required && Math.max(vi.trim().length, en.trim().length) < 2) {
      issues.push({ target: fieldDomId(spec.id, hasVi ? "vi" : "en"), label: spec.label, severity: "error", message: "Cần ít nhất 2 ký tự" });
    }
    for (const [lang, value] of [["vi", vi], ["en", en]] as const) {
      if (value.length > spec.max)
        issues.push({ target: fieldDomId(spec.id, lang), label: spec.label, lang, severity: "error", message: `Quá dài (${value.length}/${spec.max} ký tự)` });
    }

    if (!hasVi && !hasEn && !spec.important) continue;
    count(hasVi, hasEn);
    if (hasVi && !hasEn) {
      issues.push({ target: fieldDomId(spec.id, "en"), label: spec.label, lang: "en", severity: "warning", message: "Chưa dịch sang English" });
    } else if (hasEn && !hasVi) {
      issues.push({ target: fieldDomId(spec.id, "vi"), label: spec.label, lang: "vi", severity: "warning", message: "Chưa có bản Tiếng Việt" });
    } else if (!hasVi && !hasEn && spec.important && !spec.required) {
      issues.push({ target: fieldDomId(spec.id, "vi"), label: spec.label, severity: "warning", message: "Chưa nhập ở cả 2 ngôn ngữ" });
    }
    if (hasEn && looksVietnamese(en)) {
      issues.push({ target: fieldDomId(spec.id, "en"), label: spec.label, lang: "en", severity: "warning", message: "Bản English còn chữ tiếng Việt" });
    }
  }

  for (const spec of lists) {
    const vi = (row[spec.vi] as string[] | undefined) ?? [];
    const en = (row[spec.en] as string[] | undefined) ?? [];
    const length = Math.max(vi.length, en.length);
    let missingVi = 0;
    let missingEn = 0;
    let untranslated = 0;
    for (let i = 0; i < length; i++) {
      const hasVi = filled(vi[i]);
      const hasEn = filled(en[i]);
      if (!hasVi && !hasEn) continue;
      count(hasVi, hasEn);
      if (hasVi && !hasEn) missingEn++;
      if (hasEn && !hasVi) missingVi++;
      if (hasEn && looksVietnamese(en[i])) untranslated++;
    }
    if (missingEn) issues.push({ target: fieldDomId(spec.id, "en"), label: spec.label, lang: "en", severity: "warning", message: `${missingEn} dòng chưa dịch sang English` });
    if (missingVi) issues.push({ target: fieldDomId(spec.id, "vi"), label: spec.label, lang: "vi", severity: "warning", message: `${missingVi} dòng chưa có bản Tiếng Việt` });
    if (untranslated) issues.push({ target: fieldDomId(spec.id, "en"), label: spec.label, lang: "en", severity: "warning", message: `${untranslated} dòng English còn chữ tiếng Việt` });
  }

  // Repeated sub-records (course modules, project photos): each text pairs with its translation.
  const pairs: { items: Row[]; label: (i: number) => string; target: (i: number, lang: Lang) => string; keys: [string, string][] }[] = [
    {
      items: type === "Khóa học" ? ((row.curriculum as Row[] | undefined) ?? []) : [],
      label: (i) => `Giáo trình · Phần ${i + 1}`,
      target: (i, lang) => `curriculum-${i}-${lang}`,
      keys: [["title_vi", "title"], ["description_vi", "description"]],
    },
    {
      items: type === "Dự án" ? ((row.images as Row[] | undefined) ?? []) : [],
      label: (i) => `Ảnh dự án #${i + 1}`,
      target: (_i, lang) => fieldDomId("gallery-alt", lang),
      keys: [["alt_vi", "alt"], ["caption_vi", "caption"]],
    },
  ];
  for (const group of pairs) {
    group.items.forEach((item, i) => {
      let gapsVi = 0;
      let gapsEn = 0;
      let untranslated = false;
      for (const [viKey, enKey] of group.keys) {
        const hasVi = filled(str(item[viKey]));
        const hasEn = filled(str(item[enKey]));
        if (!hasVi && !hasEn) continue;
        count(hasVi, hasEn);
        if (hasVi && !hasEn) gapsEn++;
        if (hasEn && !hasVi) gapsVi++;
        if (hasEn && looksVietnamese(str(item[enKey]))) untranslated = true;
      }
      const label = group.label(i);
      if (gapsEn) issues.push({ target: group.target(i, "en"), label, lang: "en", severity: "warning", message: `${gapsEn} ô chưa dịch sang English` });
      if (gapsVi) issues.push({ target: group.target(i, "vi"), label, lang: "vi", severity: "warning", message: `${gapsVi} ô chưa có bản Tiếng Việt` });
      if (untranslated) issues.push({ target: group.target(i, "en"), label, lang: "en", severity: "warning", message: "Bản English còn chữ tiếng Việt" });
      if (group.keys[0][0] === "title_vi" && !filled(str(item.title)) && !filled(str(item.title_vi)))
        issues.push({ target: group.target(i, "vi"), label, severity: "warning", message: "Chưa có tên phần học — sẽ bị bỏ qua khi lưu" });
    });
  }

  // Content blocks: rows pair up by position.
  const blocksVi = editor.contentBlocks_vi ?? [];
  const blocksEn = editor.contentBlocks ?? [];
  const blockCount = Math.max(blocksVi.length, blocksEn.length);
  for (let i = 0; i < blockCount; i++) {
    const vi = blocksVi[i];
    const en = blocksEn[i];
    const label = `Khối #${i + 1}${vi || en ? ` · ${BLOCK_LABEL[(vi ?? en)!.type]}` : ""}`;
    if (!vi || !en) {
      const lang: Lang = vi ? "en" : "vi";
      issues.push({ target: blockDomId(i, lang), label, lang, severity: "warning", message: `Bản ${LANG_META[lang].name} chưa có khối này` });
    } else if (vi.type !== en.type) {
      issues.push({ target: blockDomId(i, "en"), label, lang: "en", severity: "warning", message: `Khác loại khối với bản Tiếng Việt (${BLOCK_LABEL[en.type]})` });
    }
    const errVi = vi ? blockError(vi) : null;
    const errEn = en ? blockError(en) : null;
    if (vi && en && errVi && errEn) {
      issues.push({ target: blockDomId(i, "vi"), label, severity: "error", message: `${errVi} — nhập hoặc xóa khối` });
    } else if (errVi || errEn) {
      const bad: Lang = errVi ? "vi" : "en";
      const good: Lang = bad === "vi" ? "en" : "vi";
      if (vi && en)
        issues.push({ target: blockDomId(i, bad), label, lang: bad, severity: "warning", message: `${errVi ?? errEn} — khi lưu sẽ tạm dùng bản ${LANG_META[good].name}` });
      else
        issues.push({ target: blockDomId(i, bad), label, severity: "error", message: `${errVi ?? errEn} — nhập hoặc xóa khối` });
    }
    if (vi && en && vi.type === en.type && !errVi && !errEn) {
      const viTexts = blockTexts(vi);
      const enTexts = blockTexts(en);
      const len = Math.max(viTexts.length, enTexts.length);
      let gapsEn = 0;
      let gapsVi = 0;
      for (let k = 0; k < len; k++) {
        const hasVi = filled(viTexts[k]);
        const hasEn = filled(enTexts[k]);
        if (!hasVi && !hasEn) continue;
        count(hasVi, hasEn);
        if (hasVi && !hasEn) gapsEn++;
        if (hasEn && !hasVi) gapsVi++;
      }
      if (gapsEn) issues.push({ target: blockDomId(i, "en"), label, lang: "en", severity: "warning", message: `${gapsEn} ô chưa dịch sang English` });
      if (gapsVi) issues.push({ target: blockDomId(i, "vi"), label, lang: "vi", severity: "warning", message: `${gapsVi} ô chưa có bản Tiếng Việt` });
      if (enTexts.some(looksVietnamese))
        issues.push({ target: blockDomId(i, "en"), label, lang: "en", severity: "warning", message: "Bản English còn chữ tiếng Việt" });
    }
  }

  // Shared fields the API validates. An empty slug is generated from the title on save.
  const slug = str(editor.slug).trim();
  if (slug && slug.length < 2) {
    issues.push({ target: "bf-slug", label: "Đường dẫn (slug)", severity: "error", message: "Cần ít nhất 2 ký tự" });
  } else if (slug.length > 180) {
    issues.push({ target: "bf-slug", label: "Đường dẫn (slug)", severity: "error", message: `Quá dài (${slug.length}/180 ký tự)` });
  }
  if (type === "Dự án" && !filled(str(row.categoryId)) && !(row.category as { id?: string } | null)?.id) {
    issues.push({ target: "bf-category", label: "Danh mục dự án", severity: "error", message: "Dự án bắt buộc chọn danh mục" });
  }
  for (const [field, label] of [["seoImage", "Ảnh chia sẻ SEO"], ["canonicalUrl", "Canonical URL"]] as const) {
    const value = str(row[field]).trim();
    if (value && !isSafeMediaReference(value))
      issues.push({ target: `bf-${field}`, label, severity: "error", message: "Phải là URL https:// hoặc đường dẫn bắt đầu bằng /" });
  }
  if (!filled(editor.image)) {
    issues.push({ target: "bf-image", label: "Ảnh đại diện", severity: "warning", message: "Chưa chọn — website sẽ dùng ảnh mặc định" });
  }

  return { issues, errors: issues.filter((i) => i.severity === "error"), progress };
}

/** Drops blank lines that would make the API schema reject a whole list block. */
function tidyBlock(block: ContentBlock): ContentBlock {
  if (block.type === "feature-list") {
    const items = block.items.map((item) => item.trim()).filter(Boolean);
    return { ...block, items: items.length ? items : block.items };
  }
  return block;
}

/**
 * Prepares both block lists for saving: a block left blank in one language
 * borrows the other language's version so the public page never shows an
 * empty block (the checklist has already warned about it).
 */
export function fillBlockGaps(vi: ContentBlock[], en: ContentBlock[]) {
  const length = Math.max(vi.length, en.length);
  const outVi: ContentBlock[] = [];
  const outEn: ContentBlock[] = [];
  for (let i = 0; i < length; i++) {
    const a = vi[i] ? tidyBlock(vi[i]) : undefined;
    const b = en[i] ? tidyBlock(en[i]) : undefined;
    const okA = Boolean(a && !blockError(a));
    const okB = Boolean(b && !blockError(b));
    const pickVi = okA ? a : okB ? structuredClone(b) : a ?? b;
    const pickEn = okB ? b : okA ? structuredClone(a) : b ?? a;
    if (pickVi) outVi.push(pickVi);
    if (pickEn) outEn.push(pickEn);
  }
  return { vi: outVi, en: outEn };
}
