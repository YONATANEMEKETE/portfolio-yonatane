import { ArrowLeft } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { EdgeFades } from '@/components/layout/edge-fades';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/sections/footer-section';
import { SoundLink } from '@/components/sound-link';
import { GooeyText } from '@/components/ui/gooey-text';
import { TextReveal } from '@/components/forgeui/text-reveal';

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Container className="flex flex-col items-center pt-8 pb-16">
          {/* Breadcrumb Navigation */}
          <div className="w-full">
            <nav aria-label="Breadcrumb">
              <ol className="text-body flex items-center gap-2 text-[14px] leading-5">
                <li>
                  <SoundLink href="/" className="hover:text-ink font-medium transition-colors">
                    Home
                  </SoundLink>
                </li>
                <li aria-hidden className="text-[#d1d1d6]">
                  /
                </li>
                <li aria-current="page" className="text-ink font-semibold">
                  404
                </li>
              </ol>
            </nav>
          </div>

          {/* Not Found Glass Card */}
          <div className="relative mt-8 w-full rounded-[20px] border border-[#d8d8dc] bg-white/70 p-1 backdrop-blur-[12px]">
            <div className="flex flex-col items-center gap-5 rounded-[16px] border border-[#ececf0] bg-white px-6 py-14 text-center sm:px-12">
              {/* Kicker badge */}
              <div className="border-line text-muted-ink flex items-center gap-2 rounded-full border bg-[#f6f6f8] px-3.5 py-1 font-mono text-[12px] tracking-wide uppercase">
                <span aria-hidden className="bg-warning size-2 animate-pulse rounded-full" />
                <span>404 · Route Not Found</span>
              </div>

              {/* Title with Gooey effect on user's name */}
              <h1 className="text-ink text-[32px] leading-tight font-bold tracking-tight sm:text-[40px]">
                Lost in{' '}
                <GooeyText
                  text="YONATANE M"
                  className="text-ink text-[32px] font-bold sm:text-[40px]"
                />
                &apos;s workspace
              </h1>

              {/* Subtitle animated with TextReveal */}
              <p className="text-muted-ink max-w-md text-[15px] leading-[26px] sm:text-[16px]">
                <TextReveal
                  text="The page you are looking for has drifted off the radar, been moved, or never existed in the first place."
                  duration={0.45}
                  staggerDelay={0.03}
                />
              </p>

              {/* Quick Navigation Action Buttons */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
                <SoundLink
                  href="/"
                  className="group border-line-soft text-ink hover:bg-tile-start inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2 font-mono text-[13px] font-medium shadow-xs transition-colors"
                >
                  <ArrowLeft
                    aria-hidden
                    className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-1"
                  />
                  <span>Back to Home</span>
                </SoundLink>

                <SoundLink
                  href="/#projects"
                  className="group border-line-soft text-muted-ink hover:text-ink hover:bg-tile-start inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 font-mono text-[13px] font-medium transition-colors"
                >
                  <span>View Projects</span>
                </SoundLink>

                <SoundLink
                  href="/blogs"
                  className="group border-line-soft text-muted-ink hover:text-ink hover:bg-tile-start inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 font-mono text-[13px] font-medium transition-colors"
                >
                  <span>Browse Blogs</span>
                </SoundLink>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
      <EdgeFades />
    </>
  );
}
