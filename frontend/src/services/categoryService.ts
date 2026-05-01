import { api } from "../lib/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  parent?: Category;
}

export const categoryService = {
  /**
   * Obtiene todas las categorías activas
   */
  getAllCategories: async (): Promise<Category[]> => {
    return api.get("/categories");
  },

  /**
   * Obtiene una categoría por ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    return api.get(`/categories/${id}`);
  },

  /**
   * Crea una nueva categoría (Admin)
   */
  createCategory: async (category: Partial<Category>): Promise<Category> => {
    return api.post("/categories", category);
  },

  /**
   * Actualiza una categoría (Admin)
   */
  updateCategory: async (id: string, category: Partial<Category>): Promise<Category> => {
    return api.put(`/categories/${id}`, category);
  },

  /**
   * Elimina una categoría (Admin)
   */
  deleteCategory: async (id: string): Promise<void> => {
    return api.delete(`/categories/${id}`);
  }
};
