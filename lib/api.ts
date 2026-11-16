export type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const buckets = new Map<string, { count: number; reset: number }>();
const MAX_BUCKETS = 10_000;

export function clientKey(request: Request): string {
  const trusted =
    request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip");
  if (trusted) return trusted.trim().slice(0, 64);

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 64) || "unknown";

  return "local";
}

function pruneBuckets(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.reset <= now) buckets.delete(key);
  }
  if (buckets.size >= MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS + 1;
    let removed = 0;
    for (const key of buckets.keys()) {
      if (removed >= excess) break;
      buckets.delete(key);
      removed += 1;
    }
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  pruneBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: Math.ceil(windowMs / 1000) };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
}

export function cleanMessages(
  input: unknown,
  options: {
    maxMessages?: number;
    maxChars?: number;
    requireLastUser?: boolean;
  } = {},
): IncomingMessage[] | null {
  const { maxMessages = 40, maxChars = 24_000, requireLastUser = true } = options;
  if (!Array.isArray(input)) return null;

  const cleaned: IncomingMessage[] = [];
  for (const item of input.slice(-maxMessages)) {
    if (!item || typeof item !== "object") continue;
    const record = item as { role?: unknown; content?: unknown };
    const role =
      record.role === "user" ? "user" : record.role === "assistant" ? "assistant" : null;
    const content = typeof record.content === "string" ? record.content.trim() : "";
    if (!role || !content) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === role) {
      last.content = `${last.content}\n\n${content}`.slice(0, 4000);
    } else {
      cleaned.push({ role, content: content.slice(0, 4000) });
    }
  }

  if (cleaned.length === 0) return null;
  if (requireLastUser && cleaned[cleaned.length - 1].role !== "user") return null;
  const total = cleaned.reduce((sum, message) => sum + message.content.length, 0);
  if (total > maxChars) return null;
  return cleaned;
}

export function jsonError(message: string, status: number, retryAfter?: number): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return new Response(JSON.stringify({ error: message }), { status, headers });
}

export async function readLimitedJson(
  request: Request,
  maxBytes = 64_000,
): Promise<unknown | Response> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return jsonError("Request is too large.", 413);
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  if (text.length > maxBytes) {
    return jsonError("Request is too large.", 413);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return jsonError("Invalid request.", 400);
  }
}
