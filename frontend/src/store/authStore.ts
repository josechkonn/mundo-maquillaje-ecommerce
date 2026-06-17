import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useFavoritesStore } from "./favoritesStore";
import { useCartStore } from "./cartStore";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: "USER" | "ADMIN";
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchProfile: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const profile = await res.json();
        set({ profile });
      } else {
        set({ profile: null });
      }
    } catch {
      set({ profile: null });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut({ scope: "local" });
    set({ user: null, session: null, profile: null });
    useFavoritesStore.getState().clearFavorites();
  },

  initializeAuthListener: () => {
    const syncTokensWithBackend = async (accessToken: string | null, refreshToken: string | null) => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/sync-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken, refreshToken }),
        });
      } catch (error) {
        console.error("Fallo al sincronizar cookies seguras con Spring Boot:", error);
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      set({ session, user });
      if (session) {
        syncTokensWithBackend(session.access_token, session.refresh_token);
        const profilePromise = get().fetchProfile();
        useFavoritesStore.getState().syncFavorites();
        await profilePromise;
      } else {
        useCartStore.getState().loadCart(false);
      }
      set({ isLoading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, freshSession) => {
        const user = freshSession?.user ?? null;
        set({ session: freshSession, user });

        if (freshSession) {
          syncTokensWithBackend(freshSession.access_token, freshSession.refresh_token);

          if (event === 'INITIAL_SESSION') return;

          if (event === 'SIGNED_IN') {
            set({ isLoading: true });
            useCartStore.getState().migrateToBackend();
          }

          get().fetchProfile().finally(() => set({ isLoading: false }));
          useFavoritesStore.getState().syncFavorites();
        } else {
          syncTokensWithBackend(null, null);
          set({ profile: null, isLoading: false });
          useFavoritesStore.getState().clearFavorites();
          const cart = useCartStore.getState();
          cart.saveForGuest();
          cart.loadCart(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
}));
