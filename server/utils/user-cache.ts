/**
 * Lightweight in-memory TTL cache for Neon-backed user profiles.
 * Avoids a database round-trip on every authenticated request.
 */

const USER_CACHE_TTL_MS = 60_000; // 60 seconds

const _cache = new Map<string, { data: any; expiresAt: number }>();

export function getCachedUser(userId: string): any | null {
  const entry = _cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(userId);
    return null;
  }
  return entry.data;
}

export function setCachedUser(userId: string, data: any): void {
  _cache.set(userId, { data, expiresAt: Date.now() + USER_CACHE_TTL_MS });
}

/** Call this after a role/status update so the next request re-fetches from Neon. */
export function invalidateCachedUser(userId: string): void {
  _cache.delete(userId);
}
