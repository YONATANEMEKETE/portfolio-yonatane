import { projects } from '@/content/projects';

import { ProjectCard } from '@/components/sections/project-card';

/**
 * The id the nav "Projects" link scrolls to. The section lives on the home
 * page; `/#projects` is the only address for it now that /projects is gone.
 */
export function ProjectsSection() {
  return (
    // scroll-mt clears the sticky header, so the anchor lands the section just
    // below the banner rather than behind it.
    <section id="projects" className="scroll-mt-44 pt-14">
      <p className="text-faint text-[15px] leading-[18px]">Projects</p>
      <h2 className="text-ink mt-1 text-[28px] leading-[34px] font-bold">Showcase of my work</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
