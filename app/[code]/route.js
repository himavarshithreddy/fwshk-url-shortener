import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Run this route handler at the Vercel Edge Network, not in a regional
// serverless function.  Edge runtime uses persistent HTTP connections to
// Upstash's nearest PoP, eliminating cold-start and region-mismatch latency.
// Typical latency: 10–40 ms globally.
export const runtime = 'edge';

// Instantiate the client inline so the module is self-contained and
// stateless — required for edge functions.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request, { params }) {
  const { code } = await params;

  // Reject obviously invalid codes before any I/O
  if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Primary lookup: url:{code} → value
  // Value format: plain URL string for permanent (301), or "302|<url>" for tracking redirects
  const raw = await redis.get(`url:${code}`);

  if (!raw) {
    return new NextResponse('Link not found', { status: 404 });
  }

  const rawStr = String(raw);
  let status = 301;
  let targetUrl = rawStr;

  // Compact type prefix: "302|https://..." enables tracking mode without an extra Redis lookup
  if (rawStr.startsWith('302|')) {
    status = 302;
    targetUrl = rawStr.slice(4);
  }

  const cacheControl = status === 302 ? 'no-store' : 'public, max-age=3600';

  return NextResponse.redirect(targetUrl, {
    status,
    headers: { 'Cache-Control': cacheControl },
  });
}
