import { XMarkIcon, ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useCurrencyStore } from "../../store/currencyStore";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useAuthStore } from "../../store/authStore";
import { type Currency } from "../../services/productService";
import Button from "../ui/Button";
import QuantitySelector from "../product/QuantitySelector";
import { useEffect, useState } from "react";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isDrawerOpen, setIsDrawerOpen, items, updateQuantity, removeItem, getItemCount } = useCartStore();
  const { selectedCurrency, currencies } = useCurrencyStore();
  const user = useAuthStore(state => state.user);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animación de entrada/salida mejorada
  useEffect(() => {
    if (isDrawerOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      // Pequeño retraso para permitir que el DOM se renderice antes de la animación
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 400); // 400ms para asegurar que la animación de salida termine
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  if (!isVisible) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    if (!user) {
      navigate("/auth/login");
    } else {
      navigate("/finalizar-compra");
    }
  };

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

  const formatCurrency = (amount: number) => {
    if (!selectedCurrency) return "";
    const formatted = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: selectedCurrency.decimalPlaces || 0,
      maximumFractionDigits: selectedCurrency.decimalPlaces || 0,
    }).format(amount);

    return selectedCurrency.symbolPosition === "LEFT" 
      ? `${selectedCurrency.symbol} ${formatted}` 
      : `${formatted} ${selectedCurrency.symbol}`;
  };

  return (
    <div className={`fixed inset-0 z-[9999] ${isVisible ? "visible" : "invisible"}`}>
      {/* Overlay / Backdrop */}
      <div 
        className={`absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] transition-opacity duration-400 ease-in-out ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl transition-transform duration-400 ease-out flex flex-col ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 p-2 rounded-xl">
              <ShoppingBagIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="text-p-b font-bold text-text-base">Tu Carrito</h3>
              <p className="text-[12px] text-text-muted">{getItemCount()} productos añadidos</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-text-muted" />
          </button>
        </div>

        {/* Content / Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingBagIcon className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-p-sm font-medium text-neutral-500">Tu carrito está vacío</p>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="mt-4 text-brand-500 font-bold text-p-xs hover:underline"
              >
                Empezar a comprar
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemCurrency: Currency = {
                id: item.currencyId,
                name: "",
                code: item.currencyCode,
                symbol: item.currencySymbol,
                exchangeRate: item.currencyExchangeRate,
                decimalPlaces: item.currencyDecimalPlaces,
                symbolPosition: item.currencySymbolPosition as "LEFT" | "RIGHT",
              };

              return (
                <div key={item.variationId} className="flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[13px] font-bold text-text-base leading-tight truncate pr-2">
                        {item.productName}
                      </p>
                      <button 
                        onClick={() => removeItem(item.variationId, !!user)}
                        className="text-neutral-300 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-text-muted mb-2">Variante: {item.variationName}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <QuantitySelector 
                        quantity={item.quantity} 
                        maxStock={item.maxStock} 
                        onChange={(qty) => updateQuantity(item.variationId, qty, !!user)}
                        hideLabel
                        className="scale-90 origin-left"
                      />
                      <p className="text-p-xs font-bold text-brand-600">
                        {convertAndFormatPrice(item.price * item.quantity, itemCurrency, selectedCurrency, currencies)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-p-sm font-medium text-text-muted">Subtotal estimado:</span>
            <span className="text-h4-s font-black text-text-base">{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleCheckout} className="shadow-brand/20 shadow-lg !py-4">
              Finalizar Compra
            </Button>
            <Link 
              to="/carrito" 
              onClick={() => setIsDrawerOpen(false)}
              className="text-center py-2 text-p-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar (copiada de CartSummary para consistencia)
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
    const c = allCurrencies.find(curr => curr.code.toUpperCase().trim() === code.toUpperCase().trim());
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

export default CartDrawer;
