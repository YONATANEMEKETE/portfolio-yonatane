import type { Metadata } from 'next';
import './globals.css';
import { Caveat, Inter, JetBrains_Mono } from 'next/font/google';
import ClickSpark from '@/components/ClickSpark';
import Noise from '@/components/Noise';
import { SmoothScroll } from '@/components/smooth-scroll';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});
const caveat = Caveat({ subsets: ['latin'], variable: '--font-hand' });

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yonatanemekete.com';
const siteUrl =
  rawSiteUrl.startsWith('http://') || rawSiteUrl.startsWith('https://')
    ? rawSiteUrl
    : rawSiteUrl.includes('localhost')
      ? `http://${rawSiteUrl}`
      : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Yonatane Mekete — Fullstack Software Engineer',
    template: '%s | Yonatane Mekete',
  },
  description:
    'Personal portfolio and engineering writings of Yonatane Mekete. Fullstack TypeScript developer shipping fast, resilient web applications and interactive systems.',
  applicationName: 'Yonatane Mekete Portfolio',
  authors: [{ name: 'Yonatane Mekete', url: 'https://x.com/Yonatanem2' }],
  creator: 'Yonatane Mekete',
  publisher: 'Yonatane Mekete',
  keywords: [
    'Yonatane Mekete',
    'Yonatan Mekete',
    'Fullstack Developer',
    'Software Engineer',
    'TypeScript',
    'Next.js',
    'React',
    'Node.js',
    'Web Development',
    'Portfolio',
    'Addis Ababa',
  ],
  alternates: {
    canonical: '/',
    types: {
      'text/markdown': [{ url: '/llms.txt', title: 'LLM Context' }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Yonatane Mekete Portfolio',
    title: 'Yonatane Mekete — Fullstack Software Engineer',
    description:
      'Personal portfolio and engineering writings of Yonatane Mekete. Fullstack TypeScript developer shipping fast, resilient web applications.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yonatane Mekete — Fullstack Software Engineer',
    description:
      'Personal portfolio and engineering writings of Yonatane Mekete. Fullstack TypeScript developer shipping fast, resilient web applications.',
    creator: '@Yonatanem2',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

// Root layout: fonts, global metadata, html shell. Site chrome (header, fades,
// view recording) belongs to the (site) layout — everything under /manage gets
// this shell only.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn('font-sans', inter.variable, jetbrainsMono.variable, caveat.variable)}
    >
      <body>
        <SmoothScroll>
          <Noise patternAlpha={8} />
          <ClickSpark sparkColor="#3b82f6">{children}</ClickSpark>
        </SmoothScroll>
      </body>
    </html>
  );
}
