import { api } from "../lib/api";
import type { Product } from "./productService";

export interface ProductCollection {
  id: string;
  title: string;
  description: string;
  extraDescription?: string;
  imageUrl?: string;
  product?: Product;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const collectionService = {
  /**
   * Obtiene todas las colecciones activas para el home
   */
  getActiveCollections: async (): Promise<ProductCollection[]> => {
    return api.get("/collections");
  },

  /**
   * Obtiene todas las colecciones (Admin)
   */
  getAllCollections: async (): Promise<ProductCollection[]> => {
    return api.get("/collections/all");
  },

  /**
   * Crea una nueva colección (Admin)
   */
  createCollection: async (collection: Partial<ProductCollection>): Promise<ProductCollection> => {
    return api.post("/collections", collection);
  },

  /**
   * Actualiza una colección (Admin)
   */
  updateCollection: async (id: string, collection: Partial<ProductCollection>): Promise<ProductCollection> => {
    return api.put(`/collections/${id}`, collection);
  },

  /**
   * Elimina una colección (Admin)
   */
  deleteCollection: async (id: string): Promise<void> => {
    return api.delete(`/collections/${id}`);
  }
};
