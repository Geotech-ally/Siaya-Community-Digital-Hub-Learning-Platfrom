import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';
import { Marquee, MarqueeContent } from '@/components/ui/Marquee';
import { PlatformLogo } from '@/components/layout/PlatformLogo';
import { AuthBrandMedia } from '@/components/layout/AuthBrandMedia';
import { PublicThemeProvider } from '@/components/layout/PublicThemeProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicThemeProvider>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative flex flex-col px-6 py-12 sm:px-12 lg:px-20">
          <div className="absolute right-6 top-6 z-10 sm:right-12">
            <ThemeToggle />
          </div>

          <Marquee className="-mx-6 mb-8 sm:-mx-12 lg:hidden" speed="slow">
            <MarqueeContent />
          </Marquee>

          <div className="flex flex-1 flex-col justify-center">
            <Link href="/" className="mb-10 flex items-center gap-2" aria-label={`${PLATFORM_NAME} home`}>
              <PlatformLogo size="sm" priority />
              <span className="font-display text-base font-semibold leading-tight text-ink-900 dark:text-white">
                {PLATFORM_NAME}
              </span>
            </Link>
            <div className="mx-auto w-full max-w-sm">{children}</div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-brand-900 dark:bg-void-900 lg:block">
          <AuthBrandMedia />
          {/* readability overlay so the white copy stays legible over the video */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/25 to-brand-950/5 dark:from-void-950/90 dark:via-void-950/35" />
          <div className="relative flex h-full flex-col justify-end p-14 pt-24">
            <p className="font-display text-3xl font-semibold leading-tight text-white">
              Learn something new.<br />Teach what you know.<br />Track it all in one place.
            </p>
            <p className="mt-4 max-w-md text-sm text-brand-200 dark:text-iris-300">
              Courses across ICT, design, marketing, computer science, and data &amp; AI,
              with quizzes, assignments, and certificates built in.
            </p>
          </div>
        </div>
      </div>
    </PublicThemeProvider>
  );
}
