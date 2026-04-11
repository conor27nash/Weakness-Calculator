import { test, expect } from "@playwright/test";
import { mockPokeApi } from "./helpers/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page);
});

test("type pills stay within card bounds at 320px width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });

  const overflows = await page.evaluate(() => {
    const cards = document.querySelectorAll(".pokemon-card");
    let overflowCount = 0;
    for (const card of cards) {
      const pills = card.querySelector(".card-type-pills");
      if (pills) {
        const cardRect = card.getBoundingClientRect();
        const pillsRect = pills.getBoundingClientRect();
        if (pillsRect.right > cardRect.right + 1 || pillsRect.left < cardRect.left - 1) {
          overflowCount++;
        }
      }
    }
    return overflowCount;
  });

  expect(overflows).toBe(0);
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".type-btn").first()).toBeVisible();

  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  expect(hasHScroll).toBe(false);
});

test("no content extends beyond viewport at 320px with detail open", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });

  // Check page-level horizontal scroll
  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHScroll).toBe(false);

  // Check detail panel children don't clip outside viewport
  const overflows = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const els = document.querySelectorAll(
      ".pokemon-detail, .detail-header, .detail-header img, .detail-header h3, " +
      ".detail-stats, .detail-abilities, .evolution-chain"
    );
    const issues: string[] = [];
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1) issues.push(`${el.className} right=${rect.right} > vw=${vw}`);
      if (rect.left < -1) issues.push(`${el.className} left=${rect.left} < 0`);
    }
    return issues;
  });
  expect(overflows).toEqual([]);
});

test("no horizontal scroll at 480px", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 640 });
  await page.goto("/");
  await expect(page.locator(".type-btn").first()).toBeVisible();

  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  expect(hasHScroll).toBe(false);
});

test("type grid uses correct columns at breakpoints", async ({ page }) => {
  // At 360px → 2 columns
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  await expect(page.locator(".type-grid").first()).toBeVisible();

  let columns = await page.locator(".type-grid").evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns.split(" ").length;
  });
  expect(columns).toBe(2);

  // At 480px → 3 columns
  await page.setViewportSize({ width: 480, height: 640 });
  await expect(async () => {
    columns = await page.locator(".type-grid").evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    expect(columns).toBe(3);
  }).toPass();
});
