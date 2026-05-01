import { api } from "../lib/api";

export interface StoreConfig {
  id: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  hoursMonFri: string;
  hoursSat: string;
  hoursSun: string;
}

export const configService = {
  /**
   * Obtiene la configuración global de la tienda
   */
  getConfig: async (): Promise<StoreConfig> => {
    return api.get("/config");
  },

  /**
   * Actualiza la configuración global (Admin)
   */
  updateConfig: async (config: Partial<StoreConfig>): Promise<StoreConfig> => {
    return api.put("/config", config);
  }
};
