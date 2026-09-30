/**
 * Project content — static data, edited as a commit rather than through /manage.
 * Each entry renders as one card in the "Showcase of my work" grid, and later as
 * the project details page at /projects/<slug>.
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
  /**
   * Full case-study body as markdown (headings, lists, code, quotes, images).
   * Rendered with the shared Markdown component on /projects/<slug>.
   */
  details: string;
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
    details: `## The problem

Small software teams spend their weeks managing their project management tool instead of building software. The market splits two unhelpful ways: tools too simple to run a real engineering workflow, and enterprise platforms where configuration becomes somebody's part-time job.

Shipyard starts from a narrower bet: teams of 2–30 people don't need more features. They need the essential workflows (issues, projects, time-boxed cycles, visibility) done fast, with excellent defaults instead of configuration screens.

## What it is

Shipyard is an open-source, developer-first project management workspace. Plan. Build. Ship. The promise is deliberately plain: *the easiest way for small software teams to manage and ship software.*

It is live in production at [shipyard.yonatanem.com](https://shipyard.yonatanem.com), and the source is open at [github.com/YONATANEMEKETE/shipyard](https://github.com/YONATANEMEKETE/shipyard).

![Shipyard dashboard](/shipyard/dashboard.webp)

## How it works

Work lives in issues with workspace-scoped keys (\`SHIP-482\`), tracked on a board or a list, with priorities, labels, assignees, due dates, and blockers that carry a reason.

![Issue board with SHIP keys](/shipyard/issue-board.webp)

Issues roll up into projects (Planned / Active / Completed) and cycles (non-overlapping, one active at a time), and progress is never stored anywhere. It is **derived from the issues inside**, so planning, doing, and reporting always read from the same data.

![Projects with derived progress](/shipyard/projects.webp)

![Cycle detail with goal and progress](/shipyard/cycle.webp)

Around that core sit the quiet essentials: a dashboard with the current cycle and assigned work, a workspace-wide activity feed, one ranked search across issues, projects, cycles, members, and comment text, plus threaded comments with \`@mentions\` that notify.

## Agents work here too

The differentiator: Shipyard treats an AI agent as a **second interface to the same domain**, not a second backend. A member mints a scoped token under agent access, points their agent at \`/mcp\`, and the agent works *as them*: same services, same permissions, every write attributed in history and the activity feed.

![Agent access with scoped token](/shipyard/mcp.png)

The contracts make this safe to build on. One Zod schema in the shared package is both the request validator and the generator for the MCP tool's JSON Schema, so the two can never drift. Tool discovery is filtered by token scope, reads come before writes, and the irreversible tools sit last.

\`\`\`bash
curl -X POST https://api.shipyard.yonatanem.com/mcp \\
  -H "Authorization: Bearer shp_9f2c…" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call",
       "params": {"name": "shipyard_list_issues",
                  "arguments": {"cycle": "current", "blocked": true}}}'
\`\`\`

## Postgres does the heavy lifting

There is no search engine, no queue, no cache tier. Full-text search runs on weighted \`tsvector\` columns with GIN indexes. Cycle date ranges cannot overlap because the database forbids it. An exclusion constraint, not application code:

\`\`\`prisma
// Illustrative excerpt; the real invariant lives in schema.prisma
@@exclusion([workspaceId, daterange(startDate, endDate)],
            name: "cycle_no_overlap")
\`\`\`

The activity feed is append-only, and its targets are stored as plain strings so rows outlive whatever they point at. Invariants that matter live in the schema, where they **cannot be bypassed**.

## Shipping it

One Turborepo monorepo: a Next.js app on Vercel, an Express modular monolith in Docker on Render, Postgres on Neon, migrations applied at container boot. The reference deploy costs roughly $0 a month, with cold starts accepted deliberately. Every change passes lint, typecheck, format, audit, and build before it merges.

![Deployment topology](/shipyard/DiagramArchitecture.webp)

## Designed on purpose

Shipyard was planned before it was built. A separate design repository holds the brief, PRD, user flows, ADRs, and per-feature specs: behavior first, slices second. The interface follows the Harbor Amber system: calm operational surfaces, Inter for UI with Geist Mono for IDs and labels, exactly one solid-brand action per section.

## Status

Shipyard is live and serving real workspaces. The post-MVP backlog grows only on evidence: user reports, measured pain, or a blocking dependency. Never preemptive building. If you run a small team drowning in process, this is the tool I wish we'd had sooner.`,
    links: {
      live: 'https://shipyard.yonatanem.com',
      repo: 'https://github.com/YONATANEMEKETE/shipyard',
    },
  },
];
