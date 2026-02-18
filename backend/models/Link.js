const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const LINK_PREFIX = 'link:';

/**
 * Create a new shortened link in Redis.
 * Stores as a hash: link:{shortCode} -> { originalUrl, clickCount }
 */
async function createLink(shortCode, originalUrl) {
  const key = `${LINK_PREFIX}${shortCode}`;
  const exists = await redis.exists(key);
  if (exists) {
    return null; // shortCode already taken
  }
  await redis.hset(key, { originalUrl, clickCount: 0 });
  return { shortCode, originalUrl, clickCount: 0 };
}

/**
 * Find a link by its shortCode.
 */
async function findByShortCode(shortCode) {
  const key = `${LINK_PREFIX}${shortCode}`;
  const data = await redis.hgetall(key);
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  return {
    shortCode,
    originalUrl: data.originalUrl,
    clickCount: Number(data.clickCount) || 0,
  };
}

/**
 * Increment the click count for a link.
 */
async function incrementClickCount(shortCode) {
  const key = `${LINK_PREFIX}${shortCode}`;
  return redis.hincrby(key, 'clickCount', 1);
}

module.exports = {
  createLink,
  findByShortCode,
  incrementClickCount,
};
