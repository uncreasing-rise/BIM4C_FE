import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");

/** Loads lib/api/client.ts with the environment and logger stubbed. */
function loadClient() {
  const cache = new Map();
  function load(path) {
    if (path === "lib/config/env")
      return { env: { apiUrl: "https://api.test" }, assertApiEnvironment: () => {} };
    if (path === "lib/logging/logger") return { appLogger: { info() {}, error() {} } };
    const filename = resolve(root, path.endsWith(".ts") ? path : `${path}.ts`);
    if (cache.has(filename)) return cache.get(filename);
    const cjs = { exports: {} };
    cache.set(filename, cjs.exports);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = (name) =>
      name.startsWith("@/") ? load(name.slice(2)) : name.startsWith(".") ? load(resolve(dirname(filename), name).slice(root.length + 1)) : require(name);
    new Function("require", "module", "exports", source)(localRequire, cjs, cjs.exports);
    return cjs.exports;
  }
  return load("lib/api/client");
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function withFetch(responses, run) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, method: init.method });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  try {
    return { result: await run(), calls };
  } finally {
    globalThis.fetch = original;
  }
}

test("a GET that hits a restarting API (503) is retried once and succeeds", async () => {
  const { apiClient } = loadClient();
  const { result, calls } = await withFetch([json(503, { message: "down" }), json(200, { ok: true })], () =>
    apiClient.get("/posts"),
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 2);
});

test("a dropped connection on GET is retried once", async () => {
  const { apiClient } = loadClient();
  const { result, calls } = await withFetch([new TypeError("fetch failed"), json(200, { ok: 1 })], () =>
    apiClient.get("/posts"),
  );
  assert.deepEqual(result, { ok: 1 });
  assert.equal(calls.length, 2);
});

test("client errors and writes are never repeated", async () => {
  const { apiClient } = loadClient();
  const notFound = await withFetch([json(404, { message: "missing" }), json(200, {})], () =>
    apiClient.get("/posts/x").catch((e) => e),
  );
  assert.equal(notFound.calls.length, 1, "404 is final");
  const write = await withFetch([json(503, { message: "down" }), json(200, {})], () =>
    apiClient.post("/contact", { a: 1 }).catch((e) => e),
  );
  assert.equal(write.calls.length, 1, "a POST could create duplicates, so it is not retried");
});
