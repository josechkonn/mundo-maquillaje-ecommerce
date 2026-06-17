import { api } from "../lib/api";

export interface StorePillar {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  orderIndex: number;
}

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
  googleMapsEmbed?: string;
  ourEssence?: string;

  // Pillars Section Config
  showPillars?: boolean;
  pillarsTitle?: string;
  pillars?: StorePillar[];

  // Mission and Vision Section Config
  showMissionVision?: boolean;
  showMission?: boolean;
  missionTitle?: string;
  missionContent?: string;

  showVision?: boolean;
  visionTitle?: string;
  visionContent?: string;
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
