import api from '@/lib/api';

// AI-assisted learning: UI-level placeholder wired to a backend endpoint.
// The backend is expected to proxy to an LLM provider and return a reply.
export const aiService = {
  ask: (payload: { question: string; courseId?: string; context?: string }) =>
    api.post<{ answer: string }>('/ai/assist', payload).then((r) => r.data),
};
