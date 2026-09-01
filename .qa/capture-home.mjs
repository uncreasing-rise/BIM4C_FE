import { chromium } from "playwright";
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.screenshot({ path: ".qa/current-home.png", fullPage: true });
await browser.close();
