import { expect, test } from "@playwright/test";

test.describe("Navigation Redesign Smoke", () => {
  test("desktop mega menu navigation works", async ({ page }) => {
    await page.goto("/");

    const productsButton = page.getByRole("button", { name: /Products/i });
    await productsButton.hover();
    await expect(page.locator("#products-mega-menu")).toBeVisible();

    const firstCategoryLink = page
      .locator("#products-mega-menu a[href^='/products/']")
      .first();
    await expect(firstCategoryLink).toBeVisible();
    await firstCategoryLink.click();

    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test("mobile hamburger, category accordion and search are functional", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: /Open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /Mobile navigation/i })).toBeVisible();

    const accordionButton = page
      .getByRole("button", { name: /Seating|Workspaces|Tables|Storage|Specialty/i })
      .first();
    await accordionButton.click();

    const firstCategoryLink = page
      .getByRole("dialog", { name: /Mobile navigation/i })
      .locator("a[href^='/products/']")
      .first();
    await expect(firstCategoryLink).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: /Open menu/i }).click();
    const mobileSearch = page.getByLabel("Mobile search products");
    await mobileSearch.fill("chair");
    await expect(
      page.getByText(/^(Results|No Results|Searching)$/i).first(),
    ).toBeVisible();
  });

  test("quote cart badge updates after adding product", async ({ page }) => {
    await page.goto("/products/chairs-mesh");
    const addToQuote = page.getByRole("button", { name: /Add To Quote/i }).first();
    await expect(addToQuote).toBeVisible();
    await addToQuote.click();

    await page.goto("/");
    const cartBadge = page.locator("a[aria-label='Quote cart'] span");
    await expect(cartBadge).toBeVisible();
  });
});
