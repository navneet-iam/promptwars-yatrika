import { describe, it, expect } from 'vitest';
import { TtlCache } from '../lib/ttl-cache';

describe('TtlCache', () => {
  it('stores and retrieves values, returning null for misses', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('missing')).toBeNull();
  });

  it('expires entries once the ttl has elapsed', () => {
    let now = 0;
    const cache = new TtlCache<string>(100, () => now);
    cache.set('k', 'v');

    now = 50;
    expect(cache.get('k')).toBe('v');

    now = 150;
    expect(cache.get('k')).toBeNull();
  });

  it('clear() empties the cache', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('a', 1);
    cache.clear();
    expect(cache.get('a')).toBeNull();
  });
});
