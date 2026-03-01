import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/products", "/products/seating", "/contact", "/quote-cart"];

async function runAxe(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .disableRules(["color-contrast"])
    .analyze();
}

test.describe("Accessibility Smoke", () => {
  for (const route of ROUTES) {
    test(`axe scan: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await runAxe(page);

      const criticalOrSerious = results.violations.filter((violation) =>
        ["critical", "serious"].includes(violation.impact || ""),
      );

      expect(
        criticalOrSerious,
        `${route} has critical/serious accessibility violations`,
      ).toEqual([]);
    });
  }

  test("axe scan: product detail route", async ({ page }) => {
    await page.goto("/products/seating");
    await page.waitForLoadState("networkidle");

    const firstProductLink = page.locator("a[href^='/products/seating/']").first();
    await expect(firstProductLink).toBeVisible();
    await firstProductLink.click();
    await page.waitForLoadState("networkidle");

    const results = await runAxe(page);

    const criticalOrSerious = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact || ""),
    );

    expect(
      criticalOrSerious,
      "Product detail route has critical/serious accessibility violations",
    ).toEqual([]);
  });
});
