import { NextResponse } from 'next/server';
import { initAndSeedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  const result = await initAndSeedDatabase(force);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: Request) {
  let force = false;
  try {
    const body = await request.json();
    force = Boolean(body.force);
  } catch {
    // ignore
  }
  const result = await initAndSeedDatabase(force);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
