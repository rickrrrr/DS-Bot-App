#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const host = process.env.STYLE_GALLERY_HOST || "http://localhost:8081";
const out = process.env.STYLE_SHOT_DIR || "/opt/cursor/artifacts";

async function shot(page, name, selector) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible", timeout: 60000 });
  await el.screenshot({ path: `${out}/${name}.png` });
  console.log("wrote", `${out}/${name}.png`);
}

async function captureScheme(browser, scheme) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
  });
  page.setDefaultTimeout(90000);
  await page.goto(`${host}/?gallery=1&scheme=${scheme}`, { waitUntil: "networkidle" });
  await page.waitForSelector("#screen-pairing", { timeout: 90000 });
  await page.waitForTimeout(400);
  await shot(page, `pairing-${scheme}`, "#screen-pairing");
  await shot(page, `conversation-list-${scheme}`, "#screen-list");
  await shot(page, `chat-toolcard-${scheme}`, "#screen-chat");
  await page.close();
}

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  await captureScheme(browser, "dark");
  await captureScheme(browser, "light");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
