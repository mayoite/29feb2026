import { expect, test } from "@playwright/test";

const STATIC_NAV_PATHS = [
  "/",
  "/products",
  "/solutions",
  "/projects",
  "/about",
  "/contact",
  "/sustainability",
  "/downloads",
  "/quote-cart",
];

type NavCategoriesPayload = {
  groups?: Array<{
    items?: Array<{
      href?: string;
      subcategories?: Array<{ href?: string }>;
    }>;
  }>;
};

test.describe("Navigation Redesign Smoke", () => {
  test("desktop mega menu navigation works across category groups", async ({ page }) => {
    await page.goto("/");

    const productsButton = page.getByRole("button", { name: /Products/i });
    await productsButton.hover();
    await expect(page.locator("#products-mega-menu")).toBeVisible();

    const groupCards = page.locator("#products-mega-menu .rounded-2xl.border");
    const groupCount = await groupCards.count();
    expect(groupCount).toBeGreaterThanOrEqual(6);

    const categoryHrefs = await groupCards.evaluateAll((cards) =>
      cards
        .map((card) => card.querySelector("a[href^='/products/']")?.getAttribute("href"))
        .filter((href): href is string => Boolean(href)),
    );

    expect(categoryHrefs.length).toBeGreaterThan(0);

    for (const href of categoryHrefs) {
      const response = await page.request.get(href);
      expect(response.status(), `${href} should not return an error status`).toBeLessThan(400);
    }

    const firstCategoryLink = page.locator("#products-mega-menu a[href^='/products/']").first();
    const targetHref = (await firstCategoryLink.getAttribute("href")) || "/products";
    await firstCategoryLink.click();

    await expect(page).toHaveURL(new RegExp(targetHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("mobile hamburger accordion flow and back navigation are functional", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: /Open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /Mobile navigation/i })).toBeVisible();

    const accordionButton = page
      .getByRole("button", {
        name: /Seating|Workstations|Tables|Storages|Soft Seating|Education/i,
      })
      .first();
    await accordionButton.click();

    const firstCategoryLink = page
      .getByRole("dialog", { name: /Mobile navigation/i })
      .locator("a[href^='/products/']")
      .first();
    await expect(firstCategoryLink).toBeVisible();

    const targetHref = (await firstCategoryLink.getAttribute("href")) || "/products";
    await firstCategoryLink.click();
    await expect(page).toHaveURL(new RegExp(targetHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    await page.goBack();
    await page.getByRole("button", { name: /Open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /Mobile navigation/i })).toBeVisible();
  });

  test("desktop AI search supports AI and local fallback response states", async ({ page }) => {
    let requestCount = 0;
    await page.route("**/api/nav-search", async (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            results: [
              {
                id: "category:seating",
                title: "Seating",
                href: "/products/seating",
                type: "category",
                source: "ai",
              },
            ],
            fallbackUsed: false,
            latencyMs: 54,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: "category:tables",
              title: "Tables",
              href: "/products/tables",
              type: "category",
              source: "local",
            },
          ],
          fallbackUsed: true,
          latencyMs: 72,
        }),
      });
    });

    await page.goto("/");

    const desktopSearch = page.getByLabel("Search products");
    await desktopSearch.click();
    await desktopSearch.fill("mesh chair");
    await expect(page.getByText("AI Ranked")).toBeVisible();

    await desktopSearch.fill("cafe table");
    await expect(page.getByText("Local Fallback")).toBeVisible();
  });

  test("quote cart badge updates after adding product", async ({ page }) => {
    await page.goto("/products/seating");
    const addToQuote = page.getByRole("button", { name: /Add To Quote/i }).first();
    await expect(addToQuote).toBeVisible();
    await addToQuote.click();

    await page.goto("/");
    const cartBadge = page.locator("a[aria-label='Quote cart'] span");
    await expect(cartBadge).toBeVisible();
  });

  test("broken-link smoke: key nav and category routes return healthy responses", async ({
    page,
  }) => {
    test.setTimeout(120000);

    const allPaths = new Set<string>(STATIC_NAV_PATHS);

    const categoryResponse = await page.request.get("/api/nav-categories");
    expect(categoryResponse.status()).toBe(200);

    const payload = (await categoryResponse.json()) as NavCategoriesPayload;
    for (const group of payload.groups || []) {
      for (const item of group.items || []) {
        if (item.href?.startsWith("/")) allPaths.add(item.href);
        for (const sub of item.subcategories || []) {
          if (sub.href?.startsWith("/")) allPaths.add(sub.href);
        }
      }
    }

    for (const path of allPaths) {
      const response = await page.request.get(path);
      expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(400);
    }
  });
});
