import { NextResponse } from 'next/server';

import { requireSession } from '@/lib/auth';
import { articleImagePublicUrl, presignArticleImageUpload } from '@/lib/r2';
import { COVER_MIME_TYPES, coverFileSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const type = parsed.data.type as (typeof COVER_MIME_TYPES)[number];
    const { key, uploadUrl } = await presignArticleImageUpload({
      name: parsed.data.name,
      type,
    });
    const upload = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': type,
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
    return NextResponse.json({ url: articleImagePublicUrl(key) });
  } catch (error) {
    console.error('article image upload failed', error);
    return NextResponse.json({ error: 'Could not upload the image.' }, { status: 502 });
  }
}
