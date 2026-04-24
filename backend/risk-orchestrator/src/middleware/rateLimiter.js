const config = require('../config');

/**
 * In-memory sliding window rate limiter.
 * Limits requests per user_id to config.rateLimit.max within config.rateLimit.windowMs.
 */
const userWindows = new Map();

// Cleanup old entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userWindows) {
    const filtered = timestamps.filter((t) => now - t < config.rateLimit.windowMs);
    if (filtered.length === 0) {
      userWindows.delete(key);
    } else {
      userWindows.set(key, filtered);
    }
  }
}, 120_000).unref();

/**
 * Express middleware for rate limiting.
 * Extracts user_id from request body.
 */
function rateLimiter(req, res, next) {
  const userId = req.body?.user_id;
  if (!userId) {
    return next(); // Skip rate limiting if no user_id
  }

  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;

  // Get or create the sliding window
  let timestamps = userWindows.get(userId) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= config.rateLimit.max) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Maximum ${config.rateLimit.max} payment checks per minute per user.`,
      retry_after_ms: config.rateLimit.windowMs - (now - timestamps[0]),
    });
  }

  timestamps.push(now);
  userWindows.set(userId, timestamps);

  next();
}

module.exports = rateLimiter;
