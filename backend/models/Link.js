const { Redis } = require('@upstash/redis');

let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (err) {
  console.error('Failed to initialize Redis client:', err.message);
}

const LINK_PREFIX = 'link:';

/**
 * Check if Redis is available by performing a ping.
 */
async function checkRedisConnection() {
  if (!redis) {
    return false;
  }
  try {
    await redis.ping();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Create a new shortened link in Redis.
 * Stores as a hash: link:{shortCode} -> { originalUrl, clickCount, createdAt, expiresAt }
 * @param {string} shortCode
 * @param {string} originalUrl
 * @param {number|null} ttlSeconds - Optional TTL in seconds for link expiration
 */
async function createLink(shortCode, originalUrl, ttlSeconds = null) {
  if (!redis) {
    throw new Error('Redis connection is not available');
  }
  const key = `${LINK_PREFIX}${shortCode}`;
  const exists = await redis.exists(key);
  if (exists) {
    return null; // shortCode already taken
  }

  const createdAt = new Date().toISOString();
  const fields = { originalUrl, clickCount: 0, createdAt };

  if (ttlSeconds && ttlSeconds > 0) {
    fields.expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  }

  await redis.hset(key, fields);

  if (ttlSeconds && ttlSeconds > 0) {
    await redis.expire(key, ttlSeconds);
  }

  return { shortCode, originalUrl, clickCount: 0, createdAt, expiresAt: fields.expiresAt || null };
}

/**
 * Find a link by its shortCode.
 */
async function findByShortCode(shortCode) {
  if (!redis) {
    throw new Error('Redis connection is not available');
  }
  const key = `${LINK_PREFIX}${shortCode}`;
  const data = await redis.hgetall(key);
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  return {
    shortCode,
    originalUrl: data.originalUrl,
    clickCount: Number(data.clickCount) || 0,
    createdAt: data.createdAt || null,
    expiresAt: data.expiresAt || null,
  };
}

/**
 * Increment the click count for a link.
 */
async function incrementClickCount(shortCode) {
  if (!redis) {
    throw new Error('Redis connection is not available');
  }
  const key = `${LINK_PREFIX}${shortCode}`;
  return redis.hincrby(key, 'clickCount', 1);
}

module.exports = {
  createLink,
  findByShortCode,
  incrementClickCount,
  checkRedisConnection,
};
