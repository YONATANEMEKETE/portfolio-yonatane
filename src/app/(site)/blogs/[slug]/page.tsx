import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { SoundLink } from '@/components/sound-link';

import { getPublishedArticleBySlug } from '@/lib/articles';
import { formatArticleDate, formatReadTime } from '@/lib/format';

import { Container } from '@/components/layout/container';
import { HandNote } from '@/components/layout/hand-note';
import { ShareButton } from '@/components/share-button';
import { TiptapBody } from '@/components/tiptap-body';
import { ImageZoom } from '@/components/kibo-ui/image-zoom';
import { GooeyText } from '@/components/ui/gooey-text';
import { TextReveal } from '@/components/forgeui/text-reveal';

export async function generateMetadata(props: PageProps<'/blogs/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getPublishedArticleBySlug(slug).catch(() => null);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverUrl }],
    },
  };
}

export default async function BlogDetailsPage(props: PageProps<'/blogs/[slug]'>) {
  const { slug } = await props.params;
  const article = await getPublishedArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const categoryLabel = article.category === 'TECH' ? 'Tech' : 'Personal';
  const dateStr = article.publishedAt ? formatArticleDate(article.publishedAt) : null;
  const timeStr = formatReadTime(article.readTime);
  const meta = [categoryLabel, dateStr, timeStr].filter(Boolean).join(' · ');

  return (
    <main>
      <Container className="pt-8 pb-16">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="text-body flex items-center gap-2 text-[14px] leading-5">
              <li>
                <SoundLink href="/" className="hover:text-ink font-medium transition-colors">
                  Home
                </SoundLink>
              </li>
              <li aria-hidden className="text-faint">
                /
              </li>
              <li>
                <SoundLink href="/blogs" className="hover:text-ink font-medium transition-colors">
                  Blogs
                </SoundLink>
              </li>
              <li aria-hidden className="text-faint">
                /
              </li>
              <li aria-current="page" className="text-ink max-w-40 truncate font-semibold">
                {slug}
              </li>
            </ol>
          </nav>

          <div className="relative shrink-0">
            <ShareButton />
            <HandNote label="Share" className="top-[-73px] left-full ml-[15px]" />
          </div>
        </div>

        <header className="mt-6">
          {meta && (
            <p className="font-mono text-[12px] leading-4 text-[#9ca3af]">
              <TextReveal text={meta} duration={0.4} staggerDelay={0.03} />
            </p>
          )}
          <h1 className="text-ink mt-2 text-[32px] leading-[38px] font-bold">
            <GooeyText
              text={article.title}
              className="text-ink text-[32px] leading-[38px] font-bold"
            />
          </h1>
          {article.excerpt && (
            <p className="text-muted-ink mt-3 text-[16px] leading-[26px]">
              <TextReveal
                key={article.excerpt}
                text={article.excerpt}
                duration={0.45}
                staggerDelay={0.03}
                delay={0.2}
              />
            </p>
          )}
        </header>

        {/* Same glass ring as the project details cover. */}
        <div className="mt-6 rounded-[20px] border border-[#d8d8dc] bg-white/70 p-1 backdrop-blur-[12px]">
          <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-[#ececf0]">
            <ImageZoom
              withRing
              className="size-full [&_[data-rmiz-content]]:size-full [&_[data-rmiz]]:size-full"
            >
              <Image
                src={article.coverUrl}
                alt={`${article.title} cover`}
                fill
                preload
                sizes="(max-width: 768px) 100vw, 768px"
                className="rounded-[16px] object-cover"
              />
            </ImageZoom>
          </div>
        </div>

        <div className="mt-8">
          <TiptapBody body={article.body} />
        </div>

        <div aria-hidden className="mt-10 h-px w-full bg-[#ececf0]" />
      </Container>
    </main>
  );
}
