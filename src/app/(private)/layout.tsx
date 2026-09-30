import type { Metadata } from 'next';

import { Container } from '@/components/layout/container';
import { ManageTabs } from '@/components/manage/manage-tabs';

// Private area (/manage): noindex — it must never appear in search results.
// The full sidebar layout lands in M6; for now it's a slim top bar + tabs.
export const metadata: Metadata = {
  title: 'Manage',
  robots: { index: false, follow: false },
};

export default function ManageLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="pb-16">
      <header className="border-line-soft bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <Container>
          <div className="flex items-center justify-between gap-4 py-4">
            {/* Same mono + status dot line as the bio section — keeps the private
                area in the home page's voice without the full cloudscape banner. */}
            <p className="text-muted-ink flex items-center gap-2 font-mono text-[14px]">
              <span aria-hidden className="bg-success size-2 rounded-full" />
              Manage
            </p>
            <ManageTabs />
          </div>
        </Container>
      </header>
      <Container className="pt-10">{children}</Container>
    </div>
  );
}
