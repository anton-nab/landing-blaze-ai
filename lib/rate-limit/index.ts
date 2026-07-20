import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

// 1 free audit per rolling 30 days per IP (roadmap: "1 audit/mois anonyme").
// Cache hits (same URL < 24h) never reach this — see route.ts ordering.
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LIMIT = 1;

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) return upstashLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashLimiter = null;
    return null;
  }

  upstashLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(LIMIT, "30 d"),
    prefix: "landingblaze:audit",
  });
  return upstashLimiter;
}

// Dev-only in-memory fallback (per-process, resets on restart) — same
// degrade-gracefully pattern as lib/audit/store.ts until Upstash is configured.
const g = globalThis as unknown as { __rateLimitStore?: Map<string, number[]> };
if (!g.__rateLimitStore) g.__rateLimitStore = new Map();
const memoryStore = g.__rateLimitStore;

function checkInMemory(key: string): RateLimitResult {
  const now = Date.now();
  const hits = (memoryStore.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= LIMIT) {
    memoryStore.set(key, hits);
    return { success: false, remaining: 0, resetAt: hits[0] + WINDOW_MS };
  }

  hits.push(now);
  memoryStore.set(key, hits);
  return { success: true, remaining: LIMIT - hits.length, resetAt: now + WINDOW_MS };
}

export async function checkAuditRateLimit(key: string): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter();
  if (!limiter) return checkInMemory(key);

  const { success, remaining, reset } = await limiter.limit(key);
  return { success, remaining, resetAt: reset };
}
