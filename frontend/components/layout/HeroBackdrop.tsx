'use client';

import { ParticleField } from '@/components/ui/ParticleField';

/**
 * Cursor-reactive confetti particle field behind the hero. Colorful on both
 * light and dark surfaces, so it renders in either theme.
 */
export function HeroBackdrop() {
  return <ParticleField className="absolute inset-0 h-full w-full" />;
}
