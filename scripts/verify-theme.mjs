import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const preview = process.env.CAFE_URL || "http://127.0.0.1:3108";
const surfaces = [".navbar", ".menu-section", ".dish-card", ".search", ".filters button",
  ".floating-tray", ".tray-dialog", ".mobile-dialog", ".tour-section", ".zone-controls",
  ".booking select", ".bar-wrap", "footer"];
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
await mkdir(".qa", { recursive: true });
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(preview);
    await page.evaluate(() => document.fonts.ready);
    const palette = () => page.evaluate(selectors => selectors.map(selector =>
      getComputedStyle(document.querySelector(selector)).backgroundColor), surfaces);
    const night = await palette();
    const nightButton = page.getByRole("button", { name: "Starlit Night", exact: true });
    const dayButton = page.getByRole("button", { name: "Day Lagoon", exact: true });
    await page.getByRole("button", { name: "Add Basil Margherita", exact: true }).click();
    await page.evaluate(() => {
      // Capture the native lifecycle, including a duration reduced to zero by implementation errors.
      window.themeReveals = [];
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = update => {
        const transition = start(update);
        window.themeReveals.push(transition.ready.then(() => {
          const ripple = document.getAnimations().find(a => a.animationName === "lagoon-ripple");
          if (!ripple || ripple.effect.getComputedTiming().duration < 300) throw Error("Missing ripple");
          return transition.finished;
        }));
        return transition;
      };
    });
    await dayButton.click();
    await page.evaluate(() => Promise.all(window.themeReveals));
    assert.equal(await dayButton.getAttribute("aria-pressed"), "true");
    const day = await palette();
    surfaces.forEach((selector, i) => assert.notEqual(day[i], night[i], selector));
    await page.screenshot({ path: `.qa/theme-${viewport.width}-day.png` });
    async function sceneLuminance() {
      const canvas = page.locator("canvas");
      await page.locator(".stage").scrollIntoViewIfNeeded();
      await canvas.waitFor();
      await page.waitForFunction(() => {
        const canvas = document.querySelector("canvas");
        return canvas?.width > 100 && canvas.getContext("webgl2") && !canvas.getContext("webgl2").isContextLost();
      });
      const image = await canvas.screenshot();
      return (await sharp(image).stats()).channels[1].mean;
    }
    const dayScene = await sceneLuminance();
    await nightButton.click();
    await page.evaluate(() => Promise.all(window.themeReveals));
    assert.deepEqual(await palette(), night);
    await page.screenshot({ path: `.qa/theme-${viewport.width}-night.png` });
    assert.ok(dayScene > await sceneLuminance() + 40, "3D lighting follows theme");
    await page.getByRole("button", {name:"Open Table #08 Order Tray, 1 items"}).click();
    assert.ok(await page.getByRole("dialog").getByText("Basil Margherita").isVisible());
    await page.getByRole("button", {name:"Close order tray"}).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await dayButton.focus();
    await page.keyboard.press("Enter");
    assert.equal(await dayButton.getAttribute("aria-pressed"), "true");
    assert.equal(await page.evaluate(() => window.themeReveals.length), 2, "Reduced motion skips ripple");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.evaluate(() => { document.startViewTransition = undefined; });
    await nightButton.click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".day-photo")).opacity === "0");
    assert.deepEqual(await palette(), night);
    assert.deepEqual(errors, []);
    console.log(`${viewport.width}×${viewport.height}: both palettes and ripple directions, WebGL lighting, cart retention, keyboard, reduced motion and fallback passed.`);
    await page.close();
  }
} finally {
  await browser.close();
}
