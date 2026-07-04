import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchDestinationGrounding,
  clearGroundingCache,
  readGroundingCache,
} from '../lib/destination-source';

describe('grounding cache', () => {
  beforeEach(() => {
    clearGroundingCache();
    vi.restoreAllMocks();
  });

  const searchResp = [
    'Rome',
    ['Rome'],
    ['Rome is the capital of Italy.'],
    ['https://en.wikipedia.org/wiki/Rome'],
  ];
  const summaryResp = { title: 'Rome', extract: 'Rome is the capital of Italy.' };

  it('caches a successful lookup and avoids a second network round-trip', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => searchResp })
      .mockResolvedValueOnce({ ok: true, json: async () => summaryResp });
    global.fetch = fetchMock as unknown as typeof fetch;

    const first = await fetchDestinationGrounding('Rome');
    expect(first.source).toBe('wikipedia');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Second call is served from cache: no additional network calls.
    const second = await fetchDestinationGrounding('Rome');
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // The cache key is normalized (trimmed + lower-cased).
    expect(readGroundingCache('  rome ')).not.toBeNull();
  });

  it('does not cache a fallback (no-results) response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ['x', [], [], []] });
    global.fetch = fetchMock as unknown as typeof fetch;

    const first = await fetchDestinationGrounding('Zzxq-Nowhere');
    expect(first.source).toBe('fallback');
    expect(readGroundingCache('Zzxq-Nowhere')).toBeNull();

    // A subsequent call retries the network because fallbacks are not cached.
    await fetchDestinationGrounding('Zzxq-Nowhere');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
