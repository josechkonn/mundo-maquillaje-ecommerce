import { api } from "../lib/api";

export const trackingService = {
  trackEvent: async (eventType: string, productId?: string, metadata?: Record<string, unknown>) => {
    const sessionId = crypto.randomUUID();
    return api.post("/tracking/event", {
      eventType,
      productId,
      sessionId,
      metadata,
    });
  },

  trackPageView: async () => trackingService.trackEvent("PAGE_VIEW"),
  trackProductView: async (productId: string) => trackingService.trackEvent("PRODUCT_VIEW", productId),
  trackAddToCart: async (productId: string) => trackingService.trackEvent("ADD_TO_CART", productId),
  trackCheckoutStart: async () => trackingService.trackEvent("CHECKOUT_START"),
  trackPurchase: async () => trackingService.trackEvent("PURCHASE"),
};
