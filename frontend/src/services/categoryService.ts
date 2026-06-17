import { api } from "../lib/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  subBannerUrl?: string;
  isActive: boolean;
  parent?: Category;
}

export const categoryService = {
  /**
   * Obtiene todas las categorías, opcionalmente filtradas
   */
  getAllCategories: async (parentId?: string, isActive?: boolean, onlyMain?: boolean): Promise<Category[]> => {
    let url = "/categories";
    const params = new URLSearchParams();
    if (parentId) params.append("parentId", parentId);
    if (isActive !== undefined) params.append("isActive", isActive.toString());
    if (onlyMain) params.append("onlyMain", "true");
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    return api.get(url);
  },

  /**
   * Obtiene una categoría por ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    return api.get(`/categories/${id}`);
  },

  /**
   * Obtiene una categoría por Slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return api.get(`/categories/slug/${slug}`);
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
  },

  /**
   * Genera el path completo anidado de una categoría
   */
  getCategoryPath: (category: Category): string => {
    const slugs: string[] = [category.slug];
    let current = category.parent;
    while (current) {
      slugs.unshift(current.slug);
      current = current.parent;
    }
    return `/${slugs.join("/")}`;
  }
};
