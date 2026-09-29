/**
 * Experience content — static data, edited as a commit rather than through
 * /manage. Each entry renders as a collapsed card that expands into the tools
 * row and the "what I've done" bullets.
 */

export type ExperienceTool = {
  name: string;
  /**
   * Icon path under /public (e.g. '/logos/tools/react.svg'). Rendered as a
   * monogram tile when absent, so a missing asset degrades instead of breaking.
   */
  icon?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  /** Company mark under /public. Falls back to a monogram tile when absent. */
  logo?: string;
  location: string;
  /** 'Mon YYYY'. */
  start: string;
  /** 'Mon YYYY', or 'Present' while the role is ongoing. */
  end: string;
  tools: ExperienceTool[];
  /** Rendered as markdown bullets, one line each. */
  done: string[];
};

export const experiences: Experience[] = [
  {
    id: 'ablaze-labs',
    company: 'Ablaze Labs',
    role: 'Frontend Developer',
    logo: '/logos/ablaze-labs.png',
    location: 'Addis Ababa',
    start: 'Oct 2024',
    end: 'Jan 2025',
    tools: [
      { name: 'React', icon: '/logos/tools/react.svg' },
      { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
      { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
      { name: 'REST API', icon: '/logos/tools/rest-api.svg' },
      { name: 'Figma', icon: '/logos/tools/figma.svg' },
    ],
    done: [
      'Built and maintained a **multilingual government platform** with React and Next.js.',
      'Made **accessibility, responsiveness and clarity** the baseline for a platform serving diverse user groups.',
      'Integrated **API-driven content systems** so the platform could be updated dynamically instead of through redeploys.',
      'Worked with designers and stakeholders in **short feedback loops** to refine the user experience.',
    ],
  },
  {
    id: 'zulu-tech',
    company: 'Zulu Tech',
    role: 'Senior Frontend Engineer',
    logo: '/logos/zulu-tech.png',
    location: 'Remote',
    start: 'Jan 2025',
    end: 'Oct 2025',
    tools: [
      { name: 'React', icon: '/logos/tools/react.svg' },
      { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
      { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
      { name: 'Tailwind CSS', icon: '/logos/tools/tailwind-css.svg' },
      { name: 'shadcn/ui', icon: '/logos/tools/shadcn-ui.svg' },
      { name: 'REST API', icon: '/logos/tools/rest-api.svg' },
      { name: 'Figma', icon: '/logos/tools/figma.svg' },
    ],
    done: [
      'Owned **frontend architecture and product implementation** for a large-scale web application built with Next.js, TypeScript and shadcn/ui.',
      'Partnered with product managers to turn **roadmap features into scalable frontend systems**.',
      'Designed a **reusable component architecture** that lifted development velocity and kept the interface consistent as the product grew.',
    ],
  },
  {
    id: 'blih-senior-frontend',
    company: 'Blih Tech',
    role: 'Senior Frontend Engineer',
    logo: '/logos/blih-tech.png',
    location: 'Addis Ababa',
    start: 'Nov 2025',
    end: 'Feb 2026',
    tools: [
      { name: 'React', icon: '/logos/tools/react.svg' },
      { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
      { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
      { name: 'Tailwind CSS', icon: '/logos/tools/tailwind-css.svg' },
      { name: 'shadcn/ui', icon: '/logos/tools/shadcn-ui.svg' },
      { name: 'TanStack Query', icon: '/logos/tools/tanstack-query.svg' },
      { name: 'REST API', icon: '/logos/tools/rest-api.svg' },
      { name: 'Vercel', icon: '/logos/tools/vercel.svg' },
      { name: 'Figma', icon: '/logos/tools/figma.svg' },
      { name: 'Linear', icon: '/logos/tools/linear.svg' },
    ],
    done: [
      'Led **frontend architecture and delivery across three products**: the Lionstone Distribution website, the BlihOps website and the BLIH System platform.',
      'Built and shipped **Next.js 16 + React 19 applications** with TypeScript and Tailwind CSS for marketing, lead intake and admin workflows.',
      'Led the frontend work of two developers, owning **technical direction, conventions and review** for the work they shipped.',
      'Designed a **reusable component system** that improved consistency and accelerated feature delivery across multiple codebases.',
    ],
  },
  {
    id: 'blih-fullstack',
    company: 'Blih Tech',
    role: 'Full-Stack TypeScript Engineer',
    logo: '/logos/blih-tech.png',
    location: 'Addis Ababa',
    start: 'Mar 2026',
    end: 'Sep 2026',
    tools: [
      { name: 'React', icon: '/logos/tools/react.svg' },
      { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
      { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
      { name: 'Tailwind CSS', icon: '/logos/tools/tailwind-css.svg' },
      { name: 'shadcn/ui', icon: '/logos/tools/shadcn-ui.svg' },
      { name: 'TanStack Query', icon: '/logos/tools/tanstack-query.svg' },
      { name: 'React Hook Form', icon: '/logos/tools/react-hook-form.svg' },
      { name: 'Zod', icon: '/logos/tools/zod.svg' },
      { name: 'Prisma', icon: '/logos/tools/prisma.svg' },
      { name: 'PostgreSQL', icon: '/logos/tools/postgresql.svg' },
      { name: 'REST API', icon: '/logos/tools/rest-api.svg' },
      { name: 'Better Auth', icon: '/logos/tools/better-auth.svg' },
      { name: 'Resend', icon: '/logos/tools/resend.svg' },
      { name: 'i18next', icon: '/logos/tools/i18next.svg' },
      { name: 'S3', icon: '/logos/tools/amazon-s3.svg' },
      { name: 'Docker', icon: '/logos/tools/docker.svg' },
      { name: 'Sentry', icon: '/logos/tools/sentry.svg' },
      { name: 'Vercel', icon: '/logos/tools/vercel.svg' },
      { name: 'cal.com', icon: '/logos/tools/cal-com.svg' },
      { name: 'Figma', icon: '/logos/tools/figma.svg' },
      { name: 'Linear', icon: '/logos/tools/linear.svg' },
    ],
    done: [
      "Designed and built the company's **internal outsourcing pipeline** end to end, connecting pilot requests, client-specific workspaces and the contract flow that client onboarding ran on.",
      'Built the **pilot system** solo: a client requests a pilot, the platform provisions a client-specific workspace, and Blih runs the pilot with assigned talent through to contract.',
      'Contributed to the **skills platform**, the learning management system where local talent completes courses to become outsourcing-ready.',
      'Contributed to the **talent platform**, the marketplace where Blih-vetted engineers are listed and international companies filter, shortlist and contact them.',
      'Owned the work **full-stack**, from React and TypeScript frontends through the API layer, Prisma/Postgres data access and containerized deployment.',
    ],
  },
];
