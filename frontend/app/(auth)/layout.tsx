import { PLATFORM_NAME } from '@/lib/brand';
import { Marquee, MarqueeContent } from '@/components/ui/Marquee';
import { PlatformLogo } from '@/components/layout/PlatformLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-12 sm:px-12 lg:px-20">
        <Marquee className="-mx-6 mb-8 sm:-mx-12 lg:hidden" speed="slow">
          <MarqueeContent />
        </Marquee>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-10 flex items-center gap-2">
            <PlatformLogo size="sm" priority />
            <span className="font-display text-base font-semibold leading-tight text-ink-900">
              {PLATFORM_NAME}
            </span>
          </div>
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.25),transparent_45%)]" />
        <Marquee className="absolute inset-x-0 top-0 border-brand-700/40" speed="slow">
          <MarqueeContent />
        </Marquee>
        <div className="relative flex h-full flex-col justify-end p-14 pt-24">
          <p className="font-display text-3xl font-semibold leading-tight text-white">
            Learn something new.<br />Teach what you know.<br />Track it all in one place.
          </p>
          <p className="mt-4 max-w-md text-sm text-brand-200">
            Courses across ICT, design, marketing, computer science, and data &amp; AI —
            with quizzes, assignments, and certificates built in.
          </p>
        </div>
      </div>
    </div>
  );
}
