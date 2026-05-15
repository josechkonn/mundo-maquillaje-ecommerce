import { TrashIcon } from "@heroicons/react/24/outline";
import { type CartItem } from "../../store/cartStore";
import { convertAndFormatPrice } from "../../lib/formatters";
import { useCurrencyStore } from "../../store/currencyStore";
import { type Currency } from "../../services/productService";
import QuantitySelector from "../product/QuantitySelector";
import { Link } from "react-router-dom";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (variationId: string, qty: number) => void;
  onRemove: (variationId: string) => void;
}

/**
 * Versión para Tabla (Desktop)
 */
export const CartItemTableRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  const { selectedCurrency, currencies } = useCurrencyStore();

  const itemCurrency: Currency = {
    id: item.currencyId,
    name: "",
    code: item.currencyCode,
    symbol: item.currencySymbol,
    exchangeRate: item.currencyExchangeRate,
    decimalPlaces: item.currencyDecimalPlaces,
    symbolPosition: item.currencySymbolPosition as "LEFT" | "RIGHT",
  };

  const unitPrice = convertAndFormatPrice(item.price, itemCurrency, selectedCurrency, currencies);
  const totalPrice = convertAndFormatPrice(item.price * item.quantity, itemCurrency, selectedCurrency, currencies);

  return (
    <tr className="border-b border-neutral-600 last:border-0 hover:bg-brand-50/30 transition-colors">
      <td className="py-4 px-4">
        <Link to={`/producto/${item.productSlug}`}>
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-100">
            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
          </div>
        </Link>
      </td>
      <td className="py-4 px-4">
        <Link to={`/producto/${item.productSlug}`} className="hover:text-brand-500 transition-colors">
          <p className="font-semibold text-text-base text-p-sm leading-tight">{item.productName}</p>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-p-xs text-text-muted">Variante:</span>
          {item.hexColor ? (
            <div className="w-4 h-4 rounded-full border border-neutral-200 shadow-inner" style={{ backgroundColor: item.hexColor }} />
          ) : (
            <span className="text-p-xs text-text-muted">{item.variationName}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-brand-500 font-bold text-p-sm whitespace-nowrap">{unitPrice}</td>
      <td className="py-4 px-4">
        <QuantitySelector quantity={item.quantity} maxStock={item.maxStock} onChange={(qty) => onUpdateQuantity(item.variationId, qty)} hideLabel />
      </td>
      <td className="py-4 px-4 font-bold text-text-base text-p-sm whitespace-nowrap">{totalPrice}</td>
      <td className="py-4 px-4">
        <button onClick={() => onRemove(item.variationId)} className="p-2 text-brand-300 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all duration-200">
          <TrashIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

/**
 * Versión para Card (Móvil) - Estilo lista unificada
 */
export const CartItemMobileCard = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  const { selectedCurrency, currencies } = useCurrencyStore();

  const itemCurrency: Currency = {
    id: item.currencyId,
    name: "",
    code: item.currencyCode,
    symbol: item.currencySymbol,
    exchangeRate: item.currencyExchangeRate,
    decimalPlaces: item.currencyDecimalPlaces,
    symbolPosition: item.currencySymbolPosition as "LEFT" | "RIGHT",
  };

  const unitPrice = convertAndFormatPrice(item.price, itemCurrency, selectedCurrency, currencies);
  const totalPrice = convertAndFormatPrice(item.price * item.quantity, itemCurrency, selectedCurrency, currencies);

  return (
    <div className="py-5 px-4 border-b border-neutral-600 last:border-0">
      <div className="flex gap-4">
        {/* Imagen */}
        <Link to={`/producto/${item.productSlug}`} className="flex-shrink-0">
          <div className="w-24 h-24 rounded-[20px] overflow-hidden bg-neutral-100 border border-neutral-100">
            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="relative pr-8">
            <Link to={`/producto/${item.productSlug}`}>
              <p className="font-bold text-text-base text-p-sm leading-tight line-clamp-2">{item.productName}</p>
            </Link>
            <button 
              onClick={() => onRemove(item.variationId)} 
              className="absolute top-0 right-0 p-1 text-brand-300 hover:text-brand-500 transition-colors"
            >
              <TrashIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-p-xs text-text-muted">Variante:</span>
            {item.hexColor ? (
              <div className="w-4 h-4 rounded-full border border-neutral-200" style={{ backgroundColor: item.hexColor }} />
            ) : (
              <span className="text-p-xs text-text-muted">{item.variationName}</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-p-xs text-text-muted">{unitPrice}</span>
              <span className="text-p-sm font-bold text-brand-500">{totalPrice}</span>
            </div>
            <div className="scale-90 origin-right">
              <QuantitySelector 
                quantity={item.quantity} 
                maxStock={item.maxStock} 
                onChange={(qty) => onUpdateQuantity(item.variationId, qty)} 
                hideLabel 
                variant="compact"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
