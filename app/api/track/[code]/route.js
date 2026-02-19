import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(request, { params }) {
  const { code } = await params;

  if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  try {
    const pipeline = redis.pipeline();
    pipeline.get(`url:${code}`);
    pipeline.get(`meta:${code}`);
    pipeline.get(`clicks:${code}`);
    const [url, rawMeta, clicks] = await pipeline.exec();

    if (!url) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Strip the optional redirect-type prefix (e.g. "302|https://...") to return the clean URL
    const rawUrl = String(url);
    const originalUrl = rawUrl.startsWith('302|') ? rawUrl.slice(4) : rawUrl;

    const meta = rawMeta
      ? typeof rawMeta === 'string'
        ? JSON.parse(rawMeta)
        : rawMeta
      : {};

    return NextResponse.json({
      originalUrl,
      shortCode: code,
      clicks: Number(clicks) || 0,
      createdAt: meta.ca || null,
      expiresAt: meta.t ? new Date(meta.t).toISOString() : null,
    });
  } catch (err) {
    console.error('Error tracking clicks:', err.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
