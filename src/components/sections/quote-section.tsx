import { Quote } from 'lucide-react';

/**
 * Quote section placed below the featured blogs.
 * Follows the Pencil home frame: quote icon, quote text, and centered author attribution.
 */
export function QuoteSection() {
  return (
    <section className="flex flex-col items-center gap-4 px-6 pt-16 pb-8 text-center sm:px-12">
      <Quote aria-hidden className="text-ghost size-8" />
      <blockquote className="text-ink-soft text-[22px] leading-[28px] font-normal italic">
        &ldquo;Talk is cheap. Show me the code.&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <span aria-hidden className="bg-ghost h-px w-10 shrink-0" />
        <cite className="text-muted-ink font-mono text-[12px] font-normal tracking-[2px] not-italic">
          LINUS TORVALDS
        </cite>
        <span aria-hidden className="bg-ghost h-px w-10 shrink-0" />
      </div>
    </section>
  );
}
