// Minimal in-memory sliding-window rate limiter used as a lightweight anti-abuse
// guard on the generation endpoint. It intentionally has zero dependencies and no
// external store: on serverless it is best-effort per warm instance, which is an
// appropriate guard for a stateless MVP (documented as such in the README).

import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './constants';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when the caller may retry, present only when blocked. */
  retryAt?: number;
}

interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit?: number;
  /** Sliding window size in milliseconds. */
  windowMs?: number;
  /** Injectable clock for deterministic testing. */
  now?: () => number;
}

const buckets = new Map<string, number[]>();

/**
 * Records a hit for `key` and reports whether it is within the allowed rate.
 * Uses a rolling list of hit timestamps, pruned to the active window on each call.
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? RATE_LIMIT_MAX;
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const now = options.now ? options.now() : Date.now();
  const windowStart = now - windowMs;

  const hits = (buckets.get(key) ?? []).filter((ts) => ts > windowStart);

  if (hits.length >= limit) {
    // Blocked: do not record this hit so a hammering client cannot push the
    // retry window forward indefinitely.
    buckets.set(key, hits);
    const oldest = hits[0];
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAt: oldest + windowMs,
    };
  }

  hits.push(now);
  buckets.set(key, hits);
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - hits.length),
  };
}

/** Clears all rate-limit state. Exposed for deterministic testing. */
export function resetRateLimit(): void {
  buckets.clear();
}

/**
 * Extracts a best-effort client identifier from proxy headers. Falls back to a
 * shared bucket when no forwarding header is present (e.g. local development).
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // The left-most entry is the original client.
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip')?.trim() || 'anonymous';
}
