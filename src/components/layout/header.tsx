import Cloudscape from '@/components/forgeui/cloudscape';
import { Container } from '@/components/layout/container';
import { MiniPlayer } from '@/components/layout/mini-player';
import { NavWrap } from '@/components/layout/nav-wrap';

export function Header() {
  return (
    <header>
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
