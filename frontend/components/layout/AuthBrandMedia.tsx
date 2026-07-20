'use client';

import { usePathname } from 'next/navigation';

/**
 * Full-bleed brand video for the auth brand panel.
 * - Login: hub-login-loop.mp4 loops seamlessly as a calm background.
 * - Register: hub-register-intro.mp4 plays once (onboarding), settling on the
 *   fully-assembled HUB logo.
 * Muted + playsInline so browsers allow autoplay; the SVG mark is the poster.
 */
export function AuthBrandMedia() {
  const pathname = usePathname();
  const isRegister = pathname?.startsWith('/register') ?? false;
  const src = isRegister ? '/videos/hub-register-intro.mp4' : '/videos/hub-login-loop.mp4';

  return (
    <video
      key={src}
      className="absolute inset-0 h-full w-full object-cover"
      poster="/images/hub-mark.svg"
      autoPlay
      muted
      playsInline
      loop={!isRegister}
      preload="auto"
      aria-hidden="true"
    >
      {/* WebM first (smaller) when present, then the MP4 fallback. */}
      <source src={isRegister ? '/videos/hub-register-intro.webm' : '/videos/hub-login-loop.webm'} type="video/webm" />
      <source src={src} type="video/mp4" />
    </video>
  );
}
