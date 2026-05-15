import { api } from "../lib/api";

export interface CartProductServer {
  id: string;
  variation: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    description?: string;
    attributeName?: string;
    attributeValue?: string;
    hexColor?: string;
    isActive: boolean;
    images: { id: string; urlImage: string; order: number; altText: string; isMain: boolean }[];
  };
  quantity: number;
  addedAt: string;
}

export const cartService = {
  getCart: async (): Promise<CartProductServer[]> => {
    return api.get("/cart");
  },

  addToCart: async (variationId: string, quantity: number): Promise<CartProductServer> => {
    return api.post("/cart", { variationId, quantity });
  },

  updateQuantity: async (id: string, quantity: number): Promise<CartProductServer | null> => {
    return api.put(`/cart/${id}`, { quantity });
  },

  removeFromCart: async (id: string): Promise<void> => {
    return api.delete(`/cart/${id}`);
  },

  clearCart: async (): Promise<void> => {
    return api.delete("/cart");
  },

  syncCart: async (items: { variationId: string; quantity: number }[]): Promise<CartProductServer[]> => {
    return api.post("/cart/sync", items);
  },
};
