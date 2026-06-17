import { api } from "../lib/api";

export interface Banner {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export const bannerService = {
  /**
   * Obtiene los banners activos para mostrar en el home slider
   */
  getActiveBanners: async (): Promise<Banner[]> => {
    return api.get("/banners");
  },

  /**
   * Obtiene todos los banners (Solo para Admin)
   */
  getAllBanners: async (): Promise<Banner[]> => {
    return api.get("/banners/all");
  },

  /**
   * Crea un nuevo banner (Solo para Admin)
   */
  createBanner: async (banner: Omit<Banner, "id">): Promise<Banner> => {
    return api.post("/banners", banner);
  },

  /**
   * Actualiza un banner existente (Solo para Admin)
   */
  updateBanner: async (id: string, banner: Partial<Banner>): Promise<Banner> => {
    return api.put(`/banners/${id}`, banner);
  },

  /**
   * Elimina un banner (Solo para Admin)
   */
  deleteBanner: async (id: string): Promise<void> => {
    return api.delete(`/banners/${id}`);
  }
};
