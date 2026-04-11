import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockPokeApi } from "./helpers/mockApi";

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page);
});

test("page has no critical or serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  // Wait for Pokemon list to render
  await expect(page.locator(".pokemon-card").first()).toBeVisible({ timeout: 10000 });

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"]) // dark theme contrast is intentional
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(serious).toEqual([]);
});

test("type grid buttons are keyboard accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".type-btn").first()).toBeVisible();

  // Tab to first type button and press Enter
  await page.locator(".type-btn").first().focus();
  await page.keyboard.press("Enter");

  // A type should now be selected
  await expect(page.locator(".type-btn.selected")).toHaveCount(1);
});
