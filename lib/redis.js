import { Redis } from '@upstash/redis';

// Upstash Redis REST client — works in both Node.js serverless and Edge runtime
// because it communicates over HTTP fetch, not TCP sockets.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
