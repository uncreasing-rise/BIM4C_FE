// Copies the ThatOpen Fragments worker into public/, so the viewer serves the
// exact version it was built with instead of fetching it from a CDN at run
// time. Runs after every install (see package.json "postinstall").
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/@thatopen/fragments/dist/Worker/worker.min.mjs");
const target = resolve(root, "public/fragments/worker.mjs");
const { version } = JSON.parse(readFileSync(resolve(root, "node_modules/@thatopen/fragments/package.json"), "utf8"));
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`fragments worker ${version} -> public/fragments/worker.mjs`);
