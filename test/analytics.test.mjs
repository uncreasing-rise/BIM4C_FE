import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
function load(path, stubs = {}) {
  const source = ts.transpileModule(readFileSync(resolve(root, path), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const m = { exports: {} };
  new Function("require", "module", "exports", source)((n) => stubs[n] ?? require(n), m, m.exports);
  return m.exports;
}
const tracker = load("lib/analytics/tracker.ts", { "@/lib/config/env": { env: { apiUrl: "https://api.test" } } });
const fmt = load("features/admin/analytics-format.ts");

/** Just enough of a DOM element for classifyClick. */
function el({ tag = "A", href, text = "", attrs = {}, inside = false }) {
  const all = { ...attrs, ...(href !== undefined ? { href } : {}) };
  return {
    tagName: tag,
    textContent: text,
    href: href === undefined ? undefined : new URL(href, "https://www.bim4c.vn/vi/du-an").href,
    getAttribute: (n) => all[n] ?? null,
    hasAttribute: (n) => n in all,
    closest: (sel) => (sel === "[data-no-track]" && inside ? {} : null),
  };
}
const here = { host: "www.bim4c.vn" };

test("clicks are classified by where the link goes", () => {
  assert.deepEqual(tracker.classifyClick(el({ href: "tel:0932468099", text: " Gọi   ngay " }), here), {
    type: "contact",
    target: "tel:0932468099",
    label: "Gọi ngay",
  });
  assert.equal(tracker.classifyClick(el({ href: "mailto:a@b.vn" }), here).type, "contact");
  assert.equal(tracker.classifyClick(el({ href: "https://zalo.me/0932468099" }), here).type, "contact");
  assert.equal(tracker.classifyClick(el({ href: "/documents/hsnl-bim4c-2026.pdf", text: "Hồ sơ năng lực" }), here).type, "download");
  assert.equal(tracker.classifyClick(el({ href: "/a.zip", attrs: { download: "" } }), here).type, "download");
  assert.deepEqual(tracker.classifyClick(el({ href: "https://www.linkedin.com/company/bim4cjsc", attrs: { "aria-label": "LinkedIn" } }), here), {
    type: "outbound",
    target: "https://www.linkedin.com/company/bim4cjsc",
    label: "LinkedIn",
  });
  assert.deepEqual(tracker.classifyClick(el({ href: "/vi/lien-he?x=1", text: "Liên hệ" }), here), {
    type: "click",
    target: "/vi/lien-he",
    label: "Liên hệ",
  });
});

test("buttons count only when marked, and marked-off areas never count", () => {
  assert.equal(tracker.classifyClick(el({ tag: "BUTTON", text: "Mở menu" }), here), null);
  assert.deepEqual(tracker.classifyClick(el({ tag: "BUTTON", text: "x", attrs: { "data-track": "Đặt lịch tư vấn" } }), here), {
    type: "click",
    label: "Đặt lịch tư vấn",
  });
  assert.equal(tracker.classifyClick(el({ href: "tel:1", inside: true }), here), null);
});

test("tracking stays off outside a browser", () => {
  assert.equal(tracker.trackingAllowed(), false);
  assert.equal(tracker.visitAttribution(), undefined);
});

test("report formatting: ranges, durations, changes, labels, CSV", () => {
  const now = new Date("2026-09-27T20:00:00Z"); // 03:00 on the 28th in Vietnam
  assert.equal(fmt.today(now), "2026-09-28");
  assert.deepEqual(fmt.presetRange("7d", now), { from: "2026-09-22", to: "2026-09-28" });
  assert.deepEqual(fmt.presetRange("today", now), { from: "2026-09-28", to: "2026-09-28" });
  assert.deepEqual(fmt.daysBetween("2026-02-27", "2026-03-01"), ["2026-02-27", "2026-02-28", "2026-03-01"]);
  assert.equal(fmt.formatDuration(45_000), "45 giây");
  assert.equal(fmt.formatDuration(185_000), "3 phút 05 giây");
  assert.equal(fmt.formatDuration(3_720_000), "1 giờ 02 phút");
  assert.equal(fmt.formatDuration(null), "—");
  assert.equal(fmt.change(150, 100), 0.5);
  assert.equal(fmt.change(5, 0), null, "nothing to compare with");
  assert.equal(fmt.change(0, 0), 0);
  assert.equal(fmt.sourceLabel("direct"), "Truy cập trực tiếp");
  assert.equal(fmt.sourceLabel("partner.vn"), "partner.vn");
  assert.equal(fmt.mediumLabel("organic"), "Tìm kiếm tự nhiên");
  assert.equal(fmt.contactTarget("tel:0932468099"), "Gọi 0932468099");
  assert.equal(fmt.pageLabel("/"), "Trang chủ");
  assert.equal(fmt.countryLabel("VN"), "Việt Nam");
  const csv = fmt.toCsv([["Trang", "Lượt"], ['/a "b"', 3]]);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes('"/a ""b""","3"'));
});
