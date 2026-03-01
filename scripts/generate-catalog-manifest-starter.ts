import fs from "fs-extra";
import path from "path";

type CanonicalCategory =
  | "seating"
  | "soft-seating"
  | "workstations"
  | "tables"
  | "storage"
  | "educational"
  | "collaborative";

const ROOT = process.cwd();
const Catalog_DIR = path.resolve(ROOT, "public", "images", "catalog");
const OUT_MANIFEST = path.resolve(ROOT, "scripts", "catalog-image-manifest.csv");

function inferCategoryFromSlug(slug: string): CanonicalCategory | null {
  if (slug.startsWith("oando-seating--")) return "seating";
  if (slug.startsWith("oando-chairs--")) return "seating";
  if (slug.startsWith("oando-other-seating--")) return "seating";
  if (slug.startsWith("oando-soft-seating--")) return "soft-seating";
  if (slug.startsWith("oando-workstations--")) return "workstations";
  if (slug.startsWith("oando-tables--")) return "tables";
  if (slug.startsWith("oando-storage--")) return "storage";
  if (slug.startsWith("oando-educational--")) return "educational";
  if (slug.startsWith("oando-collaborative--")) return "collaborative";
  return null;
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

async function main(): Promise<void> {
  if (!(await fs.pathExists(Catalog_DIR))) {
    throw new Error(`Catalog image directory not found: ${Catalog_DIR}`);
  }

  const dirEntries = await fs.readdir(Catalog_DIR, { withFileTypes: true });
  const productDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(naturalCompare);

  const header = "product_slug,category,rank,source_relative_path";
  const rows: string[] = [header];
  const skipped: Array<{ slug: string; reason: string }> = [];
  let productCount = 0;

  for (const slug of productDirs) {
    const category = inferCategoryFromSlug(slug);
    if (!category) {
      skipped.push({ slug, reason: "unmapped slug prefix" });
      continue;
    }

    const folderPath = path.join(Catalog_DIR, slug);
    const allFiles = (await fs.readdir(folderPath))
      .filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f))
      .sort(naturalCompare);

    if (allFiles.length < 5) {
      skipped.push({ slug, reason: `only ${allFiles.length} image(s)` });
      continue;
    }

    const selected = allFiles.slice(0, 7);
    selected.forEach((file, idx) => {
      const rank = idx + 1;
      const sourceRelativePath = `${slug}/${file}`;
      rows.push(`${slug},${category},${rank},${sourceRelativePath}`);
    });
    productCount += 1;
  }

  await fs.writeFile(OUT_MANIFEST, `${rows.join("\n")}\n`, "utf8");

  console.log(`Starter manifest written: ${OUT_MANIFEST}`);
  console.log(`Products included: ${productCount}`);
  console.log(`Rows written: ${rows.length - 1}`);
  if (skipped.length > 0) {
    console.log(`Skipped: ${skipped.length}`);
    skipped.slice(0, 20).forEach((s) => {
      console.log(` - ${s.slug}: ${s.reason}`);
    });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

