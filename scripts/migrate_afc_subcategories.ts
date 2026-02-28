import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type JsonObject = Record<string, unknown>;

type ProductRow = {
  id: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  category_id: string | null;
  series_name: string | null;
  metadata: JsonObject | null;
};

type CanonicalCategory =
  | "seating"
  | "workstations"
  | "tables"
  | "storages"
  | "soft-seating"
  | "education";

type CanonicalSubcategory = {
  label: string;
  slug: string;
};

type BackupRecord = {
  id: string;
  slug: string | null;
  name: string | null;
  category_id: string | null;
  oldMetadata: JsonObject;
  newMetadata: JsonObject;
};

type BackupPayload = {
  migrationId: string;
  createdAt: string;
  source: "afc-subcategory-v1";
  totalScanned: number;
  totalChanged: number;
  records: BackupRecord[];
};

const CATEGORY_LABELS: Record<CanonicalCategory, string> = {
  seating: "Seating",
  workstations: "Workstations",
  tables: "Tables",
  storages: "Storages",
  "soft-seating": "Soft Seating",
  education: "Education",
};

const LEGACY_CATEGORY_MAP: Record<string, CanonicalCategory> = {
  "oando-seating": "seating",
  "oando-other-seating": "seating",
  "oando-chairs": "seating",
  "chairs-mesh": "seating",
  "chairs-others": "seating",
  "cafe-seating": "seating",
  "others-2": "seating",
  "oando-workstations": "workstations",
  workstations: "workstations",
  "oando-tables": "tables",
  "meeting-conference-tables": "tables",
  "desks-cabin-tables": "tables",
  tables: "tables",
  "oando-storage": "storages",
  storages: "storages",
  "oando-soft-seating": "soft-seating",
  "oando-collaborative": "soft-seating",
  "soft-seating": "soft-seating",
  "others-1": "soft-seating",
  "oando-educational": "education",
  education: "education",
};

