import { api } from "../lib/api";

export interface AddressData {
  id?: string;
  name: string;
  fullname: string;
  phone: string;
  direction: string;
  municipality: string;
  parish: string;
  city: string;
  state: string;
}

export const addressService = {
  getAll: async (): Promise<AddressData[]> => {
    return api.get("/addresses");
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
