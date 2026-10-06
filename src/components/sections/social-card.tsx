import { forwardRef, type ReactNode } from 'react';

/** Lets callers attach data attributes (e.g. the cal.com embed's) to the tile. */
type DataAttributes = Record<`data-${string}`, string | undefined>;

export type SocialCardProps = {
  icon: ReactNode;
  label: string;
  /** Omit (or leave empty) until the real link is known. */
  href?: string;
  /** For actions instead of navigation, e.g. opening the cal.com dialog. */
  onClick?: () => void;
} & DataAttributes;

export const SocialCard = forwardRef<HTMLAnchorElement | HTMLButtonElement, SocialCardProps>(
  function SocialCard({ icon, label, href, onClick, ...rest }, ref) {
    const className =
      'border-line text-ink-soft from-tile-start to-tile-end hover:from-[#fcfcfe] hover:to-[#e7e7ed] flex shrink-0 items-center gap-2 rounded-[10px] border bg-linear-to-b px-3 py-[7px] text-[13px] leading-4 font-medium transition-colors hover:border-ghost focus-visible:ring-ink/30 focus-visible:ring-2 focus-visible:outline-none';

    // No destination yet: render the same tile as a plain button so the row keeps
    // its shape and nothing navigates to an empty href.
    if (!href) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          className={className}
          {...rest}
        >
          {icon}
          {label}
        </button>
      );
    }

    // Email opens the mail client, so it is the one link that should not get
    // target="_blank" (which would leave a stray empty tab behind).
    const linkProps = href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        {...linkProps}
        className={className}
        {...rest}
      >
        {icon}
        {label}
      </a>
    );
  },
);
