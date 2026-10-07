import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
await mkdir(".preview", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const errors = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 960 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("http://127.0.0.1:5186/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: ".preview/" + (mobile ? "mobile" : "desktop") + "-lab.png",
      fullPage: true,
    });
    assert.equal(await page.locator(".concept-card").count(), 4);
    await page.getByRole("link", { name: /01.*THE DRIFT LINE/ }).click();
    await page.locator("canvas").waitFor();
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: ".preview/" + (mobile ? "mobile" : "desktop") + "-drift.png",
    });
    assert.equal(
      await page
        .locator("canvas")
        .evaluate((c) => c.width > 0 && Boolean(c.getContext("webgl2"))),
      true,
    );
    await page.mouse.move(1100, 300);
    await page.evaluate(() => scrollTo(0, innerHeight * 1.3));
    await page.waitForTimeout(1200);
    assert.match(
      await page.locator(".sequence strong").innerText(),
      /HOLD THE ANGLE/,
    );
    await page.screenshot({
      path: ".preview/" + (mobile ? "mobile" : "desktop") + "-mid.png",
    });
    await page.getByRole("button", { name: "PAUSE SMOKE" }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "RESUME SMOKE" })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.getByLabel("Scene quality").selectOption("low");
    await page.evaluate(() => scrollTo(0, innerHeight * 2.5));
    await page.waitForTimeout(1000);
    assert.match(
      await page.locator(".sequence strong").innerText(),
      /FOLLOW THE LINE/,
    );
    await page.getByRole("button", { name: "REPLAY THE LINE" }).click();
    await page.waitForTimeout(1400);
    assert.ok((await page.evaluate(() => scrollY)) < 10);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    for (const path of ["garage", "touge", "sticker-wall"]) {
      await page.goto("http://127.0.0.1:5186/" + path);
      assert.ok(
        await page.getByText("NOT STARTED", { exact: false }).isVisible(),
      );
    }
    await context.close();
  }
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5186/drift-line");
  await page.locator("canvas").waitFor();
  assert.equal(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    true,
  );
  await context.close();
  const fallback = await browser.newContext();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.includes("webgl") ? null : original.call(this, type, ...args);
    };
  });
  const f = await fallback.newPage();
  await f.goto("http://127.0.0.1:5186/drift-line");
  await f.locator(".scene > .scene-fallback").waitFor();
  await fallback.close();
  assert.deepEqual(errors, []);
  await writeFile(
    ".preview/browser-result.json",
    JSON.stringify(
      {
        passed: true,
        errors,
        checks: [
          "desktop",
          "mobile",
          "all routes",
          "WebGL scene",
          "scroll phases",
          "pause",
          "low quality",
          "replay",
          "no overflow",
          "reduced motion",
          "no WebGL fallback",
        ],
      },
      null,
      2,
    ),
  );
  console.log("Browser checks passed; screenshots saved in .preview/");
} finally {
  await browser.close();
}
