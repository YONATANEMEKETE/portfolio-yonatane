import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { findValidSession } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/session';
import { Container } from '@/components/layout/container';
import { ManageHeader } from '@/components/manage/manage-header';
import { ManageTabs } from '@/components/manage/manage-tabs';

// Private area (/manage): noindex — it must never appear in search results.
// The full sidebar layout lands in M6; for now it's a slim top bar + tabs.
export const metadata: Metadata = {
  title: 'Manage',
  robots: { index: false, follow: false },
};

// Real gate for every /manage route. proxy.ts already bounces cookie-less
// requests to the login page early (optimistic check); here the token is
// actually verified — sha256 → Session row → not expired — so a forged cookie
// still ends at /manage/login.
export default async function ManageLayout({ children }: LayoutProps<'/'>) {
  const cookieStore = await cookies();
  const session = await findValidSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) redirect('/manage/login');

  return (
    <div className="pb-16">
      <ManageHeader actions={<ManageTabs />} />
      <Container className="pt-10">{children}</Container>
    </div>
  );
}
