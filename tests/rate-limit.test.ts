import { describe, it, expect, beforeEach } from 'vitest';
import {
  rateLimit,
  resetRateLimit,
  clientKeyFromHeaders,
} from '../lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it('allows requests up to the limit, then blocks', () => {
    const opts = { limit: 3, windowMs: 60_000, now: () => 1_000 };

    expect(rateLimit('ip-1', opts).allowed).toBe(true);
    expect(rateLimit('ip-1', opts).allowed).toBe(true);
    const third = rateLimit('ip-1', opts);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = rateLimit('ip-1', opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAt).toBeGreaterThan(0);
  });

  it('tracks each client key independently', () => {
    const opts = { limit: 1, windowMs: 60_000, now: () => 5_000 };

    expect(rateLimit('ip-a', opts).allowed).toBe(true);
    expect(rateLimit('ip-a', opts).allowed).toBe(false);
    // A different client is unaffected.
    expect(rateLimit('ip-b', opts).allowed).toBe(true);
  });

  it('allows requests again once the window has elapsed', () => {
    let clock = 1_000;
    const opts = { limit: 1, windowMs: 1_000, now: () => clock };

    expect(rateLimit('ip-x', opts).allowed).toBe(true);
    expect(rateLimit('ip-x', opts).allowed).toBe(false);

    // Advance the clock beyond the window so old hits are pruned.
    clock = 2_500;
    expect(rateLimit('ip-x', opts).allowed).toBe(true);
  });
});

describe('clientKeyFromHeaders', () => {
  it('uses the left-most x-forwarded-for entry', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });
    expect(clientKeyFromHeaders(headers)).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip then to a shared anonymous bucket', () => {
    expect(
      clientKeyFromHeaders(new Headers({ 'x-real-ip': '198.51.100.2' })),
    ).toBe('198.51.100.2');
    expect(clientKeyFromHeaders(new Headers())).toBe('anonymous');
  });
});
