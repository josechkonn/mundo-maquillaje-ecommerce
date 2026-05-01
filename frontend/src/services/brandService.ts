import { api } from "../lib/api";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const brandService = {
  /**
   * Obtiene todas las marcas activas
   */
  getAllBrands: async (): Promise<Brand[]> => {
    return api.get("/brands");
  },

  /**
   * Obtiene una marca por ID
   */
  getBrandById: async (id: string): Promise<Brand> => {
    return api.get(`/brands/${id}`);
  },

  // Los métodos de admin (create, update, delete) se omiten por ahora 
  // ya que esta tarea se enfoca en la visualización del home.
};
