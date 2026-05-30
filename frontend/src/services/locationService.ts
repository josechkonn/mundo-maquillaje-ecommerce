import { api } from "../lib/api";

export interface LocationItem {
  id: string;
  name: string;
}

export const locationService = {
  getStates: async (): Promise<LocationItem[]> => {
    return api.get("/locations/states");
  },

  getMunicipalities: async (stateId: string, search?: string): Promise<LocationItem[]> => {
    const params = new URLSearchParams({ stateId });
    if (search) params.append("search", search);
    return api.get(`/locations/municipalities?${params}`);
  },

  getParishes: async (municipalityId: string, search?: string): Promise<LocationItem[]> => {
    const params = new URLSearchParams({ municipalityId });
    if (search) params.append("search", search);
    return api.get(`/locations/parishes?${params}`);
  },
};
