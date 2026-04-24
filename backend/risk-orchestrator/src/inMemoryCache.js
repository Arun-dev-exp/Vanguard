/**
 * TTL-based in-memory cache.
 * Simple Map with automatic expiration — suitable for caching PRD-1 responses.
 * Designed as a drop-in that can be replaced with Redis later.
 */
class InMemoryCache {
  constructor(defaultTtlMs = 300_000) {
    this.store = new Map();
    this.defaultTtlMs = defaultTtlMs;

    // Periodic cleanup every 60s to prevent unbounded growth
    this._cleanupInterval = setInterval(() => this._cleanup(), 60_000);
    this._cleanupInterval.unref(); // Don't block process exit
  }

  /**
   * Get a cached value. Returns null if missing or expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value with optional TTL override.
   */
  set(key, value, ttlMs) {
    const ttl = ttlMs || this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Delete a specific key.
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all entries.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get cache stats.
   */
  stats() {
    return {
      size: this.store.size,
      defaultTtlMs: this.defaultTtlMs,
    };
  }

  /**
   * Remove all expired entries.
   */
  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the cache and clear the cleanup interval.
   */
  destroy() {
    clearInterval(this._cleanupInterval);
    this.store.clear();
  }
}

// Export singleton instance
const config = require('../config');
const cache = new InMemoryCache(config.cacheTtlMs);

module.exports = cache;
