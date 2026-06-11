import { api } from "../lib/api";
import type { Currency } from "./productService";

export interface CashRegister {
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const cashRegisterService = {
  getAllCashRegisters: async (): Promise<CashRegister[]> => {
    return api.get("/cash-registers");
  },

  getCashRegisterById: async (id: string): Promise<CashRegister> => {
    return api.get(`/cash-registers/${id}`);
  },

  createCashRegister: async (data: { name: string; description?: string; currencyId: string; isActive?: boolean }): Promise<CashRegister> => {
    return api.post("/cash-registers", data);
  },

  updateCashRegister: async (id: string, data: { name: string; description?: string; currencyId: string; isActive?: boolean }): Promise<CashRegister> => {
    return api.put(`/cash-registers/${id}`, data);
  },

  deleteCashRegister: async (id: string): Promise<void> => {
    return api.delete(`/cash-registers/${id}`);
  },

  deposit: async (id: string, data: { amount: number; description?: string; reference?: string }): Promise<Transaction> => {
    return api.post(`/transactions/${id}/deposit`, data);
  },

  withdraw: async (id: string, data: { amount: number; description?: string; reference?: string }): Promise<Transaction> => {
    return api.post(`/transactions/${id}/withdraw`, data);
  },

  getTransactions: async (id: string): Promise<Transaction[]> => {
    return api.get(`/transactions/cash-register/${id}`);
  },
};

export interface Transaction {
  id: string;
  type: "ORDER_PAYMENT" | "DEPOSIT" | "WITHDRAW";
  amount: number;
  description?: string;
  reference?: string;
  receiptUrl?: string;
  status: "PENDING" | "COMPLETED" | "VERIFIED" | "REJECTED" | "CANCELLED";
  currency: Currency;
  paymentMethod?: {
    id: string;
    name: string;
    slug: string;
  };
  cashRegister?: CashRegister;
  order?: {
    id: string;
    orderNumber?: string;
  };
  createdAt: string;
  updatedAt?: string;
}
