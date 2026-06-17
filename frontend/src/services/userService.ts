import { api } from "../lib/api";

export interface StateRef {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
  state?: StateRef;
  createdAt?: string;
  updatedAt?: string;
  lastAccessAt?: string;
}

export interface UsersResponse {
  content: UserProfile[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const userService = {
  getUsers: async (params: {
    search?: string;
    role?: string;
    stateId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<UsersResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.stateId) query.set("stateId", params.stateId);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortDir) query.set("sortDir", params.sortDir);

    return api.get(`/admin/users?${query.toString()}`);
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    return api.get(`/admin/users/${id}`);
  },

  createUser: async (user: Partial<UserProfile>): Promise<UserProfile> => {
    return api.post("/admin/users", user);
  },

  updateUser: async (id: string, user: Partial<UserProfile>): Promise<UserProfile> => {
    return api.put(`/admin/users/${id}`, user);
  },

  deleteUser: async (id: string): Promise<void> => {
    return api.delete(`/admin/users/${id}`);
  },

  updateRole: async (id: string, role: "USER" | "EMPLOYEE" | "ADMIN"): Promise<UserProfile> => {
    return api.patch(`/admin/users/${id}/role`, { role });
  },

  getStats: async (): Promise<{ total: number; admins: number; employees: number; users: number }> => {
    return api.get("/admin/users/stats");
  },
};
