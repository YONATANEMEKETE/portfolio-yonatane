import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { SocialCard } from './social-card';

describe('SocialCard', () => {
  it('opens external links in a new tab', () => {
    const html = renderToStaticMarkup(
      <SocialCard icon={null} label="X" href="https://x.com/Yonatanem2" />,
    );

    expect(html).toContain('href="https://x.com/Yonatanem2"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
  });

  it('keeps mailto links in the same tab', () => {
    const html = renderToStaticMarkup(
      <SocialCard icon={null} label="Email" href="mailto:a@b.com" />,
    );

    expect(html).toContain('href="mailto:a@b.com"');
    expect(html).not.toContain('target="_blank"');
  });

  it('renders a button carrying data attributes when there is no href', () => {
    const html = renderToStaticMarkup(
      <SocialCard
        icon={null}
        label="Book a Call"
        data-cal-namespace="30min"
        data-cal-link="yonatanem-2025-vpml3l/30min"
      />,
    );

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('data-cal-namespace="30min"');
    expect(html).toContain('data-cal-link="yonatanem-2025-vpml3l/30min"');
  });
});
