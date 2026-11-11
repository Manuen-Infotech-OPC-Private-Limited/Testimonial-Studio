/**
 * Lightweight fixed-window in-memory rate limiter for auth endpoints.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 10,
  keyGenerator,
  message = 'Too many requests. Please try again later.',
} = {}) {
  const buckets = new Map();

  // Periodically prune expired entries so memory remains bounded
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, Math.min(windowMs, 60 * 1000)).unref();

  return (req, res, next) => {
    const now = Date.now();
    const rawKey = keyGenerator ? keyGenerator(req) : req.ip || req.socket?.remoteAddress || 'unknown';
    const key = String(rawKey || 'unknown');

    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        error: message,
        retryAfterSeconds,
      });
    }

    next();
  };
}