function normalize(input: unknown): string {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasToken(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return re.test(text);
}

function buildRowText(row: ProductRow): string {
  const metadata = row.metadata ?? {};
  const tags = Array.isArray(metadata.tags) ? metadata.tags.join(" ") : "";
  return normalize(
    [
      row.slug,
      row.name,
      row.description,
      row.category_id,
      row.series_name,
      metadata.category,
      metadata.subcategory,
      tags,
    ].join(" "),
  );
}

function classifyCategory(row: ProductRow): CanonicalCategory {
  const categoryId = normalize(row.category_id);
  if (categoryId && LEGACY_CATEGORY_MAP[categoryId]) {
    return LEGACY_CATEGORY_MAP[categoryId];
  }

  const text = buildRowText(row);
  if (
    hasToken(text, "classroom") ||
    hasToken(text, "auditorium") ||
    hasToken(text, "hostel") ||
    hasToken(text, "library")
  ) {
    return "education";
  }
  if (
    hasToken(text, "compactor") ||
    hasToken(text, "metal storage") ||
    hasToken(text, "prelam") ||
    hasToken(text, "locker") ||
    hasToken(text, "cabinet")
  ) {
    return "storages";
  }
  if (
    hasToken(text, "height adjustable") ||
    hasToken(text, "height-adjustable") ||
    hasToken(text, "panel series") ||
    hasToken(text, "desking series") ||
    hasToken(text, "workstation")
  ) {
    return "workstations";
  }
  if (hasToken(text, "table") || hasToken(text, "conference")) {
    return "tables";
  }
  if (
    hasToken(text, "lounge") ||
    hasToken(text, "sofa") ||
    hasToken(text, "collaborative") ||
    hasToken(text, "pouffee") ||
    hasToken(text, "pouf") ||
    hasToken(text, "pod")
  ) {
    return "soft-seating";
  }
  return "seating";
}

function classifySubcategory(
  row: ProductRow,
  category: CanonicalCategory,
): CanonicalSubcategory {
  const text = buildRowText(row);

  if (category === "seating") {
    if (hasToken(text, "mesh")) return { label: "Mesh chairs", slug: "mesh-chairs" };
    if (hasToken(text, "training")) {
      return { label: "Training chairs", slug: "training-chairs" };
    }
    if (hasToken(text, "cafe") || hasToken(text, "stool")) {
      return { label: "Cafe chairs", slug: "cafe-chairs" };
    }
    return { label: "Leather chairs", slug: "leather-chairs" };
  }

  if (category === "workstations") {
    if (hasToken(text, "height adjustable") || hasToken(text, "height-adjustable")) {
      return {
        label: "Height Adjustable Series",
        slug: "height-adjustable-series",
      };
    }
    if (hasToken(text, "panel")) return { label: "Panel Series", slug: "panel-series" };
    return { label: "Desking Series", slug: "desking-series" };
  }

  if (category === "tables") {
    if (hasToken(text, "meeting") || hasToken(text, "conference")) {
      return { label: "Meeting Tables", slug: "meeting-tables" };
    }
    if (hasToken(text, "cafe")) return { label: "Cafe Tables", slug: "cafe-tables" };
    if (hasToken(text, "training")) {
      return { label: "Training Tables", slug: "training-tables" };
    }
    return { label: "Cabin Tables", slug: "cabin-tables" };
  }

  if (category === "storages") {
    if (hasToken(text, "locker")) return { label: "Locker", slug: "locker" };
    if (hasToken(text, "compactor")) {
      return { label: "Compactor Storage", slug: "compactor-storage" };
    }
    if (hasToken(text, "metal")) return { label: "Metal Storage", slug: "metal-storage" };
    return { label: "Prelam Storage", slug: "prelam-storage" };
  }

  if (category === "soft-seating") {
    if (hasToken(text, "sofa")) return { label: "Sofa", slug: "sofa" };
    if (hasToken(text, "collaborative") || hasToken(text, "pod")) {
      return { label: "Collaborative", slug: "collaborative" };
    }
    if (
      hasToken(text, "occasional table") ||
      hasToken(text, "coffee table") ||
      hasToken(text, "side table")
    ) {
      return { label: "Occasional Tables", slug: "occasional-tables" };
    }
    if (hasToken(text, "pouffee") || hasToken(text, "pouf") || hasToken(text, "ottoman")) {
      return { label: "Pouffee", slug: "pouffee" };
    }
    return { label: "Lounge", slug: "lounge" };
  }

  if (hasToken(text, "library")) return { label: "Library", slug: "library" };
  if (hasToken(text, "hostel")) return { label: "Hostel", slug: "hostel" };
  if (hasToken(text, "auditorium")) return { label: "Auditorium", slug: "auditorium" };
  return { label: "Classroom", slug: "classroom" };
}

function toMetadata(input: unknown): JsonObject {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return { ...(input as JsonObject) };
}

function createMigrationId(now: Date): string {
  const iso = now.toISOString().replace(/[-:.TZ]/g, "");
  return `afc-subcategory-${iso.slice(0, 14)}`;
}

async function fetchAllProducts(
  supabase: ReturnType<typeof createClient>,
): Promise<ProductRow[]> {
  const pageSize = 1000;
  const rows: ProductRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, category_id, series_name, metadata")
      .range(from, to);
    if (error) throw new Error(`Read failed at range ${from}-${to}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as ProductRow[]));
    if (data.length < pageSize) break;
  }
  return rows;
}

async function applyMigration(dryRun = false) {
  dotenv.config({ path: ".env.local" });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = await fetchAllProducts(supabase);
  const changes: BackupRecord[] = [];

  for (const row of rows) {
    const current = toMetadata(row.metadata);
    const category = classifyCategory(row);
    const subcategory = classifySubcategory(row, category);
    const nextMetadata: JsonObject = {
      ...current,
      category: CATEGORY_LABELS[category],
      subcategory: subcategory.label,
      subcategory_slug: subcategory.slug,
    };

    const changed =
      current.category !== nextMetadata.category ||
      current.subcategory !== nextMetadata.subcategory ||
      current.subcategory_slug !== nextMetadata.subcategory_slug;

    if (!changed) continue;

    changes.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category_id: row.category_id,
      oldMetadata: current,
      newMetadata: nextMetadata,
    });
  }

  const migrationId = createMigrationId(new Date());
  const backup: BackupPayload = {
    migrationId,
    createdAt: new Date().toISOString(),
    source: "afc-subcategory-v1",
    totalScanned: rows.length,
    totalChanged: changes.length,
    records: changes,
  };

  const backupDir = path.join(process.cwd(), "docs", "migrations", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `${migrationId}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");

  if (dryRun) {
    console.log(`DRY RUN complete. Scanned=${rows.length} Changed=${changes.length}`);
    console.log(`Backup written: ${backupPath}`);
    return;
  }

  let updated = 0;
  for (const record of changes) {
    const { error } = await supabase
      .from("products")
      .update({ metadata: record.newMetadata })
      .eq("id", record.id);
    if (error) {
      throw new Error(
        `Update failed for product id=${record.id}, slug=${record.slug}: ${error.message}`,
      );
    }
    updated += 1;
  }

  console.log(`Migration applied. Scanned=${rows.length} Updated=${updated}`);
  console.log(`Backup written: ${backupPath}`);
}

async function rollbackMigration(backupFilePath: string) {
  dotenv.config({ path: ".env.local" });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const fullPath = path.isAbsolute(backupFilePath)
    ? backupFilePath
    : path.join(process.cwd(), backupFilePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Backup file not found: ${fullPath}`);
  }

  const backup = JSON.parse(fs.readFileSync(fullPath, "utf8")) as BackupPayload;
  if (!Array.isArray(backup.records)) {
    throw new Error("Invalid backup file: missing records array.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let restored = 0;
  for (const record of backup.records) {
    const { error } = await supabase
      .from("products")
      .update({ metadata: record.oldMetadata })
      .eq("id", record.id);
    if (error) {
      throw new Error(
        `Rollback failed for product id=${record.id}, slug=${record.slug}: ${error.message}`,
      );
    }
    restored += 1;
  }

  console.log(
    `Rollback completed from ${path.basename(fullPath)}. Restored rows=${restored}`,
  );
}

function usage() {
  console.log("Usage:");
  console.log("  npx tsx scripts/migrate_afc_subcategories.ts --apply [--dry-run]");
  console.log("  npx tsx scripts/migrate_afc_subcategories.ts --rollback <backup-file>");
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = args.includes("--dry-run");
  const rollbackIndex = args.indexOf("--rollback");

  if (isApply) {
    await applyMigration(isDryRun);
    return;
  }

  if (rollbackIndex !== -1) {
    const backupPath = args[rollbackIndex + 1];
    if (!backupPath) {
      throw new Error("Missing backup file path after --rollback");
    }
    await rollbackMigration(backupPath);
    return;
  }

  usage();
  throw new Error("Missing required mode. Use --apply or --rollback.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
