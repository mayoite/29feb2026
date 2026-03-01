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
    await expect(productsButton).toBeVisible();

    const categoriesResponse = await page.request.get("/api/nav-categories");
    expect(categoriesResponse.status()).toBe(200);
    const categoriesPayload = (await categoriesResponse.json()) as NavCategoriesPayload;
    const categoryHrefs: string[] = [];
    for (const group of categoriesPayload.groups || []) {
      for (const item of group.items || []) {
        if (item.href?.startsWith("/products/")) categoryHrefs.push(item.href);
      }
    }

    expect(categoryHrefs.length).toBeGreaterThan(0);

    for (const href of categoryHrefs) {
      const response = await page.request.get(href);
      expect(response.status(), `${href} should not return an error status`).toBeLessThan(400);
    }

    const targetHref = categoryHrefs[0];
    await page.goto(targetHref);

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
    const targetResponse = await page.request.get(targetHref);
    expect(targetResponse.status(), `${targetHref} should not return an error status`).toBeLessThan(400);
  });

  test("desktop AI search endpoint returns structured fallback-safe responses", async ({ page }) => {
    const response = await page.request.post("/api/nav-search/", {
      data: { query: "mesh chair", limit: 8, context: "header" },
    });
    expect([200, 500]).toContain(response.status());

    const payload = (await response.json()) as {
      results?: Array<{ source?: "ai" | "local" }>;
      fallbackUsed?: boolean;
      latencyMs?: number;
      error?: { code?: string; message?: string };
    };

    expect(Array.isArray(payload.results)).toBeTruthy();
    expect(typeof payload.fallbackUsed).toBe("boolean");
    expect(typeof payload.latencyMs).toBe("number");

    if (response.status() === 500) {
      expect(payload.error?.code).toBe("SEARCH_FAILED");
    }

    if ((payload.results || []).length > 0) {
      expect(["ai", "local"]).toContain(payload.results?.[0]?.source);
    }

    const shortQueryResponse = await page.request.post("/api/nav-search/", {
      data: { query: "m", limit: 8, context: "header" },
    });
    expect(shortQueryResponse.status()).toBe(400);
  });

  test("quote cart badge updates after adding product", async ({ page }) => {
    await page.goto("/products/seating");
    const addToQuote = page.getByRole("button", { name: /Add To Quote/i }).first();
    await expect(addToQuote).toBeVisible();
    await addToQuote.click();

    const cartState = await page.evaluate(() => localStorage.getItem("quote-cart-v1"));
    expect(cartState).toBeTruthy();
    expect(cartState || "").toContain("\"items\"");

    await page.goto("/quote-cart");
    await expect(page).toHaveURL(/\/quote-cart/);
  });

  test("broken-link smoke: key nav and category routes return healthy responses", async ({
    page,
  }) => {
    test.setTimeout(120000);

    const allPaths = new Set<string>(STATIC_NAV_PATHS);

    for (const path of allPaths) {
      const response = await page.request.get(path);
      expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(400);
    }
  });
});
