import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';

/**
 * Top bar shared by both /manage layouts — the guarded (private) one passes
 * `<ManageTabs />` as `actions`, the login layout passes nothing. Same mono +
 * status-dot line as the bio section: the private area speaks in the home
 * page's voice without the full cloudscape banner.
 */
export function ManageHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="border-line-soft bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <p className="text-muted-ink flex items-center gap-2 font-mono text-[14px]">
            <span aria-hidden className="bg-success size-2 rounded-full" />
            Manage
          </p>
          {actions}
        </div>
      </Container>
    </header>
  );
}
