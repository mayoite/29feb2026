type SupabaseErrorLike = {
  message?: string;
  code?: string;
} | null | undefined;

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 400;
const loggedSupabaseErrors = new Set<string>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function summarizeSupabaseError(error: unknown): string {
  if (!error) return "Unknown Supabase error";
  if (typeof error === "string") {
    const compact = error.replace(/\s+/g, " ").trim();
    return compact.length > 260 ? `${compact.slice(0, 260)}...` : compact;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = String((error as { message?: unknown }).message ?? "Unknown Supabase error");
    const compact = msg.replace(/\s+/g, " ").trim();
    return compact.length > 260 ? `${compact.slice(0, 260)}...` : compact;
  }
  return String(error);
}

export function isTransientSupabaseError(error: unknown): boolean {
  const normalized = summarizeSupabaseError(error).toLowerCase();
  return (
    normalized.includes("ssl handshake failed") ||
    normalized.includes("error code 525") ||
    normalized.includes("fetch failed") ||
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("temporarily unavailable")
  );
}

export async function fetchWithSupabaseRetry<T>(
  label: string,
  run: () => Promise<{ data: T | null; error: SupabaseErrorLike }>,
  fallback: T | null,
  retries = DEFAULT_RETRIES,
  baseDelayMs = DEFAULT_DELAY_MS,
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const { data, error } = await run();

    if (!error) {
      return data ?? fallback;
    }

    const summarized = summarizeSupabaseError(error);
    const logKey = `${label}:${summarized}`;
    if (!loggedSupabaseErrors.has(logKey)) {
      loggedSupabaseErrors.add(logKey);
      console.error(`[supabase:${label}] attempt ${attempt}/${retries}: ${summarized}`);
    }

    if (attempt < retries && isTransientSupabaseError(error)) {
      await wait(baseDelayMs * attempt);
      continue;
    }

    return fallback;
  }

  return fallback;
}
