import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { CartItemTableRow, CartItemMobileCard } from "../components/cart/CartItemRow";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";

const CartPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const {
    items,
    discountInfo,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    removeDiscount,
  } = useCartStore();

  const isAuth = !!user;

  const handleUpdateQuantity = (variationId: string, qty: number) => {
    updateQuantity(variationId, qty, isAuth);
  };

  const handleRemove = (variationId: string) => {
    removeItem(variationId, isAuth);
  };

  const handleClearCart = () => {
    clearCart(isAuth);
  };

  const handleApplyDiscount = async (code: string, subtotal: number) => {
    return applyDiscount(code, subtotal);
  };

  if (items.length === 0) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="w-[90%] mx-auto py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-brand-500 transition-colors text-p-xs font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </button>
        </div>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="w-[90%] mx-auto py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-brand-500 transition-colors text-p-xs font-medium mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </button>

        {/* Title */}
        <h1 className="text-center mb-10">Carrito de Compra</h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 lg:gap-12 items-start">

          {/* Left: Items Table */}
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[32px] shadow-card-custom border border-neutral-100/50 overflow-hidden px-8 py-9">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="py-4 px-4 text-left text-p-xs font-medium text-text-muted">Imagen de Producto</th>
                    <th className="py-4 px-4 text-left text-p-xs font-medium text-text-muted">Producto</th>
                    <th className="py-4 px-4 text-left text-p-xs font-medium text-text-muted">Precio</th>
                    <th className="py-4 px-4 text-left text-p-xs font-medium text-text-muted">Cantidad</th>
                    <th className="py-4 px-4 text-left text-p-xs font-medium text-text-muted">Total</th>
                    <th className="py-4 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <CartItemTableRow
                      key={item.variationId}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemove}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Container */}
            <div className="md:hidden bg-white rounded-[32px] shadow-card-custom border border-neutral-100/50 overflow-hidden">
              {items.map((item) => (
                <CartItemMobileCard
                  key={item.variationId}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Clear cart */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleClearCart}
                className="flex items-center gap-3 text-text-base hover:text-brand-500 transition-all text-p-b font-normal group"
              >
                <TrashIcon className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
                Vaciar el carrito
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <CartSummary
            items={items}
            discountInfo={discountInfo}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={removeDiscount}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
