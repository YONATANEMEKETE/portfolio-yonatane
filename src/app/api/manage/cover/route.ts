import { NextResponse } from 'next/server';

import { requireSession } from '@/lib/auth';
import { presignCoverUpload } from '@/lib/r2';
import { COVER_MIME_TYPES, coverFileSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Same-origin upload route: avoids browser CORS response handling entirely. */
export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: 'Sign in to upload.' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const parsed = coverFileSchema.safeParse(file);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid image.' },
      { status: 400 },
    );
  }

  try {
    const { key, uploadUrl } = await presignCoverUpload({
      name: parsed.data.name,
      type: parsed.data.type as (typeof COVER_MIME_TYPES)[number],
    });
    const upload = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': parsed.data.type,
        'Content-Length': String(parsed.data.size),
      },
      body: Buffer.from(await parsed.data.arrayBuffer()),
      signal: AbortSignal.timeout(30_000),
    });
    if (!upload.ok) {
      return NextResponse.json(
        { error: `R2 rejected the upload (HTTP ${upload.status}).` },
        { status: 502 },
      );
    }
    return NextResponse.json({ key });
  } catch (error) {
    console.error('cover upload failed', error);
    return NextResponse.json({ error: 'Could not upload the image.' }, { status: 502 });
  }
}
