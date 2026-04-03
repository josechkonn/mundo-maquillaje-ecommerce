import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),

  initializeAuthListener: () => {
    const syncTokensWithBackend = async (accessToken: string | null, refreshToken: string | null) => {
      try {
        await fetch("http://localhost:8080/api/auth/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
        });
      } catch (error) {
        console.error("Fallo al sincronizar cookies seguras con Spring Boot:", error);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false });
      if (session) {
        syncTokensWithBackend(session.access_token, session.refresh_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, freshSession) => {
        set({ session: freshSession, user: freshSession?.user ?? null });

        if (freshSession) {
          syncTokensWithBackend(freshSession.access_token, freshSession.refresh_token);
        } else {
          syncTokensWithBackend(null, null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
}));
