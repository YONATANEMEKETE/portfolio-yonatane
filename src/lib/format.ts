/**
 * Kept free of database imports so client components can use it without
 * pulling Prisma (and `pg`) into the browser bundle.
 */
export function formatViewCount(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}

/** "Mar 2026" — the card meta voice from the Pencil design (short month + year). */
export function formatArticleDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Words in a Tiptap (ProseMirror) JSON body. Walks `text` leaves only, so
 * marks, attrs and non-text nodes (images, dividers) never inflate the count.
 */
export function countBodyWords(body: unknown) {
  let words = 0;

  function visit(node: unknown) {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') {
      words += record.text.split(/\s+/).filter(Boolean).length;
    }
    for (const value of Object.values(record)) {
      if (value !== null && typeof value === 'object') visit(value);
    }
  }

  visit(body);
  return words;
}

/**
 * "9 min read" — 200 wpm, minimum 1 minute. The design always shows a meta
 * line, so even an empty body reads "1 min read" rather than nothing.
 */
export function formatReadTime(body: unknown) {
  const minutes = Math.max(1, Math.ceil(countBodyWords(body) / 200));
  return `${minutes} min read`;
}
