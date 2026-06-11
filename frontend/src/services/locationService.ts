import { api } from "../lib/api";

export interface LocationItem {
  id: string;
  name: string;
}

export interface StateItem {
  id: string;
  name: string;
}

export interface CityItem {
  id: string;
  name: string;
  stateId: string;
}

export interface MunicipalityItem {
  id: string;
  name: string;
  cityId: string;
}

export interface ParishItem {
  id: string;
  name: string;
  municipalityId: string;
}

export const locationService = {
  // ─── READ ───
  getStates: async (): Promise<StateItem[]> => {
    return api.get("/locations/states");
  },

  getCities: async (stateId: string, search?: string): Promise<CityItem[]> => {
    const params = new URLSearchParams({ stateId });
    if (search) params.append("search", search);
    return api.get(`/locations/cities?${params}`);
  },

  getMunicipalities: async (cityId: string, search?: string): Promise<MunicipalityItem[]> => {
    const params = new URLSearchParams({ cityId });
    if (search) params.append("search", search);
    return api.get(`/locations/municipalities?${params}`);
  },

  getParishes: async (municipalityId: string, search?: string): Promise<ParishItem[]> => {
    const params = new URLSearchParams({ municipalityId });
    if (search) params.append("search", search);
    return api.get(`/locations/parishes?${params}`);
  },

  // ─── STATES CRUD ───
  createState: async (data: { name: string }): Promise<StateItem> => {
    return api.post("/locations/states", data);
  },

  updateState: async (id: string, data: { name: string }): Promise<StateItem> => {
    return api.put(`/locations/states/${id}`, data);
  },

  deleteState: async (id: string): Promise<void> => {
    return api.delete(`/locations/states/${id}`);
  },

  // ─── CITIES CRUD ───
  createCity: async (data: { name: string; stateId: string }): Promise<CityItem> => {
    return api.post("/locations/cities", data);
  },

  updateCity: async (id: string, data: { name: string; stateId: string }): Promise<CityItem> => {
    return api.put(`/locations/cities/${id}`, data);
  },

  deleteCity: async (id: string): Promise<void> => {
    return api.delete(`/locations/cities/${id}`);
  },

  // ─── MUNICIPALITIES CRUD ───
  createMunicipality: async (data: { name: string; cityId: string }): Promise<MunicipalityItem> => {
    return api.post("/locations/municipalities", data);
  },

  updateMunicipality: async (id: string, data: { name: string; cityId: string }): Promise<MunicipalityItem> => {
    return api.put(`/locations/municipalities/${id}`, data);
  },

  deleteMunicipality: async (id: string): Promise<void> => {
    return api.delete(`/locations/municipalities/${id}`);
  },

  // ─── PARISHES CRUD ───
  createParish: async (data: { name: string; municipalityId: string }): Promise<ParishItem> => {
    return api.post("/locations/parishes", data);
  },

  updateParish: async (id: string, data: { name: string; municipalityId: string }): Promise<ParishItem> => {
    return api.put(`/locations/parishes/${id}`, data);
  },

  deleteParish: async (id: string): Promise<void> => {
    return api.delete(`/locations/parishes/${id}`);
  },
};
