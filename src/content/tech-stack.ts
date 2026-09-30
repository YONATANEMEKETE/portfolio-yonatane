import type { ExperienceTool } from '@/content/experience';

/**
 * The tech stack section's list, in deliberate order: language and framework,
 * then UI, then data and services, then platform and tooling.
 *
 * This repeats the icon paths that the experience entries already carry. That is
 * the point: the section is a curated claim about the stack as a whole, so it
 * gets to choose its own order and membership rather than being derived from
 * whichever roles happen to mention a tool.
 */
export const techStack: ExperienceTool[] = [
  { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
  { name: 'React', icon: '/logos/tools/react.svg' },
  { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
  { name: 'Vite', icon: '/logos/tools/vite.svg' },
  { name: 'Tailwind CSS', icon: '/logos/tools/tailwind-css.svg' },
  { name: 'shadcn/ui', icon: '/logos/tools/shadcn-ui.svg' },
  { name: 'Radix UI', icon: '/logos/tools/radix-ui.svg' },
  { name: 'Base UI', icon: '/logos/tools/base-ui.svg' },
  { name: 'TanStack Query', icon: '/logos/tools/tanstack-query.svg' },
  { name: 'TanStack Start', icon: '/logos/tools/tanstack-start.svg' },
  { name: 'React Hook Form', icon: '/logos/tools/react-hook-form.svg' },
  { name: 'Zod', icon: '/logos/tools/zod.svg' },
  { name: 'Figma', icon: '/logos/tools/figma.svg' },
  { name: 'Node.js', icon: '/logos/tools/node-js.svg' },
  { name: 'Express', icon: '/logos/tools/express.svg' },
  { name: 'NestJS', icon: '/logos/tools/nestjs.svg' },
  { name: 'Hono', icon: '/logos/tools/hono.svg' },
  { name: 'Bun', icon: '/logos/tools/bun.svg' },
  { name: 'REST API', icon: '/logos/tools/rest-api.svg' },
  { name: 'Prisma', icon: '/logos/tools/prisma.svg' },
  { name: 'PostgreSQL', icon: '/logos/tools/postgresql.svg' },
  { name: 'Redis', icon: '/logos/tools/redis.svg' },
  { name: 'Supabase', icon: '/logos/tools/supabase.svg' },
  { name: 'Better Auth', icon: '/logos/tools/better-auth.svg' },
  { name: 'Stripe', icon: '/logos/tools/stripe.svg' },
  { name: 'Resend', icon: '/logos/tools/resend.svg' },
  { name: 'i18next', icon: '/logos/tools/i18next.svg' },
  { name: 'cal.com', icon: '/logos/tools/cal-com.svg' },
  { name: 'S3', icon: '/logos/tools/amazon-s3.svg' },
  { name: 'Cloudflare', icon: '/logos/tools/cloudflare.svg' },
  { name: 'Docker', icon: '/logos/tools/docker.svg' },
  { name: 'Vercel', icon: '/logos/tools/vercel.svg' },
  { name: 'Turborepo', icon: '/logos/tools/turborepo.svg' },
  { name: 'Sentry', icon: '/logos/tools/sentry.svg' },
  { name: 'Linear', icon: '/logos/tools/linear.svg' },
];
