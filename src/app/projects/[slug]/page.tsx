import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { projects } from '@/content/projects';
import { cn } from '@/lib/utils';

import { Emphasise } from '@/components/emphasise';
import { Container } from '@/components/layout/container';
import { HandNote } from '@/components/layout/hand-note';
import { Markdown } from '@/components/markdown';
import { ShareButton } from '@/components/share-button';

const statusLabel = { building: 'Building', live: 'Live' } as const;

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = findProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.name,
    // The card copy marks emphasis with `**`, which has no place in a meta tag.
    description: project.tagline.replace(/\*\*/g, ''),
  };
}

export default async function ProjectDetailsPage(props: PageProps<'/projects/[slug]'>) {
  const { slug } = await props.params;
  const project = findProject(slug);

  if (!project) {
    notFound();
  }

  const { name, status, tagline, description, cover, details } = project;

  return (
    <main>
      <Container className="pt-8 pb-16">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="text-body flex items-center gap-2 text-[14px] leading-5">
              <li>
                <Link href="/" className="hover:text-ink font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-faint">
                /
              </li>
              <li>
                <Link href="/projects" className="hover:text-ink font-medium transition-colors">
                  Projects
                </Link>
              </li>
              <li aria-hidden className="text-faint">
                /
              </li>
              <li aria-current="page" className="text-ink font-semibold">
                {slug}
              </li>
            </ol>
          </nav>

          <div className="relative shrink-0">
            <ShareButton />
            {/* Hand-written note in the right gutter; the arrow tip lands on the
                button's centre (target y 16px - 89px of note geometry). */}
            <HandNote label="Share" className="top-[-73px] left-full ml-[15px]" />
          </div>
        </div>

        <header className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-ink text-[36px] leading-[44px] font-bold">{name}</h1>

            <p className="text-body flex shrink-0 items-center gap-1.5 text-[13px] leading-4 font-medium">
              <span
                aria-hidden
                className={cn(
                  'size-2 rounded-full',
                  status === 'live' ? 'bg-success' : 'bg-warning',
                )}
              />
              {statusLabel[status]}
            </p>
          </div>

          <p className="text-muted-ink mt-2 text-[18px] leading-[26px]">
            <Emphasise text={tagline} />
          </p>

          <p className="text-body-soft mt-3 text-[16px] leading-[26px]">
            <Emphasise text={description} />
          </p>
        </header>

        {/* Same glass ring as the card covers, one step larger. */}
        <div className="mt-6 rounded-[20px] border border-[#d8d8dc] bg-white/70 p-1 backdrop-blur-[12px]">
          <div className="relative h-80 w-full overflow-hidden rounded-[16px] bg-[#ececf0]">
            <Image
              src={cover}
              alt={`${name} cover`}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-8">
          <Markdown source={details} />
        </div>
      </Container>
    </main>
  );
}
