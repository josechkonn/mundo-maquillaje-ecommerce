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

  /**
   * Crea una nueva marca (Admin)
   */
  createBrand: async (brand: Partial<Brand>): Promise<Brand> => {
    return api.post("/brands", brand);
  },

  /**
   * Actualiza una marca (Admin)
   */
  updateBrand: async (id: string, brand: Partial<Brand>): Promise<Brand> => {
    return api.put(`/brands/${id}`, brand);
  },

  /**
   * Elimina una marca (Admin)
   */
  deleteBrand: async (id: string): Promise<void> => {
    return api.delete(`/brands/${id}`);
  },
};
