import { test, expect } from "@playwright/test";
import { mockPokeApi } from "./helpers/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page);
  await page.goto("/");
  await expect(page.locator(".type-btn").first()).toBeVisible();
});

test("selecting a type shows weakness results", async ({ page }) => {
  await page.locator(".type-btn", { hasText: "Fire" }).click();

  // Fire type should be selected
  await expect(page.locator(".type-btn.selected")).toHaveCount(1);

  // Results should show weaknesses (Fire is weak to Water, Ground, Rock)
  await expect(page.locator(".result-group")).not.toHaveCount(0);
});

test("selecting two types shows combined matchup", async ({ page }) => {
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await page.locator(".type-btn", { hasText: "Flying" }).click();

  await expect(page.locator(".type-btn.selected")).toHaveCount(2);
  await expect(page.locator(".result-group")).not.toHaveCount(0);
});

test("selecting a third type resets to just that type", async ({ page }) => {
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await page.locator(".type-btn", { hasText: "Flying" }).click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(2);

  // Click a third type — should reset to just this one
  await page.locator(".type-btn", { hasText: "Water" }).click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(1);

  // Only Water should be selected
  await expect(page.locator(".type-btn.selected")).toHaveText("Water");
});

test("clear button deselects all types", async ({ page }) => {
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(1);

  await page.locator(".clear-btn").click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(0);
});

test("deselecting a type removes it", async ({ page }) => {
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(1);

  // Click same type again to deselect
  await page.locator(".type-btn", { hasText: "Fire" }).click();
  await expect(page.locator(".type-btn.selected")).toHaveCount(0);
});
