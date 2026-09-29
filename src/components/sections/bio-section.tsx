// Copy lives here until the content is wired to real data.
const bio = {
  statement: 'I ship. TypeScript across the whole stack, no excuses.',
  currently: 'Based in Addis Ababa (UTC+3) · working worldwide.',
};

export function BioSection() {
  return (
    <section className="flex flex-col gap-2.5 pt-7">
      <p className="text-ink text-[32px] leading-[39px] font-bold">{bio.statement}</p>

      <p className="text-muted-ink flex items-center gap-2 font-mono text-[14px] leading-[18px]">
        <span aria-hidden className="bg-success size-2 shrink-0 rounded-full" />
        {bio.currently}
      </p>
    </section>
  );
}
