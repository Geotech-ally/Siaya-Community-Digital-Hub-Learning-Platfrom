'use client';

import { useEffect } from 'react';

/**
 * Disables copy, cut, paste, and the context menu for the whole document while
 * an assessment (quiz/assignment) is in progress. This prevents learners from
 * pasting answers or copying question text out during graded attempts.
 */
export function useSecureAssessment(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const block = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('contextmenu', block);

    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('contextmenu', block);
    };
  }, [enabled]);
}
