import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeftIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon, CheckIcon, PhotoIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { orderService, type BackendOrder, type CurrencyResponse } from "../../services/orderService";
import { currencyService } from "../../services/currencyService";
import { productService, type Product, type ProductVariation } from "../../services/productService";
import { formatPrice, convertPriceNumber } from "../../lib/formatters";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import OrderEditSkeleton from "../../components/admin/skeletons/OrderEditSkeleton";
import ProductVariationPicker from "../../components/ui/ProductVariationPicker";

const parseLocaleNumber = (val: string): number => {
  const normalized = val.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "PROCESSING", label: "En proceso" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const OrderEditPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Product editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ productName: string; variationName: string; price: number; quantity: number; discount: number; taxAmount: number } | null>(null);

  // Add product
  const [showAddForm, setShowAddForm] = useState(false);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addDiscount, setAddDiscount] = useState(0);
  const [addTax, setAddTax] = useState(0);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(false);
  const [deleteOrderLoading, setDeleteOrderLoading] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const data = await orderService.getAdminOrderById(orderId);
      setOrder(data);
      setStatus(data.status);
      setCurrencyId(data.currency?.id || "");
      setShippingCost(data.shippingCost || 0);
      setDiscountAmount(data.discountAmount || 0);
    } catch (error: any) {
      console.error("Error loading order:", error);
      toast.error(error.message || "No se pudo cargar el pedido.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const loadCurrencies = useCallback(async () => {
    try {
      const data = await currencyService.getAllCurrencies();
      setCurrencies(data);
    } catch {
      toast.error("No se pudieron cargar las monedas.");
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getAllProducts(0, 10000);
      const productList = Array.isArray(data) ? data : (data as any).content || [];
      console.log('[loadProducts] Loaded', productList.length, 'products');
      setProducts(productList);
    } catch (e) {
      console.error('[loadProducts] Error:', e);
      toast.error("No se pudieron cargar los productos.");
    }
  }, []);

  useEffect(() => { loadOrder(); }, [loadOrder]);
  useEffect(() => { loadCurrencies(); }, [loadCurrencies]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSaveOrder = async () => {
    if (!orderId) return;
    setIsSaving(true);
    try {
      const updated = await orderService.updateOrder(orderId, { status, ...(currencyId ? { currencyId } : {}), shippingCost, discountAmount });
      setOrder(updated);
      toast.success("Pedido actualizado correctamente.");
    } catch {
      toast.error("Error al actualizar el pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (productId: string) => {
    if (!orderId || !editForm) return;
    setIsSaving(true);
    try {
      const updated = await orderService.updateOrderProduct(orderId, productId, editForm);
      setOrder(updated);
      setEditingProductId(null);
      setEditForm(null);
      toast.success("Producto actualizado.");
    } catch {
      toast.error("Error al actualizar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async () => {
    if (!orderId || !selectedVariation) return;
    setIsSaving(true);
    try {
      const updated = await orderService.addProductToOrder(orderId, {
        productName: selectedProduct?.name || selectedVariation.name,
        variationName: selectedVariation.name,
        price: selectedVariation.price,
        quantity: addQuantity,
        discount: addDiscount,
        taxAmount: addTax,
      });
      setOrder(updated);
      setShowAddForm(false);
      setSelectedProduct(null);
      setSelectedVariation(null);
      setAddQuantity(1);
      setAddDiscount(0);
      setAddTax(0);
      toast.success("Producto añadido.");
    } catch {
      toast.error("Error al añadir el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!orderId) return;
    setDeleteLoading(true);
    try {
      const updated = await orderService.removeProductFromOrder(orderId, productId);
      setOrder(updated);
      toast.success("Producto eliminado.");
    } catch {
      toast.error("Error al eliminar el producto.");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderId) return;
    setDeleteOrderLoading(true);
    try {
      await orderService.deleteOrder(orderId);
      toast.success("Pedido eliminado permanentemente");
      navigate("/admin/pedidos");
    } catch {
      toast.error("Error al eliminar el pedido");
    } finally {
      setDeleteOrderLoading(false);
      setConfirmDeleteOrder(false);
    }
  };

  const prevCurrencyRef = useRef(currencyId);

  // When the currency dropdown changes, convert editable amounts
  useEffect(() => {
    const prev = prevCurrencyRef.current;
    if (prev && prev !== currencyId) {
      const oldCur = currencies.find(c => c.id === prev);
      const newCur = currencies.find(c => c.id === currencyId);
      if (oldCur && newCur && oldCur.id !== newCur.id) {
        const dp = newCur.decimalPlaces ?? 2;
        const factor = Math.pow(10, dp);
        setShippingCost(Math.round(convertPriceNumber(shippingCost, oldCur, newCur, currencies) * factor) / factor);
        setDiscountAmount(Math.round(convertPriceNumber(discountAmount, oldCur, newCur, currencies) * factor) / factor);
      }
    }
    prevCurrencyRef.current = currencyId;
  }, [currencyId]);

  const currentCurrency = currencies.find(c => c.id === currencyId) || order?.currency || null;
  const orderCurrency = currencies.find(c => c.id === (order?.currency?.id || '')) || order?.currency || null;

  const fmt = (amount: number) => {
    if (!currentCurrency) return amount.toString();
    if (!orderCurrency || orderCurrency.id === currentCurrency.id) {
      return formatPrice(amount, currentCurrency);
    }
    const converted = convertPriceNumber(amount, orderCurrency, currentCurrency, currencies);
    return formatPrice(converted, currentCurrency);
  };

  const LOCKED_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
  const isLocked = LOCKED_STATUSES.includes(order?.status || "");

  if (isLoading) {
    return <OrderEditSkeleton />;
  }

  if (!order) {
    return (
      <div className="py-10 text-center">
        <p className="text-neutral-700 font-medium text-lg">Pedido no encontrado</p>
        <button onClick={() => navigate("/admin/pedidos")} className="mt-4 text-brand-400 hover:underline font-medium">Volver a pedidos</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ConfirmDialog isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDeleteProduct(deleteConfirm)} title="Eliminar producto" message="¿Estás seguro de eliminar este producto del pedido?" confirmLabel="Eliminar" loading={deleteLoading} />

      <ConfirmDialog
        isOpen={confirmDeleteOrder}
        onClose={() => setConfirmDeleteOrder(false)}
        onConfirm={handleDeleteOrder}
        title="Eliminar pedido"
        message="¿Estás seguro de eliminar permanentemente este pedido? Se restaurará el stock de los productos y se eliminarán todas las transacciones asociadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar permanentemente"
        maxWidth="lg"
        loading={deleteOrderLoading}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/admin/pedidos")} className="flex items-center gap-2 text-neutral-700 hover:text-brand-400 transition-colors font-medium">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver a pedidos</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setConfirmDeleteOrder(true)} disabled={deleteOrderLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            <TrashIcon className="w-4 h-4" />
            Eliminar
          </button>
          <button onClick={handleSaveOrder} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 disabled:opacity-50 transition-all shadow-sm">
            <CheckIcon className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Row 1: Detalles del pedido + Detalles de envío */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Container 1: Detalles del pedido */}
        <div className="bg-white rounded-3xl p-6 space-y-6">
          <div>
            <h4 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">Detalles del pedido</h4>
            <div className="mt-2 h-px bg-neutral-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">N° Pedido</label>
              <p className="text-sm font-bold text-neutral-800 mt-1">{order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fecha</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Método de pago</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.paymentMethod?.name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Usuario</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.userName || order.userEmail || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-800 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all">
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</label>
              <p className="text-lg font-extrabold text-neutral-800 mt-1">{fmt(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Container 2: Detalles de envío */}
        <div className="bg-white rounded-3xl p-6 space-y-6">
          <div>
            <h4 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">Detalles de envío</h4>
            <div className="mt-2 h-px bg-neutral-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nombre</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.fullname || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Teléfono</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.phone || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Dirección</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.direction || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ciudad</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Municipio</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.municipality || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Parroquia</label>
              <p className="text-sm font-medium text-neutral-700 mt-1">{order.shippingAddress?.parish || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Container 3: Comprobante de pago */}
      <div className="bg-white rounded-3xl p-6 space-y-6">
        <div>
          <h4 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">Comprobante de pago</h4>
          <div className="mt-2 h-px bg-neutral-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Referencia y estado */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Número de referencia</label>
              <p className="text-sm font-bold text-neutral-800 mt-1">
                {order.paymentReference || (
                  <span className="text-neutral-400 font-normal">Sin referencia</span>
                )}
              </p>
            </div>

            {/* Transacciones asociadas */}
            {order.transactions && order.transactions.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Historial de transacciones</label>
                <div className="space-y-2">
                  {order.transactions.map((tx) => {
                    const isVerified = tx.status === "VERIFIED";
                    const isRejected = tx.status === "REJECTED";
                    const isPending = tx.status === "PENDING";
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isVerified ? "bg-green-100 text-green-600" :
                          isRejected ? "bg-red-100 text-red-600" :
                          "bg-yellow-100 text-yellow-600"
                        }`}>
                          <CreditCardIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800">
                            {isVerified ? "Verificado" : isRejected ? "Rechazado" : "Pendiente"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(tx.createdAt).toLocaleDateString("es-VE", {
                              day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                          {tx.reference && (
                            <p className="text-xs text-neutral-600 mt-0.5 font-medium">Ref: {tx.reference}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(!order.transactions || order.transactions.length === 0) && !order.paymentReference && !order.receiptUrl && (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <CreditCardIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">Este pedido no tiene comprobante de pago adjunto</p>
              </div>
            )}
          </div>

          {/* Columna derecha: Imagen del comprobante */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Imagen del comprobante</label>
            {order.receiptUrl ? (
              <a
                href={order.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 hover:ring-2 hover:ring-brand-400 transition-all"
              >
                <img
                  src={order.receiptUrl}
                  alt="Comprobante de pago"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-xl">
                    Ver completo
                  </span>
                </div>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400">
                <PhotoIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">Sin imagen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container 4: Configuración adicional */}
      <div className="bg-white rounded-3xl p-6 space-y-6">
        <div>
          <h4 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">Configuración</h4>
          <div className="mt-2 h-px bg-neutral-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Moneda</label>
            <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)} disabled={isLocked} className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-800 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {currencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Costo de envío</label>
            <input type="number" step="0.01" min="0" value={shippingCost} onChange={(e) => setShippingCost(parseLocaleNumber(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-800 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Descuento global (%)</label>
            <input type="number" step="0.01" min="0" max="100" value={discountAmount} onChange={(e) => setDiscountAmount(parseLocaleNumber(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-800 bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Container 4: Tabla de productos */}
      <div className="bg-white rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-h4-b font-extrabold text-neutral-800 tracking-tight">Productos</h4>
            <div className="mt-2 h-px bg-neutral-200" />
          </div>
          {!isLocked && (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 transition-all shadow-sm">
              <PlusIcon className="w-4 h-4" />
              Añadir producto
            </button>
          )}
        </div>

        {/* Add product form */}
        {showAddForm && (
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-neutral-800">Nuevo producto</h5>
              <button onClick={() => { setShowAddForm(false); setSelectedProduct(null); setSelectedVariation(null); setAddQuantity(1); setAddDiscount(0); setAddTax(0); }} className="text-neutral-400 hover:text-neutral-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Producto</label>
                <ProductVariationPicker
                  products={products}
                  selectedVariation={selectedVariation}
                  onSelect={(v, p) => { setSelectedVariation(v); setSelectedProduct(p); }}
                  onClear={() => { setSelectedVariation(null); setSelectedProduct(null); }}
                />
              </div>
              {selectedVariation && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Precio</label>
                    <span className="text-sm font-bold text-neutral-700 px-3 py-2 block">{fmt(selectedVariation.price)}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Cant.</label>
                    <input type="number" value={addQuantity} onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Desc. %</label>
                    <input type="number" step="0.01" value={addDiscount} onChange={(e) => setAddDiscount(parseLocaleNumber(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Imp. %</label>
                    <input type="number" step="0.01" value={addTax} onChange={(e) => setAddTax(parseLocaleNumber(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                  </div>
                </>
              )}
            </div>
            {selectedVariation && (
              <div className="flex justify-end pt-2 border-t border-neutral-200">
                <button onClick={handleAddProduct} disabled={isSaving} className="px-6 py-2 rounded-lg bg-brand-400 text-white text-sm font-bold hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Añadir producto</button>
              </div>
            )}
          </div>
        )}

        {/* Products table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-16">Imagen</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Producto</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Precio</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Cant.</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Desc. %</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Imp. %</th>
                <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Subtotal</th>
                {!isLocked && <th className="py-3 px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center w-24">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {order.products?.map((product) => {
                const isEditing = editingProductId === product.id;
                return (
                  <tr key={product.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                    {isEditing && editForm ? (
                      <>
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-brand-400">{product.productName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input value={editForm.productName} onChange={(e) => setEditForm(f => ({ ...f!, productName: e.target.value }))} className="w-full px-2 py-1 rounded border border-neutral-300 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                          <input value={editForm.variationName} onChange={(e) => setEditForm(f => ({ ...f!, variationName: e.target.value }))} placeholder="Variación" className="w-full mt-1 px-2 py-1 rounded border border-neutral-300 text-xs bg-white outline-none focus:ring-2 focus:ring-brand-200" />
                        </td>
                        <td className="py-3 px-4"><input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm(f => ({ ...f!, price: parseLocaleNumber(e.target.value) }))} className="w-full px-2 py-1 rounded border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" /></td>
                        <td className="py-3 px-4"><input type="number" value={editForm.quantity} onChange={(e) => setEditForm(f => ({ ...f!, quantity: parseInt(e.target.value) || 1 }))} className="w-16 mx-auto px-2 py-1 rounded border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" /></td>
                        <td className="py-3 px-4"><input type="number" step="0.01" value={editForm.discount} onChange={(e) => setEditForm(f => ({ ...f!, discount: parseLocaleNumber(e.target.value) }))} className="w-16 mx-auto px-2 py-1 rounded border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" /></td>
                        <td className="py-3 px-4"><input type="number" step="0.01" value={editForm.taxAmount} onChange={(e) => setEditForm(f => ({ ...f!, taxAmount: parseLocaleNumber(e.target.value) }))} className="w-16 mx-auto px-2 py-1 rounded border border-neutral-300 text-sm text-center bg-white outline-none focus:ring-2 focus:ring-brand-200" /></td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-neutral-800">{fmt(product.subtotal)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleSaveProduct(product.id)} disabled={isSaving} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"><CheckIcon className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingProductId(null); setEditForm(null); }} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors"><XMarkIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-brand-400">{product.productName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-neutral-800">{product.productName}</p>
                          {product.variationName && <p className="text-xs text-neutral-500 mt-0.5">{product.variationName}</p>}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-neutral-600">{fmt(product.price)}</td>
                        <td className="py-3 px-4 text-center text-sm font-medium text-neutral-700">{product.quantity}</td>
                        <td className="py-3 px-4 text-center text-sm text-neutral-600">{(product.discount || 0).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-center text-sm text-neutral-600">{(product.taxAmount || 0).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-neutral-800">{fmt(product.subtotal)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {!isLocked && (
                              <>
                                <button onClick={() => { setEditingProductId(product.id); setEditForm({ productName: product.productName, variationName: product.variationName || "", price: product.price, quantity: product.quantity, discount: product.discount || 0, taxAmount: product.taxAmount || 0 }); }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-neutral-700 font-medium">{fmt(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Descuento</span>
                <span className="text-green-600 font-medium">-{fmt(order.discountAmount)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Impuestos</span>
                <span className="text-neutral-700 font-medium">{fmt(order.taxAmount)}</span>
              </div>
            )}
            {(order.shippingCost || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Envío</span>
                <span className="text-neutral-700 font-medium">{fmt(order.shippingCost || 0)}</span>
              </div>
            )}
            <div className="border-t border-neutral-200 pt-2 flex justify-between">
              <span className="font-bold text-neutral-800">Total</span>
              <span className="font-extrabold text-lg text-neutral-800">{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;
