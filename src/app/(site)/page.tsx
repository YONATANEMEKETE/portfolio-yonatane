import { Container } from '@/components/layout/container';
import { BioSection } from '@/components/sections/bio-section';
import { BlogsSection } from '@/components/sections/blogs-section';
import { ContributionsSection } from '@/components/sections/contributions-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { TechStackSection } from '@/components/sections/tech-stack-section';
import { ProfileCard } from '@/components/sections/profile-card';
import { SocialLinks } from '@/components/sections/social-links';
import { QuoteSection } from '@/components/sections/quote-section';
import { FooterSection } from '@/components/sections/footer-section';
import { HomeSectionIndex } from '@/components/sections/home-section-index';

export default function Home() {
  return (
    <main className="relative">
      <HomeSectionIndex />
      <Container className="pt-5">
        <div id="about" className="scroll-mt-48">
          <ProfileCard />
          {/* Design: 8px below the card, the social row sits flush to the right. */}
          <SocialLinks className="mt-2" />
          <BioSection />
        </div>
        <div id="contributions" className="scroll-mt-48">
          <ContributionsSection />
        </div>
        <div id="experience" className="scroll-mt-48">
          <ExperienceSection />
        </div>
        <div id="tech-stack" className="scroll-mt-48">
          <TechStackSection />
        </div>
        <ProjectsSection />
        <BlogsSection />
        <QuoteSection />
        <FooterSection />
      </Container>
    </main>
  );
}
