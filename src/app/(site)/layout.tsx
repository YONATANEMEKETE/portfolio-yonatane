import { Header } from '@/components/layout/header';
import { EdgeFades } from '@/components/layout/edge-fades';
import { ViewRecorder } from '@/components/layout/view-recorder';

// Public site chrome: everything that isn't /manage renders inside this layout.
export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      {children}
      <EdgeFades />
      <ViewRecorder />
    </>
  );
}
