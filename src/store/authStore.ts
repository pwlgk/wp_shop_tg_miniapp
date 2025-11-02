// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenPair } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: TokenPair) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) => {
        console.groupCollapsed(`[AuthStore] Action: setTokens`);
        console.log("Payload received:", tokens);

        if (!tokens || !tokens.access_token || !tokens.refresh_token) {
          console.error("CRITICAL: Invalid or incomplete token object received. Aborting setTokens.");
          console.groupEnd();
          return;
        }

        console.log("Current state before set:", get());
        set({ 
          accessToken: tokens.access_token, 
          refreshToken: tokens.refresh_token 
        });
        console.log("Set operation completed.");

        // Используем setTimeout, чтобы гарантировать, что состояние обновилось
        setTimeout(() => {
          const newState = get();
          console.log("New state after set:", newState);
          if (!newState.refreshToken) {
            console.error("CRITICAL FAILURE: refreshToken is still null after set operation!");
          }
          console.groupEnd();
        }, 0);
      },
      logout: () => {
        console.groupCollapsed(`[AuthStore] Action: logout`);
        console.log("Current state before logout:", get());
        set({ accessToken: null, refreshToken: null });
        console.log("Cleared tokens.");
        console.groupEnd();
      },
    }),
    {
      name: 'auth-storage', // Ключ в localStorage
    }
  )
);