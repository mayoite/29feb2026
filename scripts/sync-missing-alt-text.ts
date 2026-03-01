import "dotenv/config";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

type ProductRow = {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  alt_text: string | null;
  metadata: Record<string, unknown> | null;
};

function parseNumberArg(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  if (!arg) return fallback;
  const parsed = Number.parseInt(arg.slice(prefix.length), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const apply = process.argv.includes("--apply");
const limit = parseNumberArg("limit", 0);
const batchSize = Math.max(1, parseNumberArg("batch-size", 20));
const retries = Math.max(1, parseNumberArg("retries", 3));

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
  throw new Error(
    "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function normalizeCategory(categoryId: string | null): string {
  return (categoryId || "furniture").replace(/^oando-/, "").replace(/-/g, " ");
}

function fallbackAltText(row: ProductRow): string {
  return `${row.name} ${normalizeCategory(row.category_id)}`.replace(/\s+/g, " ").trim().slice(0, 140);
}

async function generateAltText(row: ProductRow): Promise<string> {
  if (!openai) return fallbackAltText(row);

  const prompt = [
    "Generate concise product image alt text for office furniture.",
    "Return plain text only, max 15 words.",
    `Category: ${normalizeCategory(row.category_id)}`,
    `Name: ${row.name}`,
    row.description ? `Description: ${row.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 60,
    });
    const generated = completion.choices[0]?.message?.content?.trim();
    if (!generated) return fallbackAltText(row);
    return generated.replace(/\s+/g, " ").trim().slice(0, 140);
  } catch {
    return fallbackAltText(row);
  }
}

function hasExistingAlt(row: ProductRow): boolean {
  const metadata = row.metadata || {};
  const aiAlt =
    (typeof metadata.ai_alt_text === "string" && metadata.ai_alt_text) ||
    (typeof metadata.aiAltText === "string" && metadata.aiAltText) ||
    "";
  return Boolean(row.alt_text || aiAlt);
}

async function retry<T>(fn: () => Promise<T>, maxAttempts: number): Promise<T> {
  let attempt = 0;
  let lastError: unknown = null;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= maxAttempts) break;
      const delayMs = 250 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function run() {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,category_id,description,alt_text,metadata")
    .order("name", { ascending: true });

  if (error) throw new Error(`Supabase read failed: ${error.message}`);
  const rows = (data || []) as ProductRow[];
  const missing = rows.filter((row) => !hasExistingAlt(row));
  const target = limit > 0 ? missing.slice(0, limit) : missing;

  console.log(`Found ${rows.length} products; ${missing.length} missing alt text.`);
  console.log(`Targeting ${target.length} records (${apply ? "apply" : "dry-run"} mode).`);

  if (target.length === 0) return;

  const generated: Array<{ row: ProductRow; altText: string }> = [];
  for (const row of target) {
    const altText = await generateAltText(row);
    generated.push({ row, altText });
  }

  if (!apply) {
    console.log("Dry run samples:");
    for (const sample of generated.slice(0, 12)) {
      console.log(`- ${sample.row.id}: ${sample.altText}`);
    }
    console.log("Run with --apply to persist updates.");
    return;
  }

  let updated = 0;
  for (let index = 0; index < generated.length; index += batchSize) {
    const batch = generated.slice(index, index + batchSize);
    await Promise.all(
      batch.map(({ row, altText }) =>
        retry(async () => {
          const metadata = {
            ...(row.metadata || {}),
            ai_alt_text: altText,
          };
          const { error: updateError } = await supabase
            .from("products")
            .update({
              alt_text: row.alt_text || altText,
              metadata,
            })
            .eq("id", row.id);
          if (updateError) {
            throw new Error(`Update failed for ${row.id}: ${updateError.message}`);
          }
          updated += 1;
        }, retries),
      ),
    );
    console.log(`Updated ${Math.min(index + batch.length, generated.length)}/${generated.length}`);
  }

  console.log(`Completed. Updated ${updated} records.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
