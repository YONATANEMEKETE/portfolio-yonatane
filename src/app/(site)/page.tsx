import { Container } from '@/components/layout/container';
import { BioSection } from '@/components/sections/bio-section';
import { BlogsSection } from '@/components/sections/blogs-section';
import { ContributionsSection } from '@/components/sections/contributions-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { TechStackSection } from '@/components/sections/tech-stack-section';
import { ProfileCard } from '@/components/sections/profile-card';
import { SocialLinks } from '@/components/sections/social-links';

export default function Home() {
  return (
    <main>
      <Container className="pt-5 pb-16">
        <ProfileCard />
        {/* Design: 8px below the card, the social row sits flush to the right. */}
        <SocialLinks className="mt-2" />
        <BioSection />
        <ContributionsSection />
        <ExperienceSection />
        <TechStackSection />
        <ProjectsSection />
        <BlogsSection />
      </Container>
    </main>
  );
}
