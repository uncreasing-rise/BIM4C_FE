import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const frontend = process.env.TEST_FRONTEND_URL ?? "http://127.0.0.1:3000";
const backend = process.env.TEST_BACKEND_URL ?? "http://127.0.0.1:8080";
const envText = await readFile(process.env.TEST_BACKEND_ENV ?? "../BE/.env", "utf8");
const env = (key) => envText.replace(/^\uFEFF/, "").split(/\r?\n/).find((line) => line.startsWith(`${key}=`))?.slice(key.length + 1).replace(/^['"]|['"]$/g, "");
let cookie = "";
const created = [];
const api = async (path, init = {}) => {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${frontend}${path}`, { ...init, headers });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${text}`);
  return { response, body };
};
const json = (method, body) => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const publicDetail = async (domain, slug) => {
  const response = await fetch(`${backend}/${domain}/${slug}`);
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  return body.data ?? body;
};
const unique = `codex-${Date.now()}`;
const blocks = [
  { id: `${unique}-intro`, type: "rich-text", heading: "Tổng quan", content: "Nội dung tiếng Việt được quản trị hoàn toàn từ dữ liệu." },
  { id: `${unique}-image`, type: "image", image: { url: "/images/about.jpg", alt: "Ảnh kiểm thử nội dung" } },
  { id: `${unique}-features`, type: "feature-list", heading: "Điểm nổi bật", items: ["Dữ liệu có cấu trúc", "Có thể sắp xếp"], ordered: false },
  { id: `${unique}-gallery`, type: "gallery", images: [{ url: "/images/about.jpg", alt: "Gallery 1" }, { url: "/images/news-bim-safety.webp", alt: "Gallery 2" }] },
];

try {
  const email = env("ADMIN_BOOTSTRAP_EMAIL")?.trim();
  const password = env("ADMIN_BOOTSTRAP_PASSWORD")?.trim();
  assert.ok(email && email.includes("@") && email.length <= 320, "Invalid bootstrap email configuration");
  assert.ok(password, "Missing bootstrap password configuration");
  const login = await api("/api/auth/login", json("POST", { email, password }));
  cookie = login.response.headers.getSetCookie()[0]?.split(";", 1)[0] ?? "";
  assert.ok(cookie.startsWith("bim4c_admin_session="));
  const projectCategories = (await api("/api/admin/project-categories")).body.data;
  assert.ok(projectCategories.length, "Project category is required for E2E");

  const fixtures = [
    { admin: "services", public: "services", body: {} },
    { admin: "projects", public: "projects", body: { categoryId: projectCategories[0].id, location: "Thành phố Hồ Chí Minh", year: 2026, investor: "Chủ đầu tư kiểm thử", scale: "Quy mô kiểm thử", contractPackage: "BIM Coordination", expectedCompletion: "Q4/2026", status: "PLANNED" } },
    { admin: "courses", public: "courses", body: { duration: "12 tuần", level: "Nâng cao", price: "Liên hệ", instructor: "Chuyên gia BIM", learningOutcomes: ["Điều phối mô hình", "Quản trị CDE"] } },
    { admin: "posts", public: "posts", body: { authorName: "BIM4C Editorial" } },
  ];

  for (const fixture of fixtures) {
    const slug = `${unique}-${fixture.admin}`;
    const base = {
      slug, title: `Kiểm thử CRUD ${fixture.admin} — Nội dung dài tiếng Việt`, description: "Mô tả kiểm thử dữ liệu động.", image: "/images/about.jpg", eyebrow: "QA", meta: "04.09.2026", highlights: ["Một", "Hai"], sections: [], contentBlocks: blocks, seoTitle: `SEO ${fixture.admin}`, seoDescription: "Mô tả SEO kiểm thử", seoImage: "/images/about.jpg", canonicalUrl: null, relatedIds: [], status: "PUBLISHED", sortOrder: 9999, publishedAt: new Date().toISOString(), ...fixture.body,
    };
    const made = await api(`/api/admin/${fixture.admin}`, json("POST", base));
    const entity = made.body.data;
    assert.ok(entity.id);
    created.push({ ...fixture, id: entity.id, slug });
    const list = await api(`/api/admin/${fixture.admin}?search=${encodeURIComponent(slug)}`);
    assert.ok(list.body.data.some((item) => item.id === entity.id));
    let detail = await publicDetail(fixture.public, slug);
    assert.equal(detail.contentBlocks.length, 4);
    assert.equal(detail.seoTitle, `SEO ${fixture.admin}`);

    const reordered = [blocks[2], blocks[0], blocks[3]];
    await api(`/api/admin/${fixture.admin}/${entity.id}`, json("PATCH", { contentBlocks: reordered, title: `${base.title} cập nhật` }));
    detail = await publicDetail(fixture.public, slug);
    assert.equal(detail.title.endsWith("cập nhật"), true);
    assert.deepEqual(detail.contentBlocks.map((block) => block.id), reordered.map((block) => block.id));

    if (fixture.admin === "projects") {
      const image = await api(`/api/admin/projects/${entity.id}/images`, json("POST", { url: "/images/about.jpg", alt: "Ảnh gallery E2E", sortOrder: 0 }));
      assert.ok(image.body.data.id);
      detail = await publicDetail("projects", slug);
      assert.equal(detail.gallery.length, 1);
      await api(`/api/admin/projects/${entity.id}/images/${image.body.data.id}`, { method: "DELETE" });
    }
    if (fixture.admin === "courses") {
      const section = await api(`/api/admin/courses/${entity.id}/sections`, json("POST", { title: "Module 1", description: "Bài học thực hành", sortOrder: 0 }));
      assert.ok(section.body.data.id);
      detail = await publicDetail("courses", slug);
      assert.equal(detail.curriculum.length, 1);
      await api(`/api/admin/courses/${entity.id}/sections/${section.body.data.id}`, { method: "DELETE" });
    }
  }
  console.log("CONTENT CRUD E2E PASS: service, project, course, post");
} finally {
  for (const item of created.reverse()) {
    try { await api(`/api/admin/${item.admin}/${item.id}`, { method: "DELETE" }); } catch (error) { console.error(`Cleanup failed ${item.admin}/${item.id}`, error.message); }
  }
}
