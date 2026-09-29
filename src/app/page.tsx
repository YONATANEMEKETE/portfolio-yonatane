import { Container } from '@/components/layout/container';
import { ProfileCard } from '@/components/sections/profile-card';

export default function Home() {
  return (
    <main>
      {/* Section padding from the design: 20px above, 8px below. */}
      <Container className="pt-5 pb-2">
        <ProfileCard />
      </Container>
    </main>
  );
}
