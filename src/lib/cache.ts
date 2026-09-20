/**
 * High-performance client-side in-memory and session cache
 * Provides in-flight request deduplication and Stale-While-Revalidate (SWR) support.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export const clientCache = {
  /**
   * Get an item from memory or sessionStorage
   */
  get<T>(key: string): T | null {
    const entry = memoryCache.get(key);
    if (entry) {
      if (Date.now() - entry.timestamp < entry.ttl) {
        return entry.data as T;
      }
      // Expired in memory
      memoryCache.delete(key);
    }

    // Try sessionStorage for cross-navigation retention
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem(`pcache_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored) as CacheEntry<T>;
          if (Date.now() - parsed.timestamp < parsed.ttl) {
            // Restore to memory
            memoryCache.set(key, parsed);
            return parsed.data;
          }
          window.sessionStorage.removeItem(`pcache_${key}`);
        }
      }
    } catch {
      // Ignore storage errors (private browsing quota, etc.)
    }

    return null;
  },

  /**
   * Store an item in memory and sessionStorage
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    memoryCache.set(key, entry);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`pcache_${key}`, JSON.stringify(entry));
      }
    } catch {
      // Ignore storage errors
    }
  },

  /**
   * Invalidate a single key or keys matching prefix
   */
  invalidate(keyOrPrefix: string): void {
    for (const k of memoryCache.keys()) {
      if (k === keyOrPrefix || k.startsWith(keyOrPrefix)) {
        memoryCache.delete(k);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
          const k = window.sessionStorage.key(i);
          if (k && (k === `pcache_${keyOrPrefix}` || k.startsWith(`pcache_${keyOrPrefix}`))) {
            window.sessionStorage.removeItem(k);
          }
        }
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Clear entire cache
   */
  clear(): void {
    memoryCache.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith('pcache_')) {
            window.sessionStorage.removeItem(k);
          }
        }
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Wrap an async fetcher with in-flight deduplication and caching
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 300000,
    forceRefresh = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = clientCache.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Deduplicate in-flight promises
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        if (result !== undefined && result !== null) {
          clientCache.set(key, result, ttlMs);
        }
        return result;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlightRequests.set(key, promise);
    return promise;
  },
};
