import { cn } from '@/lib/utils';

import { HandNote } from '@/components/layout/hand-note';
import { BookCall } from '@/components/sections/book-call';
import { SocialCard } from '@/components/sections/social-card';
import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from '@/components/kibo-ui/glimpse';

type Glyph = {
  /** Icon path copied from the design, not a substitute icon set. */
  d: string;
  viewBox?: string;
  /** The GitHub mark is drawn as a stroke rather than a filled shape. */
  stroked?: boolean;
};

const iconClass = 'text-ink size-3.5 shrink-0';

function SocialIcon({ d, viewBox = '0 0 24 24', stroked }: Glyph) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      fill={stroked ? 'none' : 'currentColor'}
      stroke={stroked ? 'currentColor' : undefined}
      strokeWidth={stroked ? 1.5 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
    >
      <path d={d} />
    </svg>
  );
}

type GlimpsePreview = {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  imageClassName?: string;
};

const glimpsePreviews: Record<string, GlimpsePreview> = {
  X: {
    title: 'Yonatan Mekete (@Yonatanem2) / X',
    description: 'Shipping | Fullstack Typescript Dev',
    image: 'https://pbs.twimg.com/profile_banners/1889269372285509632/1783256956/600x200',
    imageAlt: 'Yonatan Mekete profile banner on X',
  },
  GitHub: {
    title: 'YONATANEMEKETE (Yonatane Mekete)',
    description:
      'Full-Stack TypeScript Engineer building production-grade software. 55 repositories on GitHub.',
    image: 'https://opengraph.githubassets.com/1/YONATANEMEKETE',
    imageAlt: 'Yonatane Mekete GitHub preview',
  },
  LinkedIn: {
    title: 'Yonatan Mekete | LinkedIn',
    description: 'Full Stack Software Engineer • TypeScript, Next.js, Node.js, Cloud Architecture.',
    image: '/profile-image.png',
    imageAlt: 'Yonatane Mekete on LinkedIn',
    imageClassName: 'object-[center_25%]',
  },
};

// Book a Call renders the cal.com embed instead of a link.
const socials: { label: string; href: string; icon: Glyph; embed?: 'cal' }[] = [
  {
    label: 'X',
    href: 'https://x.com/Yonatanem2',
    icon: {
      d: 'M13.808 10.469l7.072-8.469h-1.676l-6.142 7.353-4.904-7.353h-5.658l7.418 11.12-7.418 8.88h1.676l6.486-7.765 5.18 7.765h5.658z m-2.296 2.748l-0.752-1.107-5.98-8.81h2.575l4.826 7.11 0.751 1.107 6.273 9.242h-2.574z',
    },
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/yonatanemekete/',
    icon: {
      d: 'M6.94 5a2 2 0 1 1-4-0.002 2 2 0 0 1 4 0.002m0.06 3.48h-4v12.52h4z m6.32 0h-3.98v12.52h3.94v-6.57c0-3.66 4.77-4 4.77 0v6.57h3.95v-7.93c0-6.17-7.06-5.94-8.72-2.91z',
    },
  },
  {
    label: 'GitHub',
    href: 'https://github.com/YONATANEMEKETE',
    icon: {
      d: 'M3.5 15.668q0.675 0.081 1 0.618c0.326 0.537 1.537 2.526 2.913 2.526h2.087m5.672-3.513q0.823 1.078 0.823 1.936v3.765m-5.625-5.609q-0.87 0.954-0.869 1.813v3.796m5.671-5.701c1.202-0.25 2.293-0.682 3.14-1.316 1.448-1.084 2.188-2.758 2.188-4.411 0-1.16-0.44-2.243-1.204-3.16-0.425-0.511 0.819-3.872-0.286-3.359-1.105 0.514-2.725 1.198-3.574 0.947-0.909-0.268-1.9-0.416-2.936-0.416-0.9 0-1.766 0.111-2.574 0.317-1.174 0.298-2.296-0.363-3.426-0.848-1.13-0.484-0.513 3.008-0.849 3.422-0.73 0.905-1.151 1.965-1.151 3.097 0 1.653 0.895 3.327 2.343 4.41 0.965 0.722 2.174 1.183 3.527 1.41',
      stroked: true,
    },
  },
  {
    label: 'Email',
    href: 'mailto:yonatanemekete22@gmail.com',
    icon: {
      d: 'M5 5h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3m0 1c-0.5 0-0.94 0.17-1.28 0.47l7.78 5.03 7.78-5.03c-0.34-0.3-0.78-0.47-1.28-0.47z m6.5 6.71l-8.37-5.43c-0.08 0.22-0.13 0.47-0.13 0.72v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9c0-0.25-0.05-0.5-0.13-0.72z',
    },
  },
  {
    label: 'Book a Call',
    href: '',
    embed: 'cal',
    icon: {
      d: 'M7 2h1a1 1 0 0 1 1 1v1h5v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3v-1a1 1 0 0 1 1-1m8 2h1v-1h-1z m-7 0v-1h-1v1z m-2 1a2 2 0 0 0-2 2v1h15v-1a2 2 0 0 0-2-2z m-2 13a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-9h-15z m8-5h5v5h-5z m1 1v3h3v-3z',
    },
  },
  {
    label: 'Resume',
    href: 'https://drive.google.com/file/d/15MoMlM-VXsptKP0K0ry9Z0EO5n7udcES/view?usp=drive_link',
    icon: {
      d: 'M832 384h-256v-256h-384v768h640z m-26.5-64l-165.5-165.5v165.5z m-645.5-256h480l256 256v608a32 32 0 0 1-32 32h-704a32 32 0 0 1-32-32v-832a32 32 0 0 1 32-32m160 448h384v64h-384z m0-192h160v64h-160z m0 384h384v64h-384z',
      viewBox: '0 0 1024 1024',
    },
  },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <section
      aria-label="Social links"
      className={cn('relative flex flex-wrap items-center justify-end gap-2', className)}
    >
      {socials.map(({ label, href, icon, embed }) => {
        if (embed === 'cal') {
          return <BookCall key={label} icon={<SocialIcon {...icon} />} />;
        }

        const card = <SocialCard label={label} href={href} icon={<SocialIcon {...icon} />} />;

        const preview = glimpsePreviews[label];
        if (!preview) {
          return <span key={label}>{card}</span>;
        }

        return (
          <Glimpse key={label} closeDelay={0} openDelay={0}>
            <GlimpseTrigger asChild>{card}</GlimpseTrigger>
            <GlimpseContent className="w-72" side="bottom" sideOffset={8}>
              <GlimpseImage
                src={preview.image}
                alt={preview.imageAlt ?? preview.title}
                className={preview.imageClassName}
              />
              <GlimpseTitle>{preview.title}</GlimpseTitle>
              <GlimpseDescription>{preview.description}</GlimpseDescription>
            </GlimpseContent>
          </Glimpse>
        );
      })}
      <HandNote label="Contact me" className="top-[-89px] left-full ml-[15px]" />
    </section>
  );
}
