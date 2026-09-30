import { cn } from '@/lib/utils';

// Hand-drawn arrow from the design: tail at the top right, tip dipping down-left
// onto whatever sits beside the note. One path, shared by the home contact note
// and the project details share note, so the two always match.
//
// Geometry for positioning: the container is 25px of label + an 80px arrow, and
// the tip sits 64px into the arrow. A caller places the tip on its target with
// `top: target_y - 89px`, exactly as the design lays the contact note on the
// social row.
const arrow =
  'M135 6c-20 4-35 12-39 24-3 10-14 14-20 9-6-5-2-13 6-12 12 2 14 17 2 28-10 9-44 13-74 9m0 0l10-4m-10 4l7-9';

type HandNoteProps = {
  /** The hand-written words, e.g. "Contact me". */
  label: string;
  /** Positions the note: gutter offsets and the tip alignment. */
  className?: string;
};

/** Decorative gutter note; hidden until there is room for the right gutter. */
export function HandNote({ label, className }: HandNoteProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'text-muted-ink pointer-events-none absolute hidden w-[150px] flex-col items-end xl:flex',
        className,
      )}
    >
      <span className="font-hand text-[20px] leading-[25px]">{label}</span>
      <svg
        viewBox="0 0 150 80"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-20 w-[150px]"
      >
        <path d={arrow} />
      </svg>
    </div>
  );
}
