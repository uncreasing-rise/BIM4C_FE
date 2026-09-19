import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();

function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  if (filename.endsWith(".json"))
    return JSON.parse(readFileSync(filename, "utf8"));
  const cjsModule = { exports: {} };
  cache.set(filename, cjsModule.exports);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const fn = new Function("require", "module", "exports", source);
  fn(
    (specifier) => {
      if (specifier.startsWith("@/")) {
        return load(specifier.slice(2));
      }
      return require(specifier);
    },
    cjsModule,
    cjsModule.exports
  );
  cache.set(filename, cjsModule.exports);
  return cjsModule.exports;
}

const { contactSchema, courseRegistrationSchema, newsletterSchema } = load("features/contact/schemas/contact.schema");

const BASE_URL = "http://localhost:3000";

async function runFullAudit() {
  console.log("=================================================");
  console.log("   BIM4C COMPREHENSIVE UI/UX & API AUDIT");
  console.log("=================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function check(condition, name, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${name}`);
    } else {
      failedTests++;
      console.error(`[FAIL] ${name} ${details ? `-> ${details}` : ""}`);
    }
  }

  // 1. Test All Public Routes (Bilingual: VI & EN)
  console.log("--- 1. Testing Bilingual Public Pages (Direct 200 OK) ---");
  const routes = [
    "",
    "/gioi-thieu",
    "/dich-vu",
    "/du-an",
    "/khoa-hoc",
    "/blog",
    "/lien-he",
    "/phap-ly",
    "/phap-ly/chinh-sach-bao-mat",
    "/phap-ly/dieu-khoan-su-dung",
    "/bim-viewer",
  ];

  for (const locale of ["vi", "en"]) {
    for (const r of routes) {
      const path = `/${locale}${r}`;
      try {
        const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
        check(res.status === 200, `Page: ${path.padEnd(30)} (Status ${res.status})`, `Expected 200, got ${res.status}`);
        
        if (res.status === 200) {
          const html = await res.text();
          const hasLang = html.includes(`lang="${locale}"`);
          check(hasLang, `  - Correct HTML lang="${locale}" for ${path}`);
          
          // Verify no broken un-prefixed links inside Header / Navigation
          const hasUnprefixedLink = html.includes('href="/dich-vu"') || html.includes('href="/du-an"');
          check(!hasUnprefixedLink, `  - Navigation links correctly localized in ${path}`);
        }
      } catch (err) {
        check(false, `Page: ${path}`, err.message);
      }
    }
  }

  // 2. Test Unprefixed Route 308 Redirects
  console.log("\n--- 2. Testing Unprefixed Route Redirects (308 -> Localized Path) ---");
  const unprefixedRoutes = ["/dich-vu", "/du-an", "/gioi-thieu", "/lien-he", "/bim-viewer"];
  for (const r of unprefixedRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${r}`, { redirect: "manual" });
      const location = res.headers.get("location");
      const is308 = res.status === 308;
      const isValidRedirect = location && (location.endsWith(`/en${r}`) || location.endsWith(`/vi${r}`));
      check(is308 && isValidRedirect, `Redirect: ${r.padEnd(16)} -> Status: ${res.status}, Location: ${location}`);
    } catch (err) {
      check(false, `Redirect: ${r}`, err.message);
    }
  }

  // 3. Test Static & SEO Feeds
  console.log("\n--- 3. Testing SEO & Static Metadata Feeds ---");
  const metaEndpoints = [
    { path: "/robots.txt", expectedStatus: 200 },
    { path: "/sitemap.xml", expectedStatus: 200, expectedContent: "urlset" },
    { path: "/manifest.webmanifest", expectedStatus: 200, expectedContent: "BIM4C" },
  ];

  for (const ep of metaEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`);
      check(res.status === ep.expectedStatus, `Feed: ${ep.path.padEnd(22)} (Status ${res.status})`);
      if (ep.expectedContent) {
        const text = await res.text();
        check(text.includes(ep.expectedContent), `  - Content contains '${ep.expectedContent}'`);
      }
    } catch (err) {
      check(false, `Feed: ${ep.path}`, err.message);
    }
  }

  // 4. Test Frontend Zod Validation Schemas (Form Validation Logic)
  console.log("\n--- 4. Testing Form Validation & Schema Integrity ---");

  // A. Newsletter Schema
  try {
    const validEmail = newsletterSchema.safeParse({ email: "hello@bim4c.com", consent: true });
    check(validEmail.success === true, "Newsletter schema accepts valid email");

    const invalidEmail = newsletterSchema.safeParse({ email: "invalid-email", consent: true });
    check(invalidEmail.success === false, "Newsletter schema rejects invalid email");
  } catch (err) {
    check(false, "Newsletter Schema", err.message);
  }

  // B. Contact Schema
  try {
    const validContact = contactSchema.safeParse({
      name: "Nguyễn Văn A",
      email: "contact@example.com",
      phone: "0901234567",
      topic: "Tư vấn BIM 3D",
      message: "Cần tư vấn thiết kế mô hình BIM 3D cho dự án chung cư cao tầng.",
      consent: true,
    });
    check(validContact.success === true, "Contact schema accepts complete valid payload");

    const invalidContact = contactSchema.safeParse({
      name: "",
      email: "not-an-email",
      message: "short",
      consent: false,
    });
    check(invalidContact.success === false, "Contact schema rejects incomplete/invalid data");
  } catch (err) {
    check(false, "Contact Schema", err.message);
  }

  // C. Course Registration Schema
  try {
    const validCourse = courseRegistrationSchema.safeParse({
      name: "Trần Thị B",
      email: "student@example.com",
      phone: "0912345678",
      courseId: "bim-manager-2026",
      consent: true,
    });
    check(validCourse.success === true, "Course Registration schema accepts valid payload");

    const invalidCourse = courseRegistrationSchema.safeParse({
      name: "A",
      consent: false,
    });
    check(invalidCourse.success === false, "Course Registration schema rejects missing fields");
  } catch (err) {
    check(false, "Course Registration Schema", err.message);
  }

  console.log("\n=================================================");
  console.log(`AUDIT RESULT: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log("=================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFullAudit().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
