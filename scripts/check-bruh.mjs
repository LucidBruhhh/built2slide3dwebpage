import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});
const errors = [];
try {
  for (const mobile of [false, true]) {
    const page = await browser.newPage({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 960 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("http://127.0.0.1:5186/drift-line");
    await page.getByRole("button", { name: "VIEW BRUH" }).click();
    await page.locator("dialog canvas").waitFor();
    await page.waitForTimeout(1600);
    for (const name of ["FRONT", "SIDE", "REAR"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.waitForTimeout(400);
      assert.equal(
        await page
          .getByRole("button", { name, exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.screenshot({
        path:
          ".preview/bruh-" +
          (mobile ? "mobile-" : "") +
          name.toLowerCase() +
          ".png",
      });
    }
    assert.equal(
      await page
        .locator("dialog")
        .evaluate((d) => d.scrollWidth <= d.clientWidth + 1),
      true,
    );
    await page.getByRole("button", { name: "Close car viewer" }).click();
    assert.equal(await page.locator("dialog").count(), 0);
    await page.getByRole("button", { name: "VIEW BRUH" }).click();
    await page.locator("dialog").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").count(), 0);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    "BRUH viewer: desktop/mobile angles, close, Escape and reopen passed.",
  );
} finally {
  await browser.close();
}
