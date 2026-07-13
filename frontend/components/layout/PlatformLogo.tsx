import Image from 'next/image';
import { PLATFORM_NAME } from '@/lib/brand';

export function PlatformLogo({
  size = 'md',
  priority = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <span className={`relative inline-flex shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-900/10 ${sizes[size]} ${className}`}>
      <Image
        src="/images/hub-logo.jpeg"
        alt={`${PLATFORM_NAME} logo`}
        fill
        sizes={size === 'xl' ? '96px' : size === 'lg' ? '64px' : size === 'md' ? '48px' : '36px'}
        className="object-contain p-1"
        priority={priority}
      />
    </span>
  );
}
