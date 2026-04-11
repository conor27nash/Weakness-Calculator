import { test, expect } from "@playwright/test";
import { mockPokeApi } from "./helpers/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page);
  await page.goto("/");
  // Wait for Pokemon to load
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
});

test("clicking a Pokemon card opens detail panel", async ({ page }) => {
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();

  // Detail panel should appear with name and stats
  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });
  await expect(detail.locator("h3")).toContainText("bulbasaur");
  await expect(detail.locator(".stat-row")).not.toHaveCount(0);
});

test("detail panel shows abilities", async ({ page }) => {
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();

  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });
  await expect(detail.locator(".ability-name").first()).toBeVisible();
});

test("detail panel shows evolution chain", async ({ page }) => {
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();

  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });

  // Bulbasaur → Ivysaur → Venusaur
  await expect(detail.locator(".evolution-item")).toHaveCount(3);
});

test("clicking evolution with different types shows its detail", async ({ page }) => {
  // Select Normal type to find Eevee
  await page.locator(".type-btn", { hasText: "Normal" }).click();
  await expect(page.locator(".pokemon-card", { hasText: "eevee" })).toBeVisible({ timeout: 10000 });

  // Open Eevee's detail
  await page.locator(".pokemon-card", { hasText: "eevee" }).click();
  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });
  await expect(detail.locator("h3")).toContainText("eevee");

  // Eevee has evolutions — click Vaporeon (Water type, different from Normal)
  await expect(detail.locator(".evolution-item", { hasText: "vaporeon" })).toBeVisible();
  await detail.locator(".evolution-item", { hasText: "vaporeon" }).click();

  // Detail panel should now show Vaporeon's info, NOT disappear
  await expect(detail.locator("h3")).toContainText("vaporeon", { timeout: 10000 });
  await expect(detail.locator(".stat-row")).not.toHaveCount(0);
});

test("close button dismisses detail panel", async ({ page }) => {
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();

  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });

  await page.locator(".detail-close").click();
  await expect(detail).not.toBeVisible();
});
