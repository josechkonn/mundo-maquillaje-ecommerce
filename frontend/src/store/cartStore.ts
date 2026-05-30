import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartService } from "../services/cartService";
import { discountService, type DiscountValidationResult } from "../services/discountService";
import { trackingService } from "../services/trackingService";
import { toastError } from "../lib/toasts";
import { useCurrencyStore } from "./currencyStore";

export interface CartItem {
  serverId?: string;
  variationId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variationName: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl: string;
  hexColor?: string;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  currencyDecimalPlaces: number;
  currencySymbolPosition: string;
  currencyExchangeRate: number;
}

export interface DiscountInfo {
  discountId: string;
  code: string;
  type: "PERCENTAGE" | "FLAT_AMOUNT";
  value: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discountInfo: DiscountInfo | null;
  isDrawerOpen: boolean;

  // Actions
  setIsDrawerOpen: (open: boolean) => void;
  addItem: (item: CartItem, authenticated?: boolean) => Promise<void>;
  removeItem: (variationId: string, authenticated?: boolean) => Promise<void>;
  updateQuantity: (variationId: string, qty: number, authenticated?: boolean) => Promise<void>;
  clearCart: (authenticated?: boolean) => Promise<void>;
  applyDiscount: (code: string, subtotal: number) => Promise<DiscountValidationResult>;
  removeDiscount: () => void;
  syncCart: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: null,
      discountInfo: null,
      isDrawerOpen: false,

      setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

      addItem: async (item, authenticated = false) => {
        const { items } = get();
        const previousItems = [...items];
        const existingIndex = items.findIndex(i => i.variationId === item.variationId);
        let updated: CartItem[];

        if (existingIndex >= 0) {
          updated = [...items];
          const existing = updated[existingIndex];
          const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
          updated[existingIndex] = { ...existing, quantity: newQty };
        } else {
          updated = [...items, item];
        }

        set({ items: updated, discountCode: null, discountInfo: null });
        trackingService.trackAddToCart(item.productId).catch(() => {});

        if (authenticated) {
          try {
            if (existingIndex >= 0) {
              const existing = updated[existingIndex];
              if (existing.serverId) {
                await cartService.updateQuantity(existing.serverId, existing.quantity);
              } else {
                await cartService.addToCart(item.variationId, existing.quantity);
              }
            } else {
              const serverItem = await cartService.addToCart(item.variationId, item.quantity);
              const { items: current } = get();
              const idx = current.findIndex(i => i.variationId === item.variationId);
              if (idx >= 0) {
                const refreshed = [...current];
                refreshed[idx] = { ...refreshed[idx], serverId: serverItem.id };
                set({ items: refreshed });
              }
            }
          } catch (e: any) {
            set({ items: previousItems });
            throw e;
          }
        }
      },

      removeItem: async (variationId, authenticated = false) => {
        const { items } = get();
        const itemToRemove = items.find(i => i.variationId === variationId);
        const updated = items.filter(i => i.variationId !== variationId);
        
        set({ items: updated, discountCode: null, discountInfo: null });

        if (authenticated && itemToRemove?.serverId) {
          try { await cartService.removeFromCart(itemToRemove.serverId); } catch (e) {}
        }
      },

      updateQuantity: async (variationId, qty, authenticated = false) => {
        const { items } = get();
        const idx = items.findIndex(i => i.variationId === variationId);
        if (idx < 0) return;

        if (qty <= 0) {
          get().removeItem(variationId, authenticated);
          return;
        }

        const updated = [...items];
        const item = updated[idx];
        updated[idx] = { ...item, quantity: Math.min(qty, item.maxStock) };
        set({ items: updated, discountCode: null, discountInfo: null });

        if (authenticated && item.serverId) {
          try { await cartService.updateQuantity(item.serverId, qty); } catch (e) {}
        }
      },

      clearCart: async (authenticated = false) => {
        set({ items: [], discountCode: null, discountInfo: null });
        if (authenticated) {
          try {
            await cartService.clearCart();
          } catch (e: any) {
            console.error("Error clearing backend cart:", e);
            setTimeout(async () => {
              try { await cartService.clearCart(); } catch (retryErr) {
                console.error("Retry clearCart failed:", retryErr);
              }
            }, 2000);
          }
        }
      },

      applyDiscount: async (code: string, subtotal: number) => {
        const currencyCode = useCurrencyStore.getState().selectedCurrency?.code;
        const result = await discountService.validateDiscount(code, subtotal, currencyCode);
        if (result.valid && result.discountId) {
          set({
            discountCode: code,
            discountInfo: {
              discountId: result.discountId,
              code: result.code!,
              type: result.type!,
              value: result.value!,
              discountAmount: result.discountAmount!,
            },
          });
        } else {
          set({ discountCode: null, discountInfo: null });
        }
        return result;
      },

      removeDiscount: () => set({ discountCode: null, discountInfo: null }),

      syncCart: async () => {
        const { items } = get();
        try {
          const localPayload = items.map(i => ({ variationId: i.variationId, quantity: i.quantity }));
          const serverItems = await cartService.syncCart(localPayload);

          if (serverItems && serverItems.length > 0) {
            const synced: CartItem[] = serverItems.map(si => {
              const local = items.find(i => i.variationId === si.variation.id);

              if (local) {
                return {
                  ...local,
                  serverId: si.id,
                  quantity: si.quantity,
                  variationName: si.variation.name,
                  price: si.variation.price,
                  maxStock: si.variation.stock,
                  hexColor: si.variation.hexColor ?? local.hexColor,
                };
              }

              return {
                serverId: si.id,
                variationId: si.variation.id,
                productId: si.productId || "",
                productName: si.productName || si.variation.name,
                productSlug: si.productSlug || "",
                variationName: si.variation.name,
                price: si.variation.price,
                quantity: si.quantity,
                maxStock: si.variation.stock,
                imageUrl: si.variation.images?.[0]?.urlImage || "/placeholder-product.png",
                hexColor: si.variation.hexColor,
                currencyId: si.currencyId || "",
                currencyCode: si.currencyCode || "",
                currencySymbol: si.currencySymbol || "",
                currencyDecimalPlaces: si.currencyDecimalPlaces ?? 0,
                currencySymbolPosition: si.currencySymbolPosition || "LEFT",
                currencyExchangeRate: si.currencyExchangeRate || 1,
              };
            });
            set({ items: synced });
          }
        } catch (error) {
          // Sync silencioso — se mantiene el estado local intacto
        }
      },

      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "mundo-maquillaje-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
        discountInfo: state.discountInfo,
      }),
    }
  )
);
