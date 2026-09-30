import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { findValidSession } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/session';
import { LoginForm } from '@/components/manage/login-form';

export const dynamic = 'force-dynamic';

// Already signed in? Skip the form — this is the only /manage page outside
// the guarded layout, so it does its own (identical) session check.
export default async function ManageLoginPage() {
  const cookieStore = await cookies();
  const session = await findValidSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (session) redirect('/manage');

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">Login</h1>
        <p className="text-muted-ink font-mono text-[14px]">
          Enter the passcode to unlock /manage.
        </p>
      </div>

      <section className="border-line-soft rounded-[16px] border bg-white p-5">
        <LoginForm />
      </section>
    </div>
  );
}
