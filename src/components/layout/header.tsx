import Cloudscape from '@/components/forgeui/cloudscape';
import { Container } from '@/components/layout/container';
import { MiniPlayer } from '@/components/layout/mini-player';
import { NavWrap } from '@/components/layout/nav-wrap';

export function Header() {
  return (
    // Sticky so the banner rides the top of the viewport while the page scrolls
    // behind it. The white plate behind the banner keeps the rounded corners
    // clean: without it, content would show through the corner notches.
    <header className="bg-background sticky top-0 z-50">
      <Container>
        <div className="relative h-44 overflow-hidden rounded-b-[20px]">
          <Cloudscape className="absolute inset-0" height="100%" />
          <NavWrap />
          <MiniPlayer />
        </div>
      </Container>
    </header>
  );
}
