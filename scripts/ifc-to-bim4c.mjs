#!/usr/bin/env node
// Converts IFC files to .bim4c packages (element data + ThatOpen Fragments),
// the same output the viewer produces in the browser, for converting large
// projects once on a server and sharing the result. Opening a .bim4c in the
// viewer skips parsing and conversion.
//
//   node scripts/ifc-to-bim4c.mjs model.ifc [more.ifc …] [--out <dir>]
//
// Uses the viewer's own parser and package format (TypeScript, transpiled on
// the fly), so both always agree.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(resolve(root, "package.json"));
const ts = require("typescript");
// The same ES module instances the Fragments importer uses.
const THREE = await import("three");
const BVH = await import("three-mesh-bvh");
const { IfcImporter } = await import("@thatopen/fragments");
const WebIFC = require("web-ifc");

const cache = new Map();
function load(path) {
  let filename = resolve(root, path);
  if (!existsSync(filename)) filename += ".ts";
  if (cache.has(filename)) return cache.get(filename);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const cjs = { exports: {} };
  cache.set(filename, cjs.exports);
  const localRequire = (name) =>
    name === "three" ? THREE : name === "three-mesh-bvh" ? BVH : name.startsWith(".") ? load(resolve(dirname(filename), name)) : require(name);
  new Function("require", "module", "exports", source)(localRequire, cjs, cjs.exports);
  return cjs.exports;
}
const { parseIfcData } = load("components/bim-viewer/ifc-parser");
const { encodePackage, PACKAGE_EXTENSION } = load("components/bim-viewer/bim-package");

const args = process.argv.slice(2);
const inputs = [];
let outDir = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out") outDir = resolve(args[++i]);
  else inputs.push(args[i]);
}
if (!inputs.length) {
  console.error("usage: node scripts/ifc-to-bim4c.mjs model.ifc [more.ifc …] [--out <dir>]");
  process.exit(1);
}
if (outDir) mkdirSync(outDir, { recursive: true });

const wasmDir = resolve(root, "node_modules/web-ifc") + "/";
let failed = 0;
for (const input of inputs) {
  const started = performance.now();
  try {
    const bytes = new Uint8Array(readFileSync(input));
    const api = new WebIFC.IfcAPI();
    api.SetWasmPath(wasmDir, true);
    await api.Init();
    const model = parseIfcData(api, bytes, basename(input), () => {}, { geometry: "bounds" });
    api.Dispose();
    const importer = new IfcImporter();
    importer.wasm = { path: wasmDir, absolute: true };
    model.fragments = await importer.process({ bytes, raw: false });
    // The viewer's cache key: the same SHA-256 the browser computes for the IFC.
    model.contentHash = createHash("sha256").update(bytes).digest("hex");
    const target = resolve(outDir ?? dirname(input), basename(input).replace(/\.ifc$/i, "") + PACKAGE_EXTENSION);
    const pkg = await encodePackage(model);
    writeFileSync(target, pkg);
    const mb = (n) => (n / 1048576).toFixed(1);
    console.log(`${basename(input)}: ${model.elements.length} elements, ${mb(bytes.length)} MB -> ${mb(pkg.length)} MB in ${((performance.now() - started) / 1000).toFixed(1)} s -> ${target}`);
  } catch (error) {
    failed++;
    console.error(`${basename(input)}: ${error instanceof Error ? error.message : error}`);
  }
}
// web-ifc keeps worker threads alive; nothing is left to wait for.
process.exit(failed ? 1 : 0);
