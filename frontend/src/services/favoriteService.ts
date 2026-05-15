import { api } from "../lib/api";
import { type Product } from "./productService";

export const favoriteService = {
  getFavorites: async (): Promise<Product[]> => {
    return api.get("/favorites");
  },

  addFavorite: async (productId: string): Promise<void> => {
    return api.post(`/favorites/${productId}`, {});
  },

  removeFavorite: async (productId: string): Promise<void> => {
    return api.delete(`/favorites/${productId}`);
  }
};
