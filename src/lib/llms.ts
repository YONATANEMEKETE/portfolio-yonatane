import { experiences } from '@/content/experience';
import { projects } from '@/content/projects';
import { techStack } from '@/content/tech-stack';
import { getPublishedArticles, type PublicArticle } from '@/lib/articles';

export async function generateLlmsTxt(baseUrl = 'https://yonatanem.com'): Promise<string> {
  let articles: PublicArticle[] = [];
  try {
    articles = await getPublishedArticles();
  } catch {
    articles = [];
  }

  const lines: string[] = [
    `# Yonatan Mekete (YONATANE M)`,
    ``,
    `> Fullstack TypeScript Developer and Software Engineer building production-grade software. Based in Addis Ababa, Ethiopia (UTC+3) and working worldwide.`,
    ``,
    `## Summary`,
    ``,
    `- **Name**: Yonatan Mekete`,
    `- **Roles**: Fullstack TypeScript Developer, Fullstack Software Engineer`,
    `- **Location**: Addis Ababa, Ethiopia (UTC+3) · Working Worldwide`,
    `- **Philosophy**: "I ship. TypeScript across the whole stack, no excuses."`,
    `- **Website**: ${baseUrl}`,
    ``,
    `## Projects`,
    ``,
  ];

  for (const project of projects) {
    const liveLink = project.links.live ? ` [Live](${project.links.live})` : '';
    const repoLink = project.links.repo ? ` [GitHub](${project.links.repo})` : '';
    const detailsLink = ` [Case Study](${baseUrl}/projects/${project.slug})`;
    const links = [liveLink, repoLink, detailsLink].filter(Boolean).join(' ·');

    lines.push(`### ${project.name} (${project.status.toUpperCase()})`);
    lines.push(`${project.tagline.replace(/\*\*/g, '')}`);
    lines.push(``);
    lines.push(`${project.description.replace(/\*\*/g, '')}`);
    if (links) {
      lines.push(``);
      lines.push(`Links:${links}`);
    }
    lines.push(``);
    lines.push(`- **Stack**: ${project.stack.map((s) => s.name).join(', ')}`);
    lines.push(``);
  }

  lines.push(`## Experience`);
  lines.push(``);

  for (const exp of experiences) {
    lines.push(`### ${exp.role} — ${exp.company}`);
    lines.push(`*${exp.location} | ${exp.start} – ${exp.end}*`);
    lines.push(``);
    lines.push(`- **Tools**: ${exp.tools.map((t) => t.name).join(', ')}`);
    lines.push(`- **Key Contributions**:`);
    for (const item of exp.done) {
      lines.push(`  - ${item.replace(/\*\*/g, '')}`);
    }
    lines.push(``);
  }

  lines.push(`## Technical Stack`);
  lines.push(``);
  lines.push(techStack.map((tool) => tool.name).join(', '));
  lines.push(``);

  if (articles.length > 0) {
    lines.push(`## Articles & Writing`);
    lines.push(``);
    for (const article of articles) {
      lines.push(`### [${article.title}](${baseUrl}/blogs/${article.slug})`);
      lines.push(`*Category: ${article.category} | ${article.readTime} min read*`);
      lines.push(``);
      lines.push(article.excerpt);
      lines.push(``);
    }
  }

  lines.push(`## Contact & Profiles`);
  lines.push(``);
  lines.push(`- **Email**: mailto:yonatanemekete22@gmail.com`);
  lines.push(`- **GitHub**: https://github.com/YONATANEMEKETE`);
  lines.push(`- **LinkedIn**: https://www.linkedin.com/in/yonatanemekete/`);
  lines.push(`- **X (Twitter)**: https://x.com/Yonatanem2`);
  lines.push(`- **Book a Call**: https://cal.com/yonatan-mekete`);
  lines.push(
    `- **Resume**: https://drive.google.com/file/d/15MoMlM-VXsptKP0K0ry9Z0EO5n7udcES/view?usp=drive_link`,
  );
  lines.push(``);

  return lines.join('\n');
}
