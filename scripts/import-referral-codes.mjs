import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

// Load .env.local (same source the dev server uses)
const envPath = resolve(import.meta.dirname, "..", ".env.local");
try {
  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local missing — rely on exported env vars
}

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const EXCEL_PATH =
  process.env.EXCEL_PATH ||
  "/Users/muhdnurirfanmohdariffgmail.com/Downloads/MEDTECH REFERRAL CODE.xlsx";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    [
      "Missing required environment variables.",
      "",
      "Required:",
      "  SUPABASE_URL",
      "  SUPABASE_SERVICE_ROLE_KEY",
      "",
      "Optional:",
      "  EXCEL_PATH  (defaults to the Downloads folder copy)",
    ].join("\n"),
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

/* ------------------------------------------------------------------ */
/* Read & validate the Excel file                                     */
/* ------------------------------------------------------------------ */

function readExcel(path) {
  const wb = XLSX.readFile(path);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  if (rows.length === 0) {
    throw new Error("Excel file contains no data rows.");
  }

  const keys = Object.keys(rows[0]);
  // The code column has a non-breaking space: "Preferred referral code.\u00a0E.g: ..."
  const codeCol = keys.find((k) => k.startsWith("Preferred referral code"));
  const nameCol = keys.find((k) => k.trim() === "Full name");

  if (!codeCol) throw new Error("Cannot find referral code column in Excel.");
  if (!nameCol) throw new Error("Cannot find 'Full name' column in Excel.");

  const records = [];
  const errors = [];
  const seen = new Set();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawCode = row[codeCol];
    const rawName = row[nameCol];

    if (!rawCode || !String(rawCode).trim()) {
      errors.push(`Row ${i + 2}: empty referral code, skipping.`);
      continue;
    }
    if (!rawName || !String(rawName).trim()) {
      errors.push(`Row ${i + 2}: empty referrer name, skipping.`);
      continue;
    }

    const code = String(rawCode).trim().toLowerCase();
    const displayCode = String(rawCode).trim();
    const referrerName = String(rawName).trim();

    if (seen.has(code)) {
      errors.push(`Row ${i + 2}: duplicate code "${displayCode}", skipping.`);
      continue;
    }
    seen.add(code);

    records.push({ code, displayCode, referrerName });
  }

  if (errors.length > 0) {
    console.log("\nValidation warnings:");
    errors.forEach((e) => console.log("  " + e));
  }

  return records;
}

/* ------------------------------------------------------------------ */
/* Upsert into referral_codes                                        */
/* ------------------------------------------------------------------ */

async function upsertCodes(records) {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  // Batch in chunks of 50 (Supabase REST limit for JSON arrays)
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const payload = batch.map((r) => ({
      code: r.code,
      display_code: r.displayCode,
      referrer_name: r.referrerName,
      active: true,
    }));

    const { data, error } = await supabase
      .from("referral_codes")
      .upsert(payload, { onConflict: "code", ignoreDuplicates: false })
      .select("code");

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} failed:`, error.message);
      failed += batch.length;
      continue;
    }

    // Supabase upsert returns only inserted rows; count via the response
    inserted += data?.length ?? 0;
  }

  return { inserted, updated, failed };
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log(`Reading Excel: ${EXCEL_PATH}`);
  const records = readExcel(EXCEL_PATH);
  console.log(`Parsed ${records.length} valid referral codes.`);

  if (records.length === 0) {
    console.log("Nothing to import.");
    return;
  }

  console.log("Upserting into referral_codes...");
  const result = await upsertCodes(records);

  console.log(
    [
      "",
      "Import complete.",
      `  Inserted/updated: ${result.inserted}`,
      `  Failed:           ${result.failed}`,
      "",
    ].join("\n"),
  );
}

main().catch((err) => {
  console.error("Import failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
