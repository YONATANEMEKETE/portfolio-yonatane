import { NextResponse } from 'next/server';

import { getViewCount, recordPageView } from '@/lib/views';

// `pg` needs TCP, and a GET handler that touches no dynamic API would otherwise
// be prerendered, freezing the count at build time.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizePath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') ? value.slice(0, 256) : '/';
}

function failure(error: unknown) {
  console.error('View count request failed', error);

  return NextResponse.json({ count: null }, { status: 503 });
}

export async function GET() {
  try {
    return NextResponse.json({ count: await getViewCount() });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;

  try {
    await recordPageView(normalizePath(body?.path));

    return NextResponse.json({ count: await getViewCount() });
  } catch (error) {
    return failure(error);
  }
}
