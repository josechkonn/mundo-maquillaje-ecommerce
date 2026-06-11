import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { productService, type Product, type ProductVariation, type Currency } from "../../../services/productService";
import { currencyService } from "../../../services/currencyService";
import { shippingMethodService, type ShippingMethod } from "../../../services/shippingMethodService";
import { paymentMethodService, type PaymentMethod } from "../../../services/paymentMethodService";
import { formatPrice } from "../../../lib/formatters";
import ProductVariationPicker from "../../ui/ProductVariationPicker";

export interface OrderProductEntry {
  productName: string;
  variationName: string;
  price: number;
  quantity: number;
  discount: number;
  taxAmount: number;
  subtotal: number;
  imageUrl?: string;
}

interface StepProductosProps {
  products: OrderProductEntry[];
  onProductsChange: (products: OrderProductEntry[]) => void;
  currencyId: string;
  onCurrencyChange: (id: string) => void;
  shippingMethodId: string;
  onShippingMethodChange: (id: string) => void;
  shippingCost: number;
  onShippingCostChange: (cost: number) => void;
  paymentMethodId: string;
  onPaymentMethodChange: (id: string) => void;
  discountAmount: number;
  onDiscountAmountChange: (amount: number) => void;
  onEnterNext: () => void;
  onEnterPrev: () => void;
}

