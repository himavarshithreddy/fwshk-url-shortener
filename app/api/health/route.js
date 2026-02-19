import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    await redis.ping();
    return NextResponse.json({
      status: 'healthy',
      redis: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: 'degraded', redis: 'disconnected', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
