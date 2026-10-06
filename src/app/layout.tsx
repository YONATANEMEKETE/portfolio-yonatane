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

export const metadata: Metadata = {
  title: {
    default: 'Yonatan Mekete — Portfolio',
    template: '%s | Yonatan Mekete',
  },
  description: 'Personal portfolio and engineering blog of Yonatane Mekete.',
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
