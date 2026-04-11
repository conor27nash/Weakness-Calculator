import { test, expect } from "@playwright/test";
import { mockPokeApi } from "./helpers/mockApi";

// Team builder sidebar is only visible on desktop layout
test.use({ viewport: { width: 1280, height: 720 } });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "team builder sidebar only visible on desktop");
  await mockPokeApi(page);
  await page.goto("/");
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });
});

test("add Pokemon to team from detail panel", async ({ page }) => {
  // Open Bulbasaur detail
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  const detail = page.locator(".pokemon-detail");
  await expect(detail).toBeVisible({ timeout: 10000 });

  // Click "Add to Team"
  await page.locator(".add-team-btn").click();

  // Should show "On Team" badge instead of add button
  await expect(page.locator(".on-team-badge")).toBeVisible();

  // Team builder should have the Pokemon
  await expect(page.locator(".team-slot.filled")).toHaveCount(1);
  await expect(page.locator(".team-slot-name", { hasText: "bulbasaur" })).toBeVisible();
});

test("remove Pokemon from team", async ({ page }) => {
  // Add Bulbasaur to team
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });
  await page.locator(".add-team-btn").click();
  await expect(page.locator(".team-slot.filled")).toHaveCount(1);

  // Remove from team
  await page.locator(".team-slot-remove").click();
  await expect(page.locator(".team-slot.filled")).toHaveCount(0);
});

test("team analysis updates when members are added", async ({ page }) => {
  // Add Bulbasaur
  await page.locator(".pokemon-card", { hasText: "bulbasaur" }).click();
  await expect(page.locator(".pokemon-detail")).toBeVisible({ timeout: 10000 });
  await page.locator(".add-team-btn").click();

  // Open coverage overlay
  await page.locator(".coverage-toggle").click();
  await expect(page.locator(".coverage-overlay")).toBeVisible();

  // Should show coverage data
  await expect(page.locator(".coverage-row").first()).toBeVisible();
});
