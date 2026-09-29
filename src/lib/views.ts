import { getPrisma } from '@/lib/prisma';

/** One row per page load. */
export async function recordPageView(path: string) {
  await getPrisma().pageView.create({ data: { path } });
}

export async function getViewCount() {
  return getPrisma().pageView.count();
}
