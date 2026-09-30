// Auth role of /manage: recovery emails + passcode.
import { getPrisma } from '@/lib/prisma';
import { RecoveryEmails } from '@/components/manage/recovery-emails';
import { PasscodeManager } from '@/components/manage/passcode-manager';

// The list reads live rows — without this, `next build` would prerender the
// page and freeze whatever the DB held at build time.
export const dynamic = 'force-dynamic';

async function loadRecoveryEmails() {
  return getPrisma().recipientEmail.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true },
  });
}

async function loadPasscodeUpdatedAt() {
  const config = await getPrisma().authConfig.findUnique({ where: { id: 1 } });

  return config?.updatedAt.toISOString() ?? null;
}

export default async function ManageAuthPage() {
  const [emails, passcodeUpdatedAt] = await Promise.all([
    loadRecoveryEmails(),
    loadPasscodeUpdatedAt(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">Auth</h1>
        <p className="text-muted-ink font-mono text-[14px]">Recovery emails and your passcode.</p>
      </div>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        <h2 className="text-ink text-[16px] font-medium">Recovery emails</h2>
        <p className="text-muted-ink mt-1 font-mono text-[13px]">
          Verified addresses you can receive a reset link at — max 5.
        </p>
        <RecoveryEmails initialEmails={emails} />
      </section>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        <h2 className="text-ink text-[16px] font-medium">Passcode</h2>
        <p className="text-muted-ink mt-1 font-mono text-[13px]">
          Change the passcode that unlocks /manage.
        </p>
        <PasscodeManager passcodeUpdatedAt={passcodeUpdatedAt} />
      </section>
    </div>
  );
}
