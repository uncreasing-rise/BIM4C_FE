import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const baseUrl = process.env.BUNDLE_BASE_URL ?? "http://127.0.0.1:3000";
const budgets = {
  "/": 285,
  "/du-an": 310,
  "/admin/login": 285,
};

let failed = false;
for (const [route, budgetKB] of Object.entries(budgets)) {
  const response = await fetch(`${baseUrl}${route}`);
  if (!response.ok) throw new Error(`${route} returned ${response.status}`);
  const html = await response.text();
  const sources = [
    ...new Set(
      [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map(
        (match) => match[1].split("?", 1)[0],
      ),
    ),
  ];
  let gzipBytes = 0;
  for (const source of sources) {
    const marker = "/_next/static/";
    if (!source.startsWith(marker)) continue;
    const file = resolve(".next/static", source.slice(marker.length));
    gzipBytes += gzipSync(await readFile(file)).byteLength;
  }
  const gzipKB = Number((gzipBytes / 1024).toFixed(1));
  const pass = gzipKB <= budgetKB;
  failed ||= !pass;
  console.log(JSON.stringify({ route, scripts: sources.length, gzipKB, budgetKB, pass }));
}

if (failed) process.exitCode = 1;
