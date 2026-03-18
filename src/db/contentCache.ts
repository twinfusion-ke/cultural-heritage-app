/**
 * Content Cache — SQLite-backed offline content storage
 *
 * Caches API responses locally so the app works fully offline.
 * Each cache entry has a TTL; expired entries serve as stale fallback.
 */

import { getDatabase } from './database';

type ContentType = 'products' | 'categories' | 'posts' | 'pages' | 'exhibitions' | 'search';

/** Cache TTL in minutes */
const TTL: Record<ContentType, number> = {
  products: 60,        // 1 hour
  categories: 1440,    // 24 hours
  posts: 120,          // 2 hours
  pages: 1440,         // 24 hours
  exhibitions: 720,    // 12 hours
  search: 10,          // 10 minutes
};

function buildKey(site: string, type: ContentType, params?: string): string {
  return `${site}:${type}${params ? ':' + params : ''}`;
}

/** Store data in the cache */
export async function cacheSet(
  site: string,
  type: ContentType,
  data: any,
  params?: string
): Promise<void> {
  try {
    const db = await getDatabase();
    const key = buildKey(site, type, params);
    const ttlMinutes = TTL[type];
    const json = JSON.stringify(data);

    await db.runAsync(
      `INSERT OR REPLACE INTO content_cache (cache_key, site, content_type, data, cached_at, expires_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+${ttlMinutes} minutes'))`,
      key, site, type, json
    );
  } catch {}
}

/** Get data from cache. Returns null if not found.
 *  If allowExpired is true, returns stale data when nothing fresh is available. */
export async function cacheGet<T = any>(
  site: string,
  type: ContentType,
  params?: string,
  allowExpired: boolean = true
): Promise<{ data: T; fresh: boolean } | null> {
  try {
    const db = await getDatabase();
    const key = buildKey(site, type, params);

    // Try fresh first
    const fresh = await db.getFirstAsync<{ data: string }>(
      `SELECT data FROM content_cache WHERE cache_key = ? AND expires_at > datetime('now')`,
      key
    );

    if (fresh) {
      return { data: JSON.parse(fresh.data), fresh: true };
    }

    // Fall back to stale if allowed
    if (allowExpired) {
      const stale = await db.getFirstAsync<{ data: string }>(
        `SELECT data FROM content_cache WHERE cache_key = ? ORDER BY cached_at DESC LIMIT 1`,
        key
      );
      if (stale) {
        return { data: JSON.parse(stale.data), fresh: false };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/** Clear expired cache entries */
export async function cachePurgeExpired(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `DELETE FROM content_cache WHERE expires_at < datetime('now', '-7 days')`
    );
  } catch {}
}

/** Clear all cache for a specific site */
export async function cacheClearSite(site: string): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM content_cache WHERE site = ?`, site);
  } catch {}
}

/** Clear entire cache */
export async function cacheClearAll(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM content_cache`);
  } catch {}
}
