import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { PLATFORM_NAME } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: PLATFORM_NAME,
  description: 'Siaya Community Digital Hub Learning Platform — course delivery, quizzes, assignments, and progress tracking.',
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#4338ca',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
