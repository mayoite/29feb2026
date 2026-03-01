export function normalizeAssetPath(path: string | null | undefined): string {
  if (!path) return "";
  let normalized = String(path).trim();
  if (!normalized) return "";

  if (normalized.includes("/images/afc/")) {
    normalized = normalized.replace("/images/afc/", "/images/catalog/");
  }
  if (normalized.includes("/products/afc/")) {
    normalized = normalized.replace("/products/afc/", "/products/catalog/");
  }
  if (normalized.includes("/afc-logo")) {
    normalized = normalized.replace("/afc-logo", "/catalog-logo");
  }

  return normalized;
}

export function normalizeAssetList(
  values: Array<string | null | undefined> | null | undefined,
): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => normalizeAssetPath(value))
    .filter(Boolean);
}

