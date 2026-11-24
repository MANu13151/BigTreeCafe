import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const base = process.env.CAFE_URL || "http://127.0.0.1:3108";
const artifacts = path.resolve(".qa");
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["mobile", 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      hasTouch: name === "mobile",
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".dish-picture img").first().waitFor();
    const screenshot = async (suffix) =>
      page.screenshot({
        path: path.join(artifacts, name + "-" + suffix + ".png"),
        animations: "disabled",
      });
    for (const [mode, label] of [
      ["night", "Starlit Night"],
      ["day", "Day Lagoon"],
    ]) {
      const control = page.getByRole("button", { name: label, exact: true });
      await control.click();
      assert.equal(await control.getAttribute("aria-pressed"), "true");
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".hero-photo")].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      );
      const crop = await page
        .locator(".hero-photo")
        .first()
        .evaluate((img) => {
          const box = img.parentElement.getBoundingClientRect(),
            r = img.getBoundingClientRect(),
            scale = Math.max(
              r.width / img.naturalWidth,
              r.height / img.naturalHeight,
            );
          return {
            horizontal: (1 - box.width / (img.naturalWidth * scale)) / 2,
            vertical: (1 - box.height / (img.naturalHeight * scale)) / 2,
          };
        });
      assert.ok(
        crop.vertical > 0.045 || crop.horizontal > 0.15,
        "Watermark regions must be outside frame",
      );
      await screenshot(mode);
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "Page overflows horizontally",
    );
    await page
      .getByRole("button", { name: "Starlit Night", exact: true })
      .click();
    if (name === "mobile") {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Table QR Menu" })
        .click();
    } else await page.getByRole("link", { name: "Open Table QR Menu" }).click();
    const veg = page.getByRole("switch", { name: "Veg Only" });
    await veg.click();
    assert.equal(await page.locator(".nonveg").count(), 0);
    assert.ok((await page.locator(".dish-card").count()) > 0);
    await veg.click();
    assert.ok((await page.locator(".nonveg").count()) > 0);
    for (const button of await page.locator(".filters button").all()) {
      await button.click();
      assert.ok((await page.locator(".dish-card").count()) > 0);
      await page.locator(".dish-picture img").first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".dish-picture img")].every(
          (img) => img.complete && img.naturalWidth > 0,
        ),
      );
    }
    const search = page.getByRole("searchbox");
    await search.fill("pesto");
    assert.equal(await page.locator(".dish-card").count(), 1);
    await search.fill("no such dish");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("button", { name: "Add Basil Margherita", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Add one Basil Margherita", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Remove one Basil Margherita", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open Table #08 Order Tray, 1 items" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Order Tray" });
    assert.match(await dialog.innerText(), /₹519\.75/);
    await dialog
      .getByRole("textbox")
      .fill("Extra basil · browser verification");
    await dialog.getByRole("button", { name: "Close order tray" }).click();
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    await page
      .getByRole("button", { name: "Open Table #08 Order Tray, 1 items" })
      .click();
    assert.match(await dialog.getByRole("textbox").inputValue(), /Extra basil/);
    assert.match(
      decodeURIComponent(
        await dialog
          .getByRole("link", { name: "Share order on WhatsApp" })
          .getAttribute("href"),
      ),
      /1 × Basil Margherita/,
    );
    await screenshot("tray");
    await dialog.getByRole("button", { name: "Send Order to Kitchen" }).click();
    await dialog.getByText("Order received.").waitFor();
    await dialog.getByRole("button", { name: "Back to the table" }).click();
    await page
      .getByRole("button", { name: "Open Table #08 Order Tray, 0 items" })
      .waitFor();
    await page.locator("#seating").scrollIntoViewIfNeeded();
    const canvas = page.locator("canvas");
    await canvas.waitFor({ timeout: 60000 });
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const el = document.querySelector("canvas");
      return (
        el &&
        el.width > 100 &&
        el.getContext("webgl2") &&
        !el.getContext("webgl2").isContextLost()
      );
    });
    for (const zone of [
      "Sunken Lagoon Pod",
      "Private Teepee Cabana",
      "Floating Boat Table",
    ]) {
      const control = page.getByRole("button", { name: zone, exact: true });
      await control.click();
      assert.equal(await control.getAttribute("aria-pressed"), "true");
    }
    await page.getByRole("button", { name: "Show full lagoon" }).click();
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const rendered = await canvas.screenshot({
      path: path.join(artifacts, name + "-lagoon-3d.png"),
    });
    const stats = await sharp(rendered).stats();
    assert.ok(
      stats.channels.some((c) => c.stdev > 20),
      "Empty canvas",
    );
    await page
      .getByLabel("Choose your package")
      .selectOption("Anniversary Neon & Cake");
    assert.match(
      decodeURIComponent(
        await page
          .getByRole("link", { name: "Reserve on WhatsApp" })
          .getAttribute("href"),
      ),
      /Anniversary Neon & Cake/,
    );
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    );
    await page.getByRole("button", { name: "Explore the drinks" }).click();
    assert.deepEqual(await page.locator(".dish-card h3").allTextContents(), [
      "Rosemary Smoke",
      "Lagoon Citrus Cooler",
    ]);
    assert.deepEqual(errors, []);
    console.log(
      name +
        " " +
        width +
        "×" +
        height +
        " passed: menus, images, crop bounds, lighting, cart, persisted ticket, handoffs and rendered WebGL. Zero console or page errors.",
    );
    await page.close();
  }
} finally {
  await browser.close();
}
