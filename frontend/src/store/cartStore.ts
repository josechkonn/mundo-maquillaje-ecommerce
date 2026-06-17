import { create } from "zustand";
import { cartService, type CartProductServer } from "../services/cartService";
import { discountService, type DiscountValidationResult } from "../services/discountService";
import { trackingService } from "../services/trackingService";
import { useCurrencyStore } from "./currencyStore";

const LOCAL_KEY = "mundo-maquillaje-cart";

interface LocalCartData {
  items: CartItem[];
  discountCode: string | null;
  discountInfo: DiscountInfo | null;
}

function saveToLocal(data: LocalCartData) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch { }
}

function loadFromLocal(): LocalCartData | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { items: data.items || [], discountCode: data.discountCode ?? null, discountInfo: data.discountInfo ?? null };
  } catch { return null; }
}

export function removeLocalCart() {
  try { localStorage.removeItem(LOCAL_KEY); } catch { }
}

function mapServerItem(si: CartProductServer): CartItem {
  return {
    serverId: si.id,
    variationId: si.variation.id,
    productId: si.productId || "",
    productName: si.productName || si.variation.name,
    productSlug: si.productSlug || "",
    variationName: si.variation.attributeValue || si.variation.name,
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
}

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

  setIsDrawerOpen: (open: boolean) => void;
  loadCart: (useBackend?: boolean) => Promise<void>;
  migrateToBackend: () => Promise<void>;
  saveForGuest: () => void;
  addItem: (item: CartItem, useBackend?: boolean) => Promise<void>;
  removeItem: (variationId: string, useBackend?: boolean) => Promise<void>;
  updateQuantity: (variationId: string, qty: number, useBackend?: boolean) => Promise<void>;
  clearCart: (useBackend?: boolean) => Promise<void>;
  applyDiscount: (code: string, subtotal: number) => Promise<DiscountValidationResult>;
  removeDiscount: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

/** Helper: persist current state to localStorage */
function persistState(get: () => CartState) {
  const state = get();
  saveToLocal({ items: state.items, discountCode: state.discountCode, discountInfo: state.discountInfo });
}

/**
 * Merges a server-returned item into the current items array.
 * Replaces the item with matching variationId, or appends if not found.
 * This ensures serverId is always in sync with the backend.
 */
function mergeServerItemIntoState(items: CartItem[], serverItem: CartProductServer): CartItem[] {
  const mapped = mapServerItem(serverItem);
  const idx = items.findIndex(i => i.variationId === mapped.variationId);
  const updated = [...items];
  if (idx >= 0) {
    // Preserve local-only fields (imageUrl, productSlug etc.) but take quantity and serverId from server
    updated[idx] = { ...updated[idx], ...mapped };
  } else {
    updated.push(mapped);
  }
  return updated;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  discountCode: null,
  discountInfo: null,
  isDrawerOpen: false,

  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

  loadCart: async (useBackend = false) => {
    if (useBackend) {
      try {
        const serverItems = await cartService.getCart();
        const mapped = serverItems.map(mapServerItem);
        set({ items: mapped });
        return;
      } catch { }
    }
    const local = loadFromLocal();
    if (local) {
      set({ items: local.items, discountCode: local.discountCode, discountInfo: local.discountInfo });
    } else {
      set({ items: [], discountCode: null, discountInfo: null });
    }
  },

  migrateToBackend: async () => {
    const items = get().items || [];
    if (items.length > 0) {
      await cartService.syncCart(items.map(i => ({ variationId: i.variationId, quantity: i.quantity })));
    }
    removeLocalCart();
    await get().loadCart(true);
  },

  saveForGuest: () => {
    persistState(get);
  },

  addItem: async (item, useBackend = false) => {
    const items = get().items || [];
    const previousItems = [...items];
    const previousDiscount = { discountCode: get().discountCode, discountInfo: get().discountInfo };

    // Optimistic update: add or increase quantity locally
    const existingIndex = items.findIndex(i => i.variationId === item.variationId);
    let optimisticItems: CartItem[];

    if (existingIndex >= 0) {
      optimisticItems = [...items];
      const existing = optimisticItems[existingIndex];
      const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
      optimisticItems[existingIndex] = { ...existing, quantity: newQty };
    } else {
      optimisticItems = [...items, item];
    }

    set({ items: optimisticItems, discountCode: null, discountInfo: null });
    trackingService.trackAddToCart(item.productId).catch(() => {});

    if (useBackend) {
      try {
        // Always call addToCart with ONLY the new quantity being added.
        // The backend handles merging with existing quantities.
        const serverItem = await cartService.addToCart(item.variationId, item.quantity);
        // Use server response as source of truth, merge into current state
        const currentItems = get().items;
        const merged = mergeServerItemIntoState(currentItems, serverItem);
        set({ items: merged });
      } catch (e: any) {
        // Rollback on error
        set({ items: previousItems, ...previousDiscount });
        throw e;
      }
    }
    persistState(get);
  },

  removeItem: async (variationId, useBackend = false) => {
    const items = get().items || [];
    const previousItems = [...items];
    const previousDiscount = { discountCode: get().discountCode, discountInfo: get().discountInfo };
    const itemToRemove = items.find(i => i.variationId === variationId);
    const updated = items.filter(i => i.variationId !== variationId);

    // Optimistic removal
    set({ items: updated, discountCode: null, discountInfo: null });

    if (useBackend && itemToRemove?.serverId) {
      try {
        await cartService.removeFromCart(itemToRemove.serverId);
      } catch {
        // Rollback on error
        set({ items: previousItems, ...previousDiscount });
        persistState(get);
        return;
      }
    }
    persistState(get);
  },

  updateQuantity: async (variationId, qty, useBackend = false) => {
    const items = get().items || [];
    const previousItems = [...items];
    const previousDiscount = { discountCode: get().discountCode, discountInfo: get().discountInfo };
    const idx = items.findIndex(i => i.variationId === variationId);
    if (idx < 0) return;

    if (qty <= 0) {
      await get().removeItem(variationId, useBackend);
      return;
    }

    const updated = [...items];
    const item = updated[idx];
    const clampedQty = Math.min(qty, item.maxStock);
    updated[idx] = { ...item, quantity: clampedQty };

    // Optimistic update
    set({ items: updated, discountCode: null, discountInfo: null });

    if (useBackend && item.serverId) {
      try {
        const serverItem = await cartService.updateQuantity(item.serverId, clampedQty);
        if (serverItem) {
          // Merge server response
          const currentItems = get().items;
          const merged = mergeServerItemIntoState(currentItems, serverItem);
          set({ items: merged });
        }
      } catch {
        // Rollback on error
        set({ items: previousItems, ...previousDiscount });
        persistState(get);
        return;
      }
    }
    persistState(get);
  },

  clearCart: async (useBackend = false) => {
    const previousItems = [...(get().items || [])];
    const previousDiscount = { discountCode: get().discountCode, discountInfo: get().discountInfo };
    set({ items: [], discountCode: null, discountInfo: null });
    if (useBackend) {
      try {
        await cartService.clearCart();
      } catch {
        set({ items: previousItems, ...previousDiscount });
        persistState(get);
        return;
      }
    }
    saveToLocal({ items: [], discountCode: null, discountInfo: null });
  },

  applyDiscount: async (code, subtotal) => {
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

  getItemCount: () => (get().items || []).reduce((acc, item) => acc + item.quantity, 0),
  getSubtotal: () => (get().items || []).reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
