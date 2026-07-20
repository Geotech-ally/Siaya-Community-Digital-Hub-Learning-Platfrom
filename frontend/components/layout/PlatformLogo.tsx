import { PLATFORM_NAME } from '@/lib/brand';

/**
 * Brand symbol: a connected-node "hub" mark distilled from the Siaya Community
 * Digital Hub identity (green core node, orange satellite nodes, linked). Inline
 * SVG so it stays razor-sharp at any size, has a transparent background (works on
 * light and dark), and never shows the old JPEG white box.
 */
function HubMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hubLink" x1="20" y1="7" x2="20" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2BA24A" />
          <stop offset="1" stopColor="#ED8A1F" />
        </linearGradient>
      </defs>
      {/* links (behind the nodes) */}
      <g stroke="url(#hubLink)" strokeWidth="2.4" strokeLinecap="round">
        <line x1="20" y1="19" x2="20" y2="7.5" />
        <line x1="20" y1="19" x2="9.5" y2="29.5" />
        <line x1="20" y1="19" x2="30.5" y2="29.5" />
      </g>
      {/* satellite nodes */}
      <circle cx="20" cy="7" r="3.5" fill="#ED8A1F" />
      <circle cx="9.5" cy="30" r="3.5" fill="#ED8A1F" />
      <circle cx="30.5" cy="30" r="3.5" fill="#ED8A1F" />
      {/* core node */}
      <circle cx="20" cy="19" r="6.4" fill="#2BA24A" />
      <circle cx="20" cy="19" r="2.5" fill="#fff" />
    </svg>
  );
}

export function PlatformLogo({
  size = 'md',
  // kept for call-site compatibility; inline SVG needs no image priority hint
  priority: _priority = false,
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
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-ink-900/10 dark:bg-white/[0.06] dark:ring-white/10 ${sizes[size]} ${className}`}
      aria-label={`${PLATFORM_NAME} logo`}
    >
      <HubMark className="h-full w-full" />
    </span>
  );
}
