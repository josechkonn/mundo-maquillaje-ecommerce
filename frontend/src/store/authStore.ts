import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useFavoritesStore } from "./favoritesStore";
import { useCartStore } from "./cartStore";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
    useFavoritesStore.getState().clearFavorites();
    // No borramos el carrito al cerrar sesión para que los productos 
    // se mantengan localmente como invitado.
  },

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
      const user = session?.user ?? null;
      set({ session, user, isLoading: false });
      if (session) {
        syncTokensWithBackend(session.access_token, session.refresh_token);
        useFavoritesStore.getState().syncFavorites();
        useCartStore.getState().syncCart();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, freshSession) => {
        const user = freshSession?.user ?? null;
        set({ session: freshSession, user });

        if (freshSession) {
          syncTokensWithBackend(freshSession.access_token, freshSession.refresh_token);
          useFavoritesStore.getState().syncFavorites();
          useCartStore.getState().syncCart();
        } else {
          syncTokensWithBackend(null, null);
          useFavoritesStore.getState().clearFavorites();
          // No limpiamos el carrito aquí automáticamente para no borrar el de los invitados al recargar
        }
      }
    );

    return () => subscription.unsubscribe();
  },
}));
