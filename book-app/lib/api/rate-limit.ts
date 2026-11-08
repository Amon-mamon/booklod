import { ApiError } from "./http";
import { createServiceClient, isServiceRoleConfigured } from "./service-client";

/**
 * Fixed-window rate limiter. Counts live in Supabase (public.rate_limit_hit) so
 * every Vercel instance shares them. The in-memory count is the fallback when
 * the service key is unset or the database call fails, so a database problem
 * doesn't lock everyone out.
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_KEYS = 10_000;

export interface RateLimitRule {
  /** Bucket name, e.g. "search". */
  name: string;
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  /** Open Library proxy: search + editions. */
  lookup: { name: "lookup", limit: 30, windowMs: 60_000 },
  /** Any state-changing request. */
  write: { name: "write", limit: 60, windowMs: 60_000 },
  /** Public, unauthenticated reads (shared shelves, plans, settings). */
  public: { name: "public", limit: 60, windowMs: 60_000 },
  /** Admin API. */
  admin: { name: "admin", limit: 120, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

function sweep(now: number) {
  if (windows.size < MAX_KEYS) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  // Still full (an attack with many keys): drop the oldest entries.
  if (windows.size >= MAX_KEYS) {
    const excess = windows.size - MAX_KEYS + 1000;
    let removed = 0;
    for (const key of windows.keys()) {
      windows.delete(key);
      if (++removed >= excess) break;
    }
  }
}

/**
 * Best-effort client IP. x-real-ip is set by the hosting proxy (e.g. Vercel);
 * otherwise use the LAST x-forwarded-for hop, which was added by our proxy.
 * The first hop is client-controlled and would let anyone dodge the limit.
 */
export function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1].slice(0, 64);
  }
  return "unknown";
}

function tooMany(seconds: number): ApiError {
  return new ApiError("rate_limited", `Too many requests. Try again in ${seconds} seconds.`);
}

/** Throws a 429 ApiError once `subject` passes the rule's limit for this window. */
export async function rateLimit(rule: RateLimitRule, subject: string, now = Date.now()): Promise<void> {
  if (isServiceRoleConfigured()) {
    const { data, error } = await createServiceClient().rpc("rate_limit_hit", {
      p_key: `${rule.name}:${subject}`,
      p_limit: rule.limit,
      p_window_ms: rule.windowMs,
    });
    if (!error && typeof data === "number") {
      if (data > 0) throw tooMany(data);
      return;
    }
    console.error("[api] rate_limit_hit failed, using the in-memory limit", error);
  }
  sweep(now);
  const key = `${rule.name}:${subject}`;
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  current.count += 1;
  if (current.count > rule.limit) {
    throw tooMany(Math.max(1, Math.ceil((current.resetAt - now) / 1000)));
  }
}

/** Test helper. */
export function resetRateLimits() {
  windows.clear();
}
