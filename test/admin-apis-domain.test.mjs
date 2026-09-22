import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");

function createLoader() {
  const cache = new Map();
  function load(path) {
    let clean = path.replace(/\.tsx?$/, "");
    if (clean.startsWith("@/")) {
      clean = clean.slice(2);
    }
    const filename = clean.endsWith(".ts") || clean.endsWith(".tsx")
      ? resolve(root, clean)
      : resolve(root, `${clean}.ts`);

    if (cache.has(filename)) return cache.get(filename);
    const cjsModule = { exports: {} };
    cache.set(filename, cjsModule.exports);

    let content = "";
    try {
      content = readFileSync(filename, "utf8");
    } catch {
      try {
        content = readFileSync(resolve(root, `${clean}/index.ts`), "utf8");
      } catch {
        content = readFileSync(resolve(root, clean), "utf8");
      }
    }

    const source = ts.transpileModule(content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;

    const localRequire = (name) =>
      name.startsWith("@/")
        ? load(name.slice(2))
        : name.startsWith(".")
          ? load(resolve(dirname(filename), name))
          : require(name);

    new Function("require", "module", "exports", source)(
      localRequire,
      cjsModule,
      cjsModule.exports,
    );
    return cjsModule.exports;
  }
  return load;
}

const load = createLoader();
const postSerializer = load("features/admin/serializers/post.serializer");
const projectSerializer = load("features/admin/serializers/project.serializer");
const courseSerializer = load("features/admin/serializers/course.serializer");
const serviceSerializer = load("features/admin/serializers/service.serializer");
const serializers = load("features/admin/serializers/index");
const httpClient = load("features/admin/api/http-client");

test("Posts Serializer: Strictly whitelist Post fields and prevent 422 errors", () => {
  const dirtyPostInput = {
    title: "Chuyên môn BIM LOD 400",
    slug: "chuyen-mon-bim-lod-400",
    image: "/images/hero-1.webp",
    status: "PUBLISHED",
    description: "Mô tả bài viết chuyên môn",
    eyebrow: "CHUYÊN MÔN",
    authorName: "Ban Biên Tập BIM4C",
    categoryId: "c011dbe1-5dc8-4e13-bd99-4bec58c93e00",
    isFeatured: true,
    location: "Hà Nội",
    year: 2026,
    duration: "12 buổi",
    level: "Nâng cao",
    price: "4.500.000",
    instructor: "ThS. Minh Hoàng",
    learningOutcomes: ["Làm chủ Revit"],
  };

  const cleanPayload = postSerializer.serializePostPayload(dirtyPostInput);

  assert.equal(cleanPayload.title, "Chuyên môn BIM LOD 400");
  assert.equal(cleanPayload.slug, "chuyen-mon-bim-lod-400");
  assert.equal(cleanPayload.status, "PUBLISHED");
  assert.equal(cleanPayload.authorName, "Ban Biên Tập BIM4C");
  assert.equal(cleanPayload.categoryId, "c011dbe1-5dc8-4e13-bd99-4bec58c93e00");

  assert.equal("isFeatured" in cleanPayload, false);
  assert.equal("location" in cleanPayload, false);
  assert.equal("year" in cleanPayload, false);
  assert.equal("duration" in cleanPayload, false);
  assert.equal("level" in cleanPayload, false);
  assert.equal("price" in cleanPayload, false);
  assert.equal("instructor" in cleanPayload, false);
  assert.equal("learningOutcomes" in cleanPayload, false);
});

test("Projects Serializer: Preserves project attributes and removes other domain fields", () => {
  const dirtyProjectInput = {
    title: "Dự án Tòa nhà Quốc tế Landmark",
    slug: "du-an-landmark",
    image: "/images/project-1.webp",
    status: "IN_PROGRESS",
    description: "Dự án ứng dụng mô hình BIM",
    location: "TP. Hồ Chí Minh",
    year: 2026,
    investor: "Tập đoàn Bất động sản ABC",
    scale: "120.000 m2",
    contractPackage: "Tư vấn BIM & CDE",
    isFeatured: true,
    authorName: "Editor",
    duration: "6 tuần",
    instructor: "Teacher",
  };

  const cleanPayload = projectSerializer.serializeProjectPayload(dirtyProjectInput);

  assert.equal(cleanPayload.title, "Dự án Tòa nhà Quốc tế Landmark");
  assert.equal(cleanPayload.location, "TP. Hồ Chí Minh");
  assert.equal(cleanPayload.year, 2026);
  assert.equal(cleanPayload.investor, "Tập đoàn Bất động sản ABC");
  assert.equal(cleanPayload.isFeatured, true);

  assert.equal("authorName" in cleanPayload, false);
  assert.equal("duration" in cleanPayload, false);
  assert.equal("instructor" in cleanPayload, false);
});

test("Courses Serializer: Preserves course attributes and removes project fields", () => {
  const dirtyCourseInput = {
    title: "Khóa học Revit MEP Nâng cao",
    slug: "khoa-hoc-revit-mep",
    image: "/images/course-1.webp",
    status: "PUBLISHED",
    description: "Khóa đào tạo chuyên sâu",
    duration: "10 buổi (30h)",
    level: "Nâng cao",
    price: "5.000.000 đ",
    instructor: "KTS. Lê Văn Tuấn",
    learningOutcomes: ["Triển khai bản vẽ Shop Drawing", "Phối hợp mô hình Navisworks"],
    isFeatured: true,
    location: "Đà Nẵng",
    year: 2026,
    investor: "Khách hàng",
  };

  const cleanPayload = courseSerializer.serializeCoursePayload(dirtyCourseInput);

  assert.equal(cleanPayload.title, "Khóa học Revit MEP Nâng cao");
  assert.equal(cleanPayload.duration, "10 buổi (30h)");
  assert.equal(cleanPayload.level, "Nâng cao");
  assert.equal(cleanPayload.price, "5.000.000 đ");
  assert.equal(cleanPayload.instructor, "KTS. Lê Văn Tuấn");
  assert.deepEqual(cleanPayload.learningOutcomes, [
    "Triển khai bản vẽ Shop Drawing",
    "Phối hợp mô hình Navisworks",
  ]);

  assert.equal("isFeatured" in cleanPayload, false);
  assert.equal("location" in cleanPayload, false);
  assert.equal("year" in cleanPayload, false);
  assert.equal("investor" in cleanPayload, false);
});

test("Services Serializer: Cleans and validates service payload", () => {
  const dirtyServiceInput = {
    title: "Dịch vụ Scan-to-BIM & Laser 3D",
    slug: "dich-vu-scan-to-bim",
    image: "/images/service-1.webp",
    status: "PUBLISHED",
    description: "Dịch vụ quét 3D công trình hiện hữu",
    eyebrow: "DỊCH VỤ",
    highlights: ["Độ chính xác milimet", "Mô hình đám mây điểm Point Cloud"],
    location: "Toàn quốc",
    price: "Liên hệ",
    authorName: "Ban quản trị",
  };

  const cleanPayload = serviceSerializer.serializeServicePayload(dirtyServiceInput);

  assert.equal(cleanPayload.title, "Dịch vụ Scan-to-BIM & Laser 3D");
  assert.equal(cleanPayload.slug, "dich-vu-scan-to-bim");
  assert.deepEqual(cleanPayload.highlights, [
    "Độ chính xác milimet",
    "Mô hình đám mây điểm Point Cloud",
  ]);

  assert.equal("location" in cleanPayload, false);
  assert.equal("price" in cleanPayload, false);
  assert.equal("authorName" in cleanPayload, false);
});

test("Unified Router: serializeContentPayload routes accurately based on content type", () => {
  const postResult = serializers.serializeContentPayload("Tin tức", {
    title: "News Item",
    slug: "news-item",
    image: "/news.jpg",
    status: "PUBLISHED",
    description: "Description",
    isFeatured: true,
    location: "Danang",
  });
  assert.equal(postResult.title, "News Item");
  assert.equal("location" in postResult, false);

  const projectResult = serializers.serializeContentPayload("Dự án", {
    title: "Project Item",
    slug: "project-item",
    image: "/proj.jpg",
    status: "PUBLISHED",
    description: "Description",
    location: "Danang",
    year: 2026,
    duration: "10 weeks",
  });
  assert.equal(projectResult.location, "Danang");
  assert.equal("duration" in projectResult, false);
});

test("Query String Builder: Handles search, page, status and omits null/undefined", () => {
  const qs = httpClient.buildQueryString({
    page: 2,
    limit: 10,
    search: "BIM",
    status: "PUBLISHED",
    categoryId: undefined,
    sort: null,
  });

  assert.equal(qs, "page=2&limit=10&search=BIM&status=PUBLISHED");
});

test("Factory Initializers: createEmptyContent creates clean domain-isolated structures", () => {
  const emptyProject = serializers.createEmptyContent("Dự án");
  assert.equal(emptyProject.type, "Dự án");
  assert.equal(emptyProject.location, "");
  assert.equal(typeof emptyProject.year, "number");

  const emptyCourse = serializers.createEmptyContent("Khóa học");
  assert.equal(emptyCourse.type, "Khóa học");
  assert.equal(emptyCourse.duration, "");
  assert.equal(Array.isArray(emptyCourse.curriculum), true);

  const emptyPost = serializers.createEmptyContent("Chuyên môn");
  assert.equal(emptyPost.type, "Chuyên môn");
  assert.equal(emptyPost.authorName, "");
  assert.equal(Array.isArray(emptyPost.contentBlocks), true);
  assert.equal(Array.isArray(emptyPost.contentBlocks_vi), true);
});

test("Bilingual Content Blocks: Serializer preserves both VI and EN content blocks without cross-contamination", () => {
  const viBlock = { id: "blk-1", type: "rich-text", heading: "Tiêu đề tiếng Việt", content: "Nội dung tiếng Việt" };
  const enBlock = { id: "blk-1", type: "rich-text", heading: "English Title", content: "English Content" };

  const serialized = serializers.serializePostPayload({
    title: "BIM Article",
    title_vi: "Bài viết BIM",
    slug: "bim-article",
    image: "/images/hero.webp",
    status: "PUBLISHED",
    contentBlocks: [enBlock],
    contentBlocks_vi: [viBlock],
  });

  assert.equal(serialized.contentBlocks.length, 1);
  assert.equal(serialized.contentBlocks[0].id, "blk-1");
  assert.equal(serialized.contentBlocks[0].heading, "English Title");

  assert.equal(serialized.contentBlocks_vi.length, 1);
  assert.equal(serialized.contentBlocks_vi[0].id, "blk-1");
  assert.equal(serialized.contentBlocks_vi[0].heading, "Tiêu đề tiếng Việt");
});

