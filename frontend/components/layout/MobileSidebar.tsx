'use client';

import { X } from 'lucide-react';
import type { Role } from '@/types';
import { Sidebar } from './Sidebar';

export function MobileSidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative z-50 flex w-64 flex-col bg-white">
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-surface-subtle">
          <X className="h-5 w-5" />
        </button>
        <Sidebar role={role} />
      </div>
    </div>
  );
}
