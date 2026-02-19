import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { encode } from '@/lib/base62';

const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 31536000; // 1 year
const VALID_REDIRECT_TYPES = new Set(['301', '302', '308']);

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { originalUrl, customShortCode, ttl, redirectType } = body;

  if (!originalUrl || typeof originalUrl !== 'string') {
    return NextResponse.json({ error: 'Original URL is required' }, { status: 400 });
  }

  if (originalUrl.length > 2048) {
    return NextResponse.json({ error: 'URL is too long (max 2048 characters)' }, { status: 400 });
  }

  if (!isValidUrl(originalUrl)) {
    return NextResponse.json(
      { error: 'Invalid URL format. Must start with http:// or https://' },
      { status: 400 }
    );
  }

  if (customShortCode) {
    if (!/^[a-zA-Z0-9-]+$/.test(customShortCode)) {
      return NextResponse.json(
        { error: 'Short code can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }
    if (customShortCode.length > 20) {
      return NextResponse.json(
        { error: 'Short code must be 20 characters or fewer' },
        { status: 400 }
      );
    }
  }

  const resolvedRedirectType =
    redirectType && VALID_REDIRECT_TYPES.has(String(redirectType))
      ? String(redirectType)
      : '308';

  let ttlSeconds = null;
  if (ttl) {
    ttlSeconds = parseInt(ttl, 10);
    if (isNaN(ttlSeconds) || ttlSeconds < MIN_TTL_SECONDS) {
      return NextResponse.json(
        { error: `TTL must be at least ${MIN_TTL_SECONDS} seconds` },
        { status: 400 }
      );
    }
    if (ttlSeconds > MAX_TTL_SECONDS) {
      return NextResponse.json(
        { error: `TTL must not exceed 1 year (${MAX_TTL_SECONDS} seconds)` },
        { status: 400 }
      );
    }
  }

  try {
    let shortCode;

    if (customShortCode) {
      shortCode = customShortCode;
      // For custom codes, use SET NX to prevent overwriting existing links
      const urlValue = resolvedRedirectType === '302' ? `302|${originalUrl}` : originalUrl;
      const setOptions = ttlSeconds ? { nx: true, ex: ttlSeconds } : { nx: true };
      const result = await redis.set(`url:${shortCode}`, urlValue, setOptions);
      if (result === null) {
        return NextResponse.json({ error: 'Shortcode already exists' }, { status: 400 });
      }
    } else {
      // Atomically increment global counter and convert to Base62 — O(1), no collision checks
      const id = await redis.incr('global:url:id');
      shortCode = encode(id);
      const urlValue = resolvedRedirectType === '302' ? `302|${originalUrl}` : originalUrl;
      const setOptions = ttlSeconds ? { ex: ttlSeconds } : {};
      await redis.set(`url:${shortCode}`, urlValue, setOptions);
    }

    // Store metadata (non-blocking — for the tracking endpoint)
    const now = Date.now();
    const expiresTimestamp = ttlSeconds ? now + ttlSeconds * 1000 : null;
    const meta = {
      ca: new Date(now).toISOString(),
      t: expiresTimestamp,
      r: resolvedRedirectType,
    };
    const metaOptions = ttlSeconds ? { ex: ttlSeconds } : {};
    await redis.set(`meta:${shortCode}`, JSON.stringify(meta), metaOptions);

    return NextResponse.json({
      shortCode,
      originalUrl,
      expiresAt: expiresTimestamp ? new Date(expiresTimestamp).toISOString() : null,
    });
  } catch (err) {
    console.error('Error creating short URL:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
