import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TicketIcon, ShieldCheckIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCartStore, type CartItem, type DiscountInfo } from "../../store/cartStore";
import { useCurrencyStore } from "../../store/currencyStore";
import { useAuthStore } from "../../store/authStore";
import { convertAndFormatPrice, formatPrice } from "../../lib/formatters";
import { type Currency } from "../../services/productService";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

interface CartSummaryProps {
  items: CartItem[];
  discountInfo: DiscountInfo | null;
  onApplyDiscount: (code: string, subtotal: number) => Promise<any>;
  onRemoveDiscount: () => void;
  shippingCost?: number;
  shippingLabel?: string;
  isCheckout?: boolean;
  onProcessCheckout?: () => void;
}

const CartSummary = ({
  items,
  discountInfo,
  onApplyDiscount,
  onRemoveDiscount,
  shippingCost = 0,
  shippingLabel,
  isCheckout = false,
  onProcessCheckout,
}: CartSummaryProps) => {
  const navigate = useNavigate();
  const { selectedCurrency, currencies } = useCurrencyStore();
  const { user } = useAuthStore();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const diff = startY.current - currentY;
      if (diff > 50) {
        setIsMobileExpanded(true);
        isDragging.current = false;
      } else if (diff < -50) {
        setIsMobileExpanded(false);
        isDragging.current = false;
      }
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Calcular subtotal sumando cada item convertido a la moneda seleccionada
  const calculateSubtotal = () => {
    let total = 0;
    for (const item of items) {
      const itemCurrency: Currency = {
        id: item.currencyId,
        name: "",
        code: item.currencyCode,
        symbol: item.currencySymbol,
        exchangeRate: item.currencyExchangeRate,
        decimalPlaces: item.currencyDecimalPlaces,
        symbolPosition: item.currencySymbolPosition as "LEFT" | "RIGHT",
      };

      total += convertToNumeric(item.price * item.quantity, itemCurrency, selectedCurrency, currencies);
    }
    return total;
  };

  const subtotal = calculateSubtotal();
  
  // Convertimos el costo del envío (que está en USD base) a la moneda seleccionada
  const usdCurrency: Currency = {
    id: "USD",
    name: "US Dollar",
    code: "USD",
    symbol: "$",
    exchangeRate: 1,
    decimalPlaces: 2,
    symbolPosition: "LEFT"
  };

  const convertedShippingCost = convertToNumeric(
    shippingCost,
    usdCurrency,
    selectedCurrency,
    currencies
  );

  // El descuento ya viene calculado en discountAmount (en la moneda en que se aplicó, 
  // usualmente USD o la base del sistema). Necesitamos asegurarnos de que se reste correctamente.
  // Si discountInfo.discountAmount está disponible, lo usamos.
  const discountAmount = discountInfo ? discountInfo.discountAmount : 0;
  
  // El total es subtotal - descuento + envío convertido
  const total = Math.max(0, subtotal - discountAmount + convertedShippingCost);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError(null);
    try {
      const result = await onApplyDiscount(couponCode, subtotal);
      if (!result.valid) {
        setCouponError(result.message || "Cupón inválido");
      } else {
        setCouponCode("");
      }
    } catch (error) {
      setCouponError("Error al aplicar el cupón");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckout = () => {
    if (isCheckout && onProcessCheckout) {
      onProcessCheckout();
    } else if (!user) {
      navigate("/auth/login");
    } else {
      navigate("/finalizar-compra");
    }
  };

  const summaryContent = (
    <>
      <div className="p-8">
        <h3 className="text-center text-h4-s md:text-h4-b font-extrabold text-text-base mb-6">
          Resumen de Compra
        </h3>

        {/* Coupon Input */}
        {!discountInfo && !isCheckout && (
          <div className="mb-6">
            <p className="text-p-xs font-bold text-text-base mb-2">
              ¿Tienes un código de descuento?
            </p>
            <div className="flex gap-2">
              <FormField
                placeholder="Código"
                value={couponCode}
                onChange={(e: any) => setCouponCode(e.target.value)}
                roundedClass="!rounded-2xl"
                className="!py-2.5 !px-4 !text-xs"
                error={couponError || undefined}
              />
              <Button
                variant="primary"
                fullWidth={false}
                onClick={handleApplyCoupon}
                isLoading={isApplying}
                className="!bg-[#E6426E] hover:!bg-[#d43a63] !text-white !py-2.5 !px-6 !text-xs !rounded-2xl shadow-none font-bold"
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-p-s">
            <span className="text-text-base">Sub Total:</span>
            <span className="text-text-base">
              {formatPrice(subtotal, selectedCurrency || undefined)}
            </span>
          </div>

          <div className="flex justify-between items-center text-p-s">
            <span className="text-text-base">Envío:</span>
            <span className="text-text-base font-bold">
              {shippingLabel ? shippingLabel : shippingCost === 0 && !isCheckout ? "A calcular" : shippingCost === 0 ? "Gratis" : formatPrice(convertedShippingCost, selectedCurrency || undefined)}
            </span>
          </div>

          <div className="flex justify-between items-center text-p-s">
            <span className="text-text-base">Descuento:</span>
            {discountInfo ? (
              <div className="flex items-center gap-2">
                <span className="text-text-base">
                  {discountInfo.type === 'PERCENTAGE' ? `${discountInfo.value}%` : formatPrice(discountAmount, selectedCurrency || undefined)}
                </span>
                <button 
                  onClick={onRemoveDiscount}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-text-base">0%</span>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-300 flex justify-between items-center">
            <span className="text-p-b font-extrabold text-text-base">Total a pagar:</span>
            <span className="text-h4-s font-black text-[#E6426E]">
              {formatPrice(total, selectedCurrency || undefined)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleCheckout}
          className="shadow-[#E6426E]/20 shadow-lg !py-3.5 !rounded-2xl !bg-[#E6426E] hover:!bg-[#d43a63] font-bold text-white group"
        >
          {isCheckout ? "Continuar con el pago" : "Continuar compra"}
          <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: sticky card */}
      <div className="hidden md:flex bg-white rounded-[32px] shadow-card-custom border border-neutral-100/50 overflow-hidden flex-col">
        {summaryContent}
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileExpanded(false)}
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isMobileExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Bottom sheet */}
        <div
          ref={dragRef}
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out ${
            isMobileExpanded ? "translate-y-0" : "translate-y-[calc(100%-64px)]"
          }`}
        >
          {/* Drag handle + collapsed bar */}
          <div
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex flex-col items-center cursor-pointer pt-3 pb-4"
          >
            <div className="w-10 h-1 bg-neutral-300 rounded-full mb-3" />
            <div className="flex items-center justify-between w-full px-6">
              <span className="text-p-b font-bold text-text-base">Total a Pagar:</span>
              <span className="text-h4-s font-black text-[#E6426E]">
                {formatPrice(total, selectedCurrency || undefined)}
              </span>
            </div>
          </div>

          {/* Full summary (scrollable) */}
          <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
            {summaryContent}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Función auxiliar para convertir valores numéricos entre monedas.
 * Copiada para mantener consistencia con el sistema de tasas USD -> VES -> COP.
 */
function convertToNumeric(
  amount: number,
  sourceCurrency: Currency,
  targetCurrency: Currency | null,
  allCurrencies: Currency[]
): number {
  if (!sourceCurrency || !targetCurrency) return amount;
  const srcCode = sourceCurrency.code.toUpperCase().trim();
  const tgtCode = targetCurrency.code.toUpperCase().trim();
  if (srcCode === tgtCode) return amount;

  // Si no hay tasas cargadas, devolver monto original sin convertir
  if (!allCurrencies || allCurrencies.length === 0) return amount;

  const getRate = (code: string) => {
    const c = allCurrencies.find(curr => {
      const dbCode = curr.code.toUpperCase().trim();
      const searchCode = code.toUpperCase().trim();
      return dbCode === searchCode ||
        (searchCode === "VES" && (dbCode === "VEF" || dbCode === "BS" || dbCode === "VES"));
    });
    return c?.exchangeRate || 1;
  };

  const rateVES = getRate("VES");
  const rateCOP = getRate("COP");
  let convertedValue = amount;
  const isVES = (c: string) => ["VES", "VEF", "BS"].includes(c);

  if (srcCode === "USD") {
    if (isVES(tgtCode)) convertedValue = amount * rateVES;
    else if (tgtCode === "COP") convertedValue = amount * (rateVES * rateCOP);
  } else if (isVES(srcCode)) {
    if (tgtCode === "USD") convertedValue = amount / rateVES;
    else if (tgtCode === "COP") convertedValue = amount * rateCOP;
  } else if (srcCode === "COP") {
    if (tgtCode === "USD") convertedValue = amount / (rateVES * rateCOP);
    else if (isVES(tgtCode)) convertedValue = amount / rateCOP;
  } else {
    const baseValue = amount / (sourceCurrency.exchangeRate || 1);
    convertedValue = baseValue * (targetCurrency.exchangeRate || 1);
  }
  return convertedValue;
}

export default CartSummary;