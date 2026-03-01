import { expect, test } from "@playwright/test";

function expectParam(urlString: string, key: string, expected: string) {
  const url = new URL(urlString, "http://localhost:3000");
  expect(url.searchParams.getAll(key)).toContain(expected);
}

test.describe("Dynamic Filters", () => {
  test("hydrates from URL filters and keeps shareable state", async ({ page, context }) => {
    const sharedPath = "/products/seating?price=mid&mat=mesh&ecoMin=6&sort=ecoDesc";

    await page.goto(sharedPath);
    await expect(page.getByLabel(/Search/i)).toBeVisible();

    await expect(page.getByText(/mid range/i)).toBeVisible();
    await expect(page.getByText(/eco >= 6/i)).toBeVisible();
    await expect(page.getByLabel("Sort products")).toHaveValue("ecoDesc");

    const sharedUrl = page.url();
    const secondPage = await context.newPage();
    await secondPage.goto(sharedUrl);

    await expect(secondPage.getByText(/mid range/i)).toBeVisible();
    await expect(secondPage.getByText(/eco >= 6/i)).toBeVisible();
    await expect(secondPage.getByLabel("Sort products")).toHaveValue("ecoDesc");
  });

  test("sustainability filter updates URL and can be cleared", async ({ page }) => {
    await page.goto("/products/seating");
    await expect(page.getByLabel(/Search/i)).toBeVisible();

    const desktopAside = page.locator("aside");
    await desktopAside.getByRole("button", { name: "Sustainability" }).click();
    await desktopAside.getByRole("button", { name: ">= 6" }).click();

    await expect(page).toHaveURL(/ecoMin=6/);
    await expect(page.getByText(/eco >= 6/i)).toBeVisible();

    await page.getByRole("button", { name: /Clear all/i }).first().click();
    await expect(page).toHaveURL(/\/products\/seating$/);
  });

  test("product detail carries from context and breadcrumb returns to filtered list", async ({
    page,
  }) => {
    await page.goto("/products/seating?price=mid&ecoMin=6");
    await expect(page.getByLabel(/Search/i)).toBeVisible();

    const firstProductLink = page.locator("article a[href*='from=']").first();
    await expect(firstProductLink).toBeVisible();

    const hrefBeforeClick = await firstProductLink.getAttribute("href");
    expect(hrefBeforeClick).not.toBeNull();
    expectParam(hrefBeforeClick!, "from", "price=mid&ecoMin=6");

    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/seating\/[^/?]+/);
    await expect(page).toHaveURL(/from=/);

    const breadcrumbCategoryLink = page.locator("main a[href^='/products/seating?']").first();
    await expect(breadcrumbCategoryLink).toBeVisible();
    await breadcrumbCategoryLink.click();

    await expect(page).toHaveURL(/\/products\/seating\?/);
    const returnedUrl = page.url();
    expectParam(returnedUrl, "price", "mid");
    expectParam(returnedUrl, "ecoMin", "6");
  });
});

