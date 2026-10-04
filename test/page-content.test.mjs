import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
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

test("the team reaches pages by name, role and expertise, without photos", () => {
  const { withoutTeamPhotos } = load("features/page-content/queries");
  const member = { name: "Nguyễn Văn A", role: "CEO", spec: "15 năm BIM", image: "/a.jpg" };
  const content = {
    about: { vi: { teamTitle: "Đội ngũ", teamMembers: [member] }, en: { teamMembers: [member] } },
    "home.hero": { vi: { title: "Xin chào" } },
  };
  const out = withoutTeamPhotos(content);
  assert.deepEqual(out.about.vi, { teamTitle: "Đội ngũ", teamMembers: [{ name: "Nguyễn Văn A", role: "CEO", spec: "15 năm BIM" }] });
  assert.deepEqual(out.about.en.teamMembers, [{ name: "Nguyễn Văn A", role: "CEO", spec: "15 năm BIM" }]);
  assert.equal(JSON.stringify(out).includes("/a.jpg"), false);
  assert.deepEqual(out["home.hero"], content["home.hero"]);
  assert.deepEqual(withoutTeamPhotos({}), {});
});

test("only the headquarters of the company block reaches pages", () => {
  const { withoutLegalEntity } = load("features/page-content/queries");
  const block = {
    copyright: "© 2026 CÔNG TY CỔ PHẦN BIM4C",
    enterpriseInfo: {
      companyName: "Công ty Cổ phần BIM4C",
      internationalName: "BIM4C JOINT STOCK COMPANY",
      shortName: "BIM4C JSC",
      headquarters: "20 Bắc Sơn, Đà Nẵng",
      legalRepresentative: "NGUYỄN VĂN A",
    },
  };
  const content = { company: { vi: block, en: { copyright: "©" } }, "home.hero": { vi: { title: "Xin chào" } } };
  const out = withoutLegalEntity(content);
  assert.deepEqual(out.company, { vi: { enterpriseInfo: { headquarters: "20 Bắc Sơn, Đà Nẵng" } }, en: {} });
  assert.deepEqual(out["home.hero"], content["home.hero"]);
  assert.deepEqual(withoutLegalEntity({}), {});
});
