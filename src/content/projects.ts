/**
 * Project content — static data, edited as a commit rather than through /manage.
 * Each entry renders as one card in the "Showcase of my work" grid, and later as
 * the project details page at /projects/<slug>.
 *
 * Card fields only for now. Details-page fields (years, role, lead, body
 * markdown) are added separately.
 */

/** Drives the status dot in the card title row: 'building' is amber, 'live' is green. */
export type ProjectStatus = 'building' | 'live';

export type ProjectTool = {
  name: string;
  /**
   * Icon path under /public (e.g. '/logos/tools/react.svg'). Rendered as a
   * monogram tile when absent, so a missing asset degrades instead of breaking.
   */
  icon?: string;
};

export type Project = {
  /** Route segment for /projects/<slug> and the details page lookup key. */
  slug: string;
  name: string;
  status: ProjectStatus;
  /** The line under the title. Keep it near 45 characters so it stays on one line. `**bold**` renders as a wave underline. */
  tagline: string;
  /** Two to three lines in the card (roughly 180 characters). `**bold**` renders as a wave underline. */
  description: string;
  /**
   * Tools used, most significant first. Same shape as ExperienceTool so the
   * card can reuse the ToolCard tile (icon + name, monogram fallback).
   */
  stack: ProjectTool[];
  /** Cover image under /public, e.g. '/projects/shipyard.png'. */
  cover: string;
  links: {
    /** Public deployment. The card drops the "Live link" cell when absent. */
    live?: string;
    /** Public source. The card drops the "GitHub" cell when absent. */
    repo?: string;
  };
};

export const projects: Project[] = [
  {
    slug: 'shipyard',
    name: 'Shipyard',
    status: 'live',
    tagline: 'Project management for **small engineering teams**',
    description:
      'Opinionated open-source workspace where **people and AI agents** plan, track, and ship work in the same focused flow.',
    stack: [
      { name: 'Next.js', icon: '/logos/tools/next-js.svg' },
      { name: 'TypeScript', icon: '/logos/tools/typescript.svg' },
      { name: 'Express', icon: '/logos/tools/express.svg' },
      { name: 'Prisma', icon: '/logos/tools/prisma.svg' },
      { name: 'Turborepo', icon: '/logos/tools/turborepo.svg' },
      { name: 'React', icon: '/logos/tools/react.svg' },
      { name: 'PostgreSQL', icon: '/logos/tools/postgresql.svg' },
      { name: 'Better Auth', icon: '/logos/tools/better-auth.svg' },
      { name: 'Tailwind CSS', icon: '/logos/tools/tailwind-css.svg' },
      { name: 'Docker', icon: '/logos/tools/docker.svg' },
    ],
    cover: '/projects/shipyard.png',
    links: {
      live: 'https://shipyard.yonatanem.com',
      repo: 'https://github.com/YONATANEMEKETE/shipyard',
    },
  },
];
