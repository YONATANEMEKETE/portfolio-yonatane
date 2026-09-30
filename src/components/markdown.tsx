import { cn } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';

import { ProseAnnotations } from '@/components/prose-annotations';

type MarkdownProps = {
  /** Markdown source: a content file body, or `Article.body` from the database. */
  source: string;
  className?: string;
};

/**
 * The one renderer. Styling lives in the `.prose` theme in globals.css, so a
 * caller changes how content looks by passing size/weight utilities here — not
 * by restyling individual pages.
 */
export async function Markdown({ source, className }: MarkdownProps) {
  const html = await renderMarkdown(source);

  return (
    <ProseAnnotations>
      <div
        // Content is authored in-repo and sanitized by the pipeline before it is
        // stringified, so nothing untrusted reaches the DOM here.
        dangerouslySetInnerHTML={{ __html: html }}
        // "prose" ships a 65ch measure; the site's column already sets the width,
        // and callers can pass their own max-width utility if they want one.
        className={cn('prose max-w-none', className)}
      />
    </ProseAnnotations>
  );
}
