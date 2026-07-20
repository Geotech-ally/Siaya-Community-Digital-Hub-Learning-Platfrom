'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Role } from '@/types';
import { cn } from '@/common/utils/cn';
import { SidebarContent } from './Sidebar';

/**
 * Animated slide-over navigation for < lg screens. Kept mounted so it can
 * animate both in and out; closed state is inert (pointer-events-none +
 * aria-hidden). Closes on overlay tap, Escape, or link navigation.
 */
export function MobileSidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={cn('fixed inset-0 z-50 lg:hidden', open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-ink-900/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-ink-500 hover:bg-surface-subtle hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent role={role} onNavigate={onClose} />
      </div>
    </div>
  );
}
