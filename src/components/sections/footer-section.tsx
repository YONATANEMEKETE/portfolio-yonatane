/**
 * Footer section at the bottom of the home page.
 * Follows the Pencil frame: 1px separator, byline, copyright notice, and live location indicator.
 */
export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full">
      <div aria-hidden className="h-px w-full bg-[#e5e5e8]" />

      <div className="flex flex-col items-center gap-2 pt-8 pb-12 text-center">
        <p className="flex items-center gap-1.5 text-[15px] leading-snug">
          <span className="text-body font-normal">Designed &amp; Developed by</span>
          <span className="text-ink font-bold">Yonatane Mekete</span>
        </p>

        <p className="text-faint font-mono text-[13px] leading-snug">
          &copy; {currentYear} All rights reserved.
        </p>

        <p className="flex items-center gap-1.5 font-mono text-[13px] leading-snug">
          <span aria-hidden className="bg-success size-2 shrink-0 rounded-full" />
          <span className="text-muted-ink">Ethiopia, Addis Ababa</span>
        </p>
      </div>
    </footer>
  );
}

export { FooterSection as Footer };
