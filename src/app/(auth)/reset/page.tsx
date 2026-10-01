// Reset passcode — step 2 of recovery (auth.md). Reached only from the emailed
// one-time link (?token=…); without a valid token this page is a dead end that
// funnels back to /forgot. Unprotected by design.
import type { Metadata } from 'next';
import Link from 'next/link';

import { findValidResetToken, INVALID_LINK_MESSAGE } from '@/lib/recovery';
import { ResetPasscodeForm } from '@/components/manage/reset-passcode-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reset passcode · Manage',
  robots: { index: false, follow: false },
};

export default async function ResetPage(props: PageProps<'/reset'>) {
  // Next types repeated params as string[]; ?token= is always single.
  const raw = (await props.searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const validToken = await findValidResetToken(token);

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">Reset passcode</h1>
        <p className="text-muted-ink font-mono text-[14px]">
          {validToken ? 'Choose a new passcode for /manage.' : INVALID_LINK_MESSAGE}
        </p>
      </div>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        {validToken && token ? (
          <ResetPasscodeForm token={token} />
        ) : (
          <Link
            href="/forgot"
            className="text-ink border-line-soft inline-block rounded-full border px-4 py-2 font-mono text-[13px] underline underline-offset-4 transition-colors hover:no-underline"
          >
            Request a new link
          </Link>
        )}
      </section>
    </div>
  );
}
