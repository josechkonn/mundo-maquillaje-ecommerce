import { api } from "../lib/api";

const getIpAddress = async (): Promise<string> => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "unknown";
  }
};

export const trackingService = {
  trackEvent: async (eventType: string, productId?: string, metadata?: Record<string, unknown>) => {
    const sessionId = crypto.randomUUID();
    const ipAddress = await getIpAddress();
    return api.post("/tracking/event", {
      eventType,
      productId,
      sessionId,
      metadata,
    }, {
      headers: {
        "X-Forwarded-For": ipAddress,
      },
    });
  },

  trackPageView: async () => trackingService.trackEvent("PAGE_VIEW"),
  trackProductView: async (productId: string) => trackingService.trackEvent("PRODUCT_VIEW", productId),
  trackAddToCart: async (productId: string) => trackingService.trackEvent("ADD_TO_CART", productId),
  trackCheckoutStart: async () => trackingService.trackEvent("CHECKOUT_START"),
};
