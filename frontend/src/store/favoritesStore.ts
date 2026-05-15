import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Product } from "../services/productService";
import { favoriteService } from "../services/favoriteService";

interface FavoritesState {
  favorites: Product[];
  addFavorite: (product: Product, authenticated?: boolean) => Promise<void>;
  removeFavorite: (productId: string, authenticated?: boolean) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  syncFavorites: () => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: async (product, authenticated = false) => {
        const { favorites } = get();
        if (!favorites.find((p) => p.id === product.id)) {
          set({ favorites: [...favorites, product] });
          if (authenticated) {
            try {
              await favoriteService.addFavorite(product.id);
            } catch (error) {
              console.error("Error syncing favorite to server:", error);
            }
          }
        }
      },
      
      removeFavorite: async (productId, authenticated = false) => {
        const { favorites } = get();
        set({ favorites: favorites.filter((p) => p.id !== productId) });
        if (authenticated) {
          try {
            await favoriteService.removeFavorite(productId);
          } catch (error) {
            console.error("Error removing favorite from server:", error);
          }
        }
      },
      
      isFavorite: (productId) => {
        const { favorites } = get();
        return favorites.some((p) => p.id === productId);
      },

      syncFavorites: async () => {
        try {
          const serverFavorites = await favoriteService.getFavorites();
          set({ favorites: serverFavorites });
        } catch (error) {
          console.error("Error syncing favorites from server:", error);
        }
      },
      
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "mundo-maquillaje-favorites",
    }
  )
);
