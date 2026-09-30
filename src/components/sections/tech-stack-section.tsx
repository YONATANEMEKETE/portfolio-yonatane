import { techStack } from '@/content/tech-stack';

import { ToolCard } from '@/components/sections/tool-card';

export function TechStackSection() {
  return (
    <section className="pt-14">
      <h2 className="text-ink text-[28px] leading-[34px] font-bold">Tech Stack</h2>

      <ul className="mt-4 flex flex-wrap gap-2">
        {techStack.map((tool) => (
          <ToolCard key={tool.name} {...tool} />
        ))}
      </ul>
    </section>
  );
}
