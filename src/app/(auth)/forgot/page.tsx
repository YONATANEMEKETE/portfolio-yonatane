// Forgot passcode — step 1 of recovery (auth.md). Unprotected by design: the
// picker shows only server-masked hints, and everything below runs logged-out.
import type { Metadata } from 'next';

import { getPrisma } from '@/lib/prisma';
import { maskEmail } from '@/lib/recovery';
import { ResetRequestForm } from '@/components/manage/reset-request-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Forgot passcode · Manage',
  robots: { index: false, follow: false },
};

async function loadMaskedEmails() {
  const rows = await getPrisma().recipientEmail.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true },
  });

  // Masking happens here, on the server — the client component only receives
  // { id, masked } pairs; raw addresses never leave the server (auth.md).
  return rows.map((row) => ({ id: row.id, masked: maskEmail(row.email) }));
}

export default async function ForgotPage() {
  const emails = await loadMaskedEmails();

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">Forgot passcode</h1>
        <p className="text-muted-ink font-mono text-[14px]">
          Pick an address to receive a one-time reset link.
        </p>
      </div>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        {emails.length === 0 ? (
          <p className="text-muted-ink font-mono text-[13px] leading-relaxed">
            No recovery addresses yet. Log in and add one under /manage/auth — or run{' '}
            <code className="text-ink">pnpm set-passcode</code> if you&apos;re fully locked out.
          </p>
        ) : (
          <ResetRequestForm emails={emails} />
        )}
      </section>
    </div>
  );
}
