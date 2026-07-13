import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/services/auth.service';
import { tokenStorage } from '@/lib/auth';
import type { LoginPayload, RegisterPayload, User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

// Persisted so the last-known user renders immediately on refresh while
// `hydrate()` re-validates against the API in the background.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken, refreshToken, user } = await authService.login(payload);
          tokenStorage.setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err: any) {
          const message = err?.response?.data?.message ?? 'Unable to sign in. Check your credentials.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken, refreshToken, user } = await authService.register(payload);
          tokenStorage.setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err: any) {
          const data = err?.response?.data;
          const message = data?.error ?? data?.message ?? err?.message ?? 'Unable to create your account.';
          set({ error: Array.isArray(message) ? message.join('; ') : message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // best-effort: clear local session regardless of API result
        }
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      hydrate: async () => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'lms-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
