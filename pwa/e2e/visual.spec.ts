import { test, expect } from "@playwright/test";
import { mockPokeApi } from "./helpers/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page);
});

test("homepage at desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveScreenshot("homepage-desktop.png", { fullPage: true });
});

test("homepage at 320px mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveScreenshot("homepage-mobile-320.png", { fullPage: true });
});

test("type selection shows results", async ({ page }) => {
  await page.goto("/");
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await expect(page.locator(".result-group").first()).toBeVisible();
  await expect(page).toHaveScreenshot("type-selected-fire.png", { fullPage: true });
});

test("pokemon detail panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".pokemon-detail")).toHaveScreenshot("detail-bulbasaur.png");
});

test("pokemon card type pills at small viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".pokemon-grid")).toHaveScreenshot("pokemon-grid-320.png");
});

test("detail panel at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".pokemon-detail")).toHaveScreenshot("detail-320.png");
});

test("team builder with members", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });
  await page.locator(".add-team-btn").click();
  await expect(page.locator(".team-slot.filled")).toHaveCount(1);
  await expect(page.locator(".team-builder")).toHaveScreenshot("team-with-member.png");
});
