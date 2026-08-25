import { readFile } from "node:fs/promises";

const frontend = process.env.TEST_FRONTEND_URL ?? "http://127.0.0.1:3100";
const backendEnvPath = process.env.TEST_BACKEND_ENV ?? "../BE/.env";
const envText = await readFile(backendEnvPath, "utf8");
const envValue = (name) => {
  const line = envText.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  return line?.slice(name.length + 1).replace(/^['"]|['"]$/g, "");
};
const email = envValue("ADMIN_BOOTSTRAP_EMAIL");
const password = envValue("ADMIN_BOOTSTRAP_PASSWORD");
if (!email || !password) throw new Error("Bootstrap credentials are not configured");

let cookie = "";
const results = [];
const temporary = { slide: null, partner: null, media: null };
const request = async (path, init = {}, authenticated = true) => {
  const headers = new Headers(init.headers);
  if (authenticated && cookie) headers.set("cookie", cookie);
  const response = await fetch(`${frontend}${path}`, { ...init, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
};
const json = (method, body) => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const upload = async (bytes, filename, type) => {
  const form = new FormData();
  form.set("file", new File([bytes], filename, { type }));
  form.set("alt", "Temporary security test");
  return request("/api/admin/media/upload", { method: "POST", body: form });
};
const check = (name, actual, expected, condition = actual === expected) => {
  results.push({ name, status: actual, pass: Boolean(condition) });
};

try {
  let result = await request("/api/admin/homepage/slides", {}, false);
  check("Unauthenticated admin rejected", result.response.status, 401);

  result = await request("/api/auth/login", json("POST", { email, password }), false);
  cookie = result.response.headers.getSetCookie()[0]?.split(";", 1)[0] ?? "";
  check("FE login and HttpOnly session", result.response.status, 200, result.response.status === 200 && cookie.startsWith("bim4c_admin_session="));

  result = await request("/api/auth/me");
  check("Admin identity and role", result.response.status, 200, result.response.status === 200 && result.body?.data?.roles?.includes("SUPER_ADMIN"));
  result = await request("/api/admin/homepage/slides/00000000-0000-4000-8000-000000000000", { ...json("PATCH", { title: "Cross-origin" }), headers: { "content-type": "application/json", origin: "https://attacker.invalid" } });
  check("Cross-origin mutation rejected", result.response.status, 403);

  const adminRoutes = ["/admin", "/admin/login", "/admin/trang-chu", "/admin/tin-tuc", "/admin/dang-ky-khoa-hoc", "/admin/lien-he", "/admin/noi-dung", "/admin/binh-luan", "/admin/cai-dat", "/admin/dich-vu", "/admin/du-an", "/admin/khoa-hoc", "/admin/newsletter", "/admin/nguoi-dung", "/admin/media", "/admin/nhat-ky"];
  for (const route of adminRoutes) {
    result = await request(route);
    check(`Authenticated route ${route}`, result.response.status, 200);
  }

  result = await request("/api/admin/homepage/slides");
  check("Slides GET", result.response.status, 200);
  result = await request("/api/admin/homepage/slides", json("POST", { eyebrow: "CODEX E2E", title: "Temporary E2E slide", image: "/images/about.jpg", alt: "Temporary E2E image", sortOrder: 9999, isActive: true }));
  temporary.slide = result.body?.id;
  check("Slides CREATE", result.response.status, 201, result.response.status === 201 && temporary.slide);
  result = await request(`/api/admin/homepage/slides/${temporary.slide}`, json("PATCH", { title: "Temporary E2E slide updated", isActive: false, sortOrder: 9998 }));
  check("Slides UPDATE/order/toggle", result.response.status, 200, result.response.status === 200 && result.body?.title === "Temporary E2E slide updated" && result.body?.isActive === false);
  result = await request("/api/admin/homepage/slides", json("POST", { title: "x" }));
  check("Slides validation", result.response.status, 422);
  result = await request("/api/admin/homepage/slides/00000000-0000-4000-8000-000000000000", json("PATCH", { title: "Missing" }));
  check("Slides missing id", result.response.status, 404);
  result = await request(`/api/admin/homepage/slides/${temporary.slide}`, { method: "DELETE" });
  check("Slides DELETE", result.response.status, 204);
  temporary.slide = null;

  result = await request("/api/admin/homepage/partners");
  check("Partners GET", result.response.status, 200);
  result = await request("/api/admin/homepage/partners", json("POST", { name: "Temporary E2E partner", logo: "/images/partners/bitexco.png", website: "https://example.com", sortOrder: 9999, isActive: true }));
  temporary.partner = result.body?.id;
  check("Partners CREATE", result.response.status, 201, result.response.status === 201 && temporary.partner);
  result = await request(`/api/admin/homepage/partners/${temporary.partner}`, json("PATCH", { name: "Temporary E2E partner updated", isActive: false, sortOrder: 9998 }));
  check("Partners UPDATE/order/toggle", result.response.status, 200, result.response.status === 200 && result.body?.name === "Temporary E2E partner updated" && result.body?.isActive === false);
  result = await request(`/api/admin/homepage/partners/${temporary.partner}`, { method: "DELETE" });
  check("Partners DELETE", result.response.status, 204);
  temporary.partner = null;

  const form = new FormData();
  form.set("file", new File([await readFile("public/images/about.jpg")], "codex-e2e-about.jpg", { type: "image/jpeg" }));
  form.set("alt", "Temporary E2E media");
  result = await request("/api/admin/media/upload", { method: "POST", body: form });
  temporary.media = result.body?.data;
  check("Media upload and metadata", result.response.status, 201, result.response.status === 201 && temporary.media?.id && temporary.media?.url);
  if (temporary.media) {
    const publicObject = await fetch(temporary.media.url);
    check("Supabase public object", publicObject.status, 200);
    const optimized = await fetch(`${frontend}/_next/image?url=${encodeURIComponent(temporary.media.url)}&w=640&q=75`);
    check("Next Image render", optimized.status, 200);
    result = await request("/api/admin/media?search=codex-e2e-about.jpg");
    check("Media metadata reload", result.response.status, 200, result.response.status === 200 && result.body?.data?.some((item) => item.id === temporary.media.id));
    result = await request(`/api/admin/media/${temporary.media.id}`, { method: "DELETE" });
    check("Media DELETE", result.response.status, 204);
    result = await request("/api/admin/media?search=codex-e2e-about.jpg");
    check("Media metadata cleanup", result.response.status, 200, result.response.status === 200 && !result.body?.data?.some((item) => item.id === temporary.media.id));
    const deletedObject = await fetch(`${temporary.media.url}?cleanup=${Date.now()}`, { cache: "no-store" });
    check("Supabase object cleanup", deletedObject.status, "400/404", [400, 404].includes(deletedObject.status));
    temporary.media = null;
  }

  const jpeg = await readFile("public/images/about.jpg");
  result = await upload(Buffer.from("not an image"), "fake.jpg", "image/jpeg");
  check("Fake JPEG content rejected", result.response.status, 400);
  result = await upload(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"), "image.svg", "image/svg+xml");
  check("SVG upload rejected", result.response.status, 400);
  result = await upload(Buffer.alloc(0), "empty.jpg", "image/jpeg");
  check("Empty upload rejected", result.response.status, 400);
  const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 0);
  oversized[0] = 0xff; oversized[1] = 0xd8; oversized[2] = 0xff;
  result = await upload(oversized, "oversized.jpg", "image/jpeg");
  check("Oversized upload rejected", result.response.status, 413);
  result = await upload(jpeg, "../../<script>.exe.jpg", "image/jpeg");
  const dangerous = result.body?.data;
  check("Dangerous filename sanitized", result.response.status, 201, result.response.status === 201 && /^[a-f0-9-]{36}\.jpg$/i.test(dangerous?.storageKey ?? ""));
  if (dangerous?.id) await request(`/api/admin/media/${dangerous.id}`, { method: "DELETE" });
  const duplicateA = await upload(jpeg, "duplicate.jpg", "image/jpeg");
  const duplicateB = await upload(jpeg, "duplicate.jpg", "image/jpeg");
  check("Duplicate filenames get unique keys", duplicateB.response.status, 201, duplicateA.response.status === 201 && duplicateB.response.status === 201 && duplicateA.body?.data?.storageKey !== duplicateB.body?.data?.storageKey);
  for (const item of [duplicateA.body?.data, duplicateB.body?.data]) if (item?.id) await request(`/api/admin/media/${item.id}`, { method: "DELETE" });

  const invalidCookie = cookie;
  cookie = "bim4c_admin_session=invalid-session-token-that-is-long-enough-123456789";
  result = await request("/api/admin/homepage/slides");
  check("Invalid session rejected", result.response.status, 401);
  cookie = invalidCookie;
  result = await request("/api/auth/logout", { method: "POST" });
  check("Logout invalidates session", result.response.status, 204);
  result = await request("/api/auth/me");
  check("Logged-out session rejected", result.response.status, 401);
} finally {
  if (temporary.slide) await request(`/api/admin/homepage/slides/${temporary.slide}`, { method: "DELETE" });
  if (temporary.partner) await request(`/api/admin/homepage/partners/${temporary.partner}`, { method: "DELETE" });
  if (temporary.media?.id) await request(`/api/admin/media/${temporary.media.id}`, { method: "DELETE" });
}

console.table(results);
if (results.some((result) => !result.pass)) process.exitCode = 1;
