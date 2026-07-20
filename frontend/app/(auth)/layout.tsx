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

        {/* Brand panel: the HUB logo animation is a white-background reveal that
            already carries the wordmark + tagline, so we let it stand on its own
            (no overlaid copy to fight the video for contrast). */}
        <div className="relative hidden overflow-hidden bg-white lg:block lg:border-l lg:border-ink-900/10">
          <AuthBrandMedia />
        </div>
      </div>
    </PublicThemeProvider>
  );
}
