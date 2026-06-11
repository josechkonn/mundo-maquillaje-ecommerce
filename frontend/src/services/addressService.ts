import { api } from "../lib/api";

export interface AddressData {
  id?: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  city: string;
  cityId?: string;
  stateId: string;
  municipalityId: string;
  parishId: string;
  stateName?: string;
  municipalityName?: string;
  parishName?: string;
}

export const addressService = {
  getAll: async (): Promise<AddressData[]> => {
    return api.get("/addresses");
  },

  getUserAddresses: async (profileId: string): Promise<AddressData[]> => {
    return api.get(`/addresses/admin/${profileId}`);
  },

  create: async (data: AddressData): Promise<AddressData> => {
    return api.post("/addresses", data);
  },

  update: async (id: string, data: AddressData): Promise<AddressData> => {
    return api.put(`/addresses/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/addresses/${id}`);
  },
};
