'use client';

import { Highlighter } from '@/components/ui/highlighter';

/**
 * Phrases marked with `**bold**` render as a marker stroke rather than bold
 * weight — the shared treatment for project cards, experience bullets and the
 * project details page.
 *
 * rough-notation draws the line `padding` px below the element's line box, so
 * -4 lifts it off the 1.5 line-height gap and tucks it under the text.
 */
export function Emphasise({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part, index) =>
          part.startsWith('**') ? (
            <Highlighter key={index} action="underline" color="#8a8a93" padding={-4}>
              {part.slice(2, -2)}
            </Highlighter>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
    </>
  );
}
