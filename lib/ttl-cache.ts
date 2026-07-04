// A tiny, dependency-free time-to-live cache. Best-effort and in-memory: on
// serverless it lives per warm instance, which is the right trade-off for a
// stateless MVP with no external store. Shared by the grounding lookup and the
// full-response cache so caching logic lives in exactly one place.
export class TtlCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    // Injectable clock keeps the cache deterministic under test.
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: this.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}
