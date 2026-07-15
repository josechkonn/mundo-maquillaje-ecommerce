import { create } from "zustand";
import { 
  type Address, 
  type ShippingMethod, 
  type PaymentMethod, 
  checkoutService
} from "../services/checkoutService";

interface CheckoutState {
  // Datos de Configuración
  addresses: Address[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;

  // Selecciones del Usuario
  selectedAddressId: string | null;
  selectedShippingId: string | null;
  selectedPaymentId: string | null;
  paymentReference: string;
  receiptUrl: string;

  // Acciones
  fetchConfig: () => Promise<void>;
  setSelectedAddress: (id: string) => void;
  setSelectedShipping: (id: string) => void;
  setSelectedPayment: (id: string) => void;
  setPaymentReference: (ref: string) => void;
  setReceiptUrl: (url: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  addresses: [],
  shippingMethods: [],
  paymentMethods: [],
  isLoading: false,

  selectedAddressId: null,
  selectedShippingId: null,
  selectedPaymentId: null,
  paymentReference: "",
  receiptUrl: "",

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const config = await checkoutService.getConfig();
      console.log("Checkout Config cargada:", config);

      if (!config) {
        throw new Error("La configuración del checkout llegó vacía");
      }

      set({ 
        addresses: config.addresses || [],
        shippingMethods: config.shippingMethods || [],
        paymentMethods: config.paymentMethods || [],
        selectedAddressId: config.addresses?.length > 0 ? config.addresses[0].id : null,
        selectedShippingId: config.shippingMethods?.length > 0 ? config.shippingMethods[0].id : null,
        selectedPaymentId: null,
      });
    } catch (error) {
      console.error("Error al cargar configuración de checkout", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedAddress: (id) => set({ selectedAddressId: id }),
  setSelectedShipping: (id) => set({ selectedShippingId: id }),
  setSelectedPayment: (id) => set({ selectedPaymentId: id }),
  setPaymentReference: (ref) => set({ paymentReference: ref }),
  setReceiptUrl: (url) => set({ receiptUrl: url }),

  reset: () => set({
    selectedAddressId: null,
    selectedShippingId: null,
    selectedPaymentId: null,
    paymentReference: "",
    receiptUrl: "",
  }),
}));
