import { Container } from '@/components/layout/container';
import { BioSection } from '@/components/sections/bio-section';
import { ContributionsSection } from '@/components/sections/contributions-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ProfileCard } from '@/components/sections/profile-card';
import { SocialLinks } from '@/components/sections/social-links';

export default function Home() {
  return (
    <main>
      <Container className="pt-5">
        <ProfileCard />
        {/* Design: 8px below the card, the social row sits flush to the right. */}
        <SocialLinks className="mt-2" />
        <BioSection />
        <ContributionsSection />
        <ExperienceSection />
      </Container>
    </main>
  );
}
