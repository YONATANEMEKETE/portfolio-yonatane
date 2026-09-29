'use client';

import { useEffect, type ReactNode } from 'react';
import { getCalApi } from '@calcom/embed-react';

import { SocialCard } from '@/components/sections/social-card';

// Cal.com event, opened as a modal over the site rather than a new tab. The data
// attributes below are what the embed listens for; the effect only registers the
// namespace and the UI options.
const namespace = '30min';
const calLink = 'yonatanem-2025-vpml3l/30min';
const calConfig = JSON.stringify({
  layout: 'month_view',
  useSlotsViewOnSmallScreen: 'true',
});

export function BookCall({ icon }: { icon: ReactNode }) {
  useEffect(() => {
    void (async () => {
      const cal = await getCalApi({ namespace });

      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  return (
    <SocialCard
      icon={icon}
      label="Book a Call"
      data-cal-namespace={namespace}
      data-cal-link={calLink}
      data-cal-config={calConfig}
    />
  );
}