const StepProductos = ({
  products, onProductsChange,
  currencyId, onCurrencyChange,
  shippingMethodId, onShippingMethodChange,
  shippingCost, onShippingCostChange,
  paymentMethodId, onPaymentMethodChange,
  discountAmount, onDiscountAmountChange,
  onEnterNext, onEnterPrev,
}: StepProductosProps) => {
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addDiscount, setAddDiscount] = useState(0);
  const [addTax, setAddTax] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    currencyService.getAllCurrencies().then(setAllCurrencies).catch(() => {});
    productService.getAllProducts(0, 10000).then((data) => {
      const list = Array.isArray(data) ? data : (data as any).content || [];
      setAllProducts(list);
    }).catch(() => {});
    shippingMethodService.getAll().then(setShippingMethods).catch(() => {});
    paymentMethodService.getAll().then(setPaymentMethods).catch(() => {});
  }, []);

  const currentCurrency = allCurrencies.find(c => c.id === currencyId);
  const fmt = (amount: number) => formatPrice(amount, currentCurrency);

  const handleAddProduct = () => {
    if (!selectedVariation) return;
    const qty = addQuantity;
    const price = selectedVariation.price;
    const disc = addDiscount;
    const tax = addTax;
    const subtotal = qty * price * (1 - disc / 100) * (1 + tax / 100);

    const entry: OrderProductEntry = {
      productName: selectedProduct?.name || selectedVariation.name,
      variationName: selectedVariation.name,
      price,
      quantity: qty,
      discount: disc,
      taxAmount: tax,
      subtotal,
    };

    onProductsChange([...products, entry]);
    setSelectedProduct(null);
    setSelectedVariation(null);
    setAddQuantity(1);
    setAddDiscount(0);
    setAddTax(0);
    setShowAddForm(false);
  };

  const handleRemoveProduct = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof OrderProductEntry, value: number | string) => {
    const updated = products.map((p, i) => {
      if (i !== index) return p;
      const next = { ...p, [field]: value };
      if (field === "quantity" || field === "price" || field === "discount" || field === "taxAmount") {
        const qty = field === "quantity" ? Number(value) : p.quantity;
        const price = field === "price" ? Number(value) : p.price;
        const disc = field === "discount" ? Number(value) : p.discount;
        const tax = field === "taxAmount" ? Number(value) : p.taxAmount;
        next.subtotal = qty * price * (1 - disc / 100) * (1 + tax / 100);
      }
      return next;
    });
    onProductsChange(updated);
  };

  const subtotal = products.reduce((s, p) => s + p.subtotal, 0);
  const total = subtotal + (shippingCost || 0) - (discountAmount || 0);

  const hasProducts = products.length > 0;
  const hasConfig = currencyId && shippingMethodId && paymentMethodId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-extrabold text-lg">2</div>
        <div>
          <h3 className="text-lg font-extrabold text-neutral-800">Productos y configuración</h3>
          <p className="text-sm text-neutral-500">Agrega productos y configura el pedido</p>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-neutral-700">Productos del pedido</h4>
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-400 text-white hover:bg-brand-500 transition-all shadow-sm">
            <PlusIcon className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {showAddForm && (
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-neutral-800">Nuevo producto</h5>
              <button onClick={() => { setShowAddForm(false); setSelectedProduct(null); setSelectedVariation(null); }}
                className="text-neutral-400 hover:text-neutral-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <ProductVariationPicker
              products={allProducts}
              selectedVariation={selectedVariation}
              onSelect={(v, p) => { setSelectedVariation(v); setSelectedProduct(p); }}
              onClear={() => { setSelectedVariation(null); setSelectedProduct(null); }}
            />
            {selectedVariation && (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Precio</label>
                    <span className="text-sm font-bold text-brand-600 block px-3 py-2 bg-white rounded-lg border border-neutral-200">{fmt(selectedVariation.price)}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Cant.</label>
                    <input type="number" min={1} value={addQuantity} onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Desc. %</label>
                    <input type="number" step="0.01" min={0} value={addDiscount} onChange={(e) => setAddDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Imp. %</label>
                    <input type="number" step="0.01" min={0} value={addTax} onChange={(e) => setAddTax(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button onClick={handleAddProduct}
                    className="px-6 py-2 rounded-xl bg-brand-400 text-white text-sm font-bold hover:bg-brand-500 transition-all">
                    Agregar producto
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-neutral-500 font-medium">Aún no hay productos</p>
            <p className="text-xs text-neutral-400 mt-1">Agrega productos al pedido usando el botón "Agregar"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">Producto</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Precio</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Desc. %</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Imp. %</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Subtotal</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="text-sm font-medium text-neutral-800">{p.productName}</p>
                      {p.variationName && <p className="text-xs text-neutral-500">{p.variationName}</p>}
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" step="0.01" min={0} value={p.price} onChange={(e) => updateProduct(i, "price", parseFloat(e.target.value) || 0)}
                        className="w-24 mx-auto px-2 py-1 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" min={1} value={p.quantity} onChange={(e) => updateProduct(i, "quantity", parseInt(e.target.value) || 1)}
                        className="w-16 mx-auto px-2 py-1 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" step="0.01" min={0} value={p.discount} onChange={(e) => updateProduct(i, "discount", parseFloat(e.target.value) || 0)}
                        className="w-16 mx-auto px-2 py-1 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                    </td>
                    <td className="py-2.5 px-3">
                      <input type="number" step="0.01" min={0} value={p.taxAmount} onChange={(e) => updateProduct(i, "taxAmount", parseFloat(e.target.value) || 0)}
                        className="w-16 mx-auto px-2 py-1 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm font-semibold text-neutral-800">{fmt(p.subtotal)}</td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => handleRemoveProduct(i)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 space-y-4">
        <h4 className="text-sm font-bold text-neutral-700">Configuración del pedido</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Moneda</label>
            <select value={currencyId} onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all">
              <option value="">Seleccionar...</option>
              {allCurrencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Método de envío</label>
            <select value={shippingMethodId} onChange={(e) => onShippingMethodChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all">
              <option value="">Seleccionar...</option>
              {shippingMethods.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Método de pago</label>
            <select value={paymentMethodId} onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all">
              <option value="">Seleccionar...</option>
              {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Costo de envío</label>
            <input type="number" step="0.01" min="0" value={shippingCost} onChange={(e) => onShippingCostChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Descuento global</label>
            <input type="number" step="0.01" min="0" value={discountAmount} onChange={(e) => onDiscountAmountChange(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
          </div>
        </div>

        {/* Payment method fields */}
        {paymentMethodId && (() => {
          const method = paymentMethods.find(p => p.id === paymentMethodId);
          if (!method?.fields?.length) return null;
          return (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Datos del método de pago</p>
              {method.fields.map((f) => (
                <p key={f.id} className="text-sm text-neutral-700">
                  <span className="font-medium text-neutral-500">{f.field}:</span> {f.value}
                </p>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Resumen rápido */}
      <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-5">
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="font-medium text-neutral-800">{fmt(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Descuento</span><span className="font-medium text-green-600">-{fmt(discountAmount)}</span></div>}
            {shippingCost > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Envío</span><span className="font-medium text-neutral-800">{fmt(shippingCost)}</span></div>}
            <div className="border-t border-neutral-300 pt-1.5 flex justify-between">
              <span className="font-bold text-neutral-800">Total</span>
              <span className="font-extrabold text-lg text-brand-600">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onEnterPrev}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-all">
          <ChevronDownIcon className="w-4 h-4 rotate-90" />
          Anterior
        </button>
        <button
          onClick={onEnterNext}
          disabled={!hasProducts || !hasConfig}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Siguiente
          <ChevronDownIcon className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default StepProductos;
