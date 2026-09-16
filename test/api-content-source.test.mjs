import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");

function context(get) {
  const cache = new Map();
  function load(path) {
    const filename = resolve(root, `${path}.ts`);
    if (path === "lib/api/client") return { apiClient: { get } };
    if (cache.has(filename)) return cache.get(filename);
    const cjsModule = { exports: {} };
    cache.set(filename, cjsModule.exports);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
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

test("catalogues propagate runtime failures, preserve empty results and return null only for missing details", async () => {
  const oldPhase = process.env.NEXT_PHASE;
  delete process.env.NEXT_PHASE;
  try {
    for (const [domain, list, page, detail] of [
      ["projects", "getProjects", "getProjectsPage", "getProjectBySlug"],
      ["services", "getServices", "getServicesPage", "getServiceBySlug"],
      ["courses", "getCourses", "getCoursesPage", "getCourseBySlug"],
      ["blog", "getPosts", "getPostsPage", "getPostBySlug"],
    ]) {
      const result = [];
      let failure;
      const load = context(async () => {
        if (failure) throw failure;
        return result;
      });
      const api = load(`features/${domain}/api/queries`);
      const { ApiError } = load("lib/api/errors");
      assert.deepEqual(await api[list](), []);
      assert.deepEqual((await api[page]()).items, []);
      failure = new ApiError(503, "Backend unavailable");
      await assert.rejects(api[list](), /Backend unavailable/);
      await assert.rejects(api[page](), /Backend unavailable/);
      await assert.rejects(api[detail]("missing"), /Backend unavailable/);
      failure = new ApiError(404, "Not found");
      assert.equal(await api[detail]("missing"), null);
      process.env.NEXT_PHASE = "phase-production-build";
      failure = new ApiError(503, "Backend unavailable");
      assert.deepEqual(await api[list](), []);
      assert.deepEqual((await api[page]()).items, []);
      delete process.env.NEXT_PHASE;
    }
  } finally {
    if (oldPhase === undefined) delete process.env.NEXT_PHASE;
    else process.env.NEXT_PHASE = oldPhase;
  }
});

test("homepage does not replace empty results or an outage with invented partners", async () => {
  let failure;
  const load = context(async () => {
    if (failure) throw failure;
    return [];
  });
  const { getHomepageContent } = load("features/homepage/queries");
  assert.deepEqual(await getHomepageContent(), { slides: [], partners: [] });
  failure = new Error("Backend unavailable");
  await assert.rejects(getHomepageContent(), /Backend unavailable/);
});
