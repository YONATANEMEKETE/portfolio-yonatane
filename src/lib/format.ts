/**
 * Kept free of database imports so client components can use it without
 * pulling Prisma (and `pg`) into the browser bundle.
 */
export function formatViewCount(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}
