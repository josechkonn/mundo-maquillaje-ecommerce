import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ClockIcon, MapPinIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { orderService, type BackendOrder } from "../../services/orderService";
import { formatPrice } from "../../lib/formatters";
import toast from "react-hot-toast";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const data = await orderService.getUserOrderById(orderId);
        setOrder(data);
      } catch (error: any) {
        console.error("Error fetching order:", error);
        toast.error(error.message || "No se pudo cargar el pedido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
        <div className="h-64 bg-neutral-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-neutral-700 font-medium text-lg">Pedido no encontrado</p>
        <button
          onClick={() => navigate("/cuenta/pedidos")}
          className="mt-4 text-[#E6426E] hover:underline font-medium"
        >
          Volver a pedidos
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-mm-status-pending text-mm-status-pending-text border border-mm-status-pending-border" },
      PAID: { label: "Pagado", className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
      DELIVERED: { label: "Completado", className: "bg-mm-status-completed text-mm-status-completed-text border border-mm-status-completed-border" },
      PROCESSING: { label: "En proceso", className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
      SHIPPED: { label: "Enviado", className: "bg-mm-status-processing text-mm-status-processing-text border border-mm-status-processing-border" },
      CANCELLED: { label: "Cancelado", className: "bg-mm-status-cancelled text-mm-status-cancelled-text border border-mm-status-cancelled-border" }
    };
    const s = map[status] || { label: status, className: "bg-neutral-100 text-neutral-800 border border-neutral-400" };
    return (
      <span className={`px-4 py-1.5 rounded-xl text-sm font-bold inline-block ${s.className}`}>
        {s.label}
      </span>
    );
  };

  const currency = order.currency || order.paymentMethod?.currency;

  return (
    <div className="w-full flex flex-col space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/cuenta/pedidos")}
          className="flex items-center gap-2 text-neutral-700 hover:text-[#E6426E] transition-colors font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver a pedidos</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">Pedido</span>
          <span className="text-h4-b font-extrabold text-neutral-800">
            {order.orderNumber || `#${String(order.id).slice(0, 8).toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Status + Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-400">
          <p className="text-xs font-normal text-neutral-800 uppercase tracking-wider mb-2">Estado</p>
          {getStatusBadge(order.status)}
        </div>
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-400">
          <p className="text-xs font-normal text-neutral-800 uppercase tracking-wider mb-2">Fecha de pedido</p>
          <div className="flex items-center gap-2 text-neutral-800 font-medium">
            <ClockIcon className="w-4 h-4 text-neutral-800" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-400">
          <p className="text-xs font-normal text-neutral-800 uppercase tracking-wider mb-2">Última actualización</p>
          <div className="flex items-center gap-2 text-neutral-800 font-medium">
            <ClockIcon className="w-4 h-4 text-neutral-800" />
            <span>{formatDate(order.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-3xl border border-neutral-400 bg-white overflow-hidden">
        <div className="px-6 py-5 bg-brand-50">
          <h3 className="text-sm font-bold text-neutral-800">Productos del pedido</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-400">
                <th className="py-3 px-6 text-xs font-bold text-neutral-600 uppercase tracking-wider">Producto</th>
                <th className="py-3 px-6 text-xs font-bold text-neutral-600 uppercase tracking-wider text-center">Precio unit.</th>
                <th className="py-3 px-6 text-xs font-bold text-neutral-600 uppercase tracking-wider text-center">Cant.</th>
                <th className="py-3 px-6 text-xs font-bold text-neutral-600 uppercase tracking-wider text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.products?.map((product) => (
                <tr key={product.id} className="border-b border-neutral-50 last:border-0">
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-neutral-800">{product.productName}</p>
                    {product.variationName && (
                      <p className="text-xs text-neutral-600 mt-0.5">{product.variationName}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center text-sm text-neutral-600">
                    {formatPrice(product.price, currency)}
                  </td>
                  <td className="py-4 px-6 text-center text-sm text-neutral-600 font-medium">
                    {product.quantity}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-semibold text-neutral-800">
                    {formatPrice(product.subtotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm rounded-3xl border border-neutral-400 bg-white p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="text-neutral-700 font-medium">{formatPrice(order.subtotal, currency)}</span>
          </div>
          {(order.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Descuento</span>
              <span className="text-green-600 font-medium">-{formatPrice(order.discountAmount, currency)}</span>
            </div>
          )}
          {(order.taxAmount ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Impuestos</span>
              <span className="text-neutral-700 font-medium">{formatPrice(order.taxAmount, currency)}</span>
            </div>
          )}
          {(order.shippingCost ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Envío</span>
              <span className="text-neutral-700 font-medium">{formatPrice(order.shippingCost ?? 0, currency)}</span>
            </div>
          )}
          <div className="border-t border-neutral-400 pt-3 flex justify-between">
            <span className="font-bold text-neutral-800">Total pagado</span>
            <span className="font-extrabold text-lg text-neutral-800">{formatPrice(order.totalAmount, currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment + Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method */}
        <div className="rounded-3xl border border-neutral-400 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-800">Método de pago</h3>
          </div>
          <p className="text-neutral-700 font-medium">{order.paymentMethod?.name || "—"}</p>
        </div>

        {/* Shipping Address */}
        <div className="rounded-3xl border border-neutral-400 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-800">Dirección de envío</h3>
          </div>
          {order.shippingAddress ? (
            <div className="text-sm text-neutral-700 space-y-1">
              <p className="font-medium">{order.shippingAddress.fullname}</p>
              <p>{order.shippingAddress.direction}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              {order.shippingAddress.phone && <p>Tel: {order.shippingAddress.phone}</p>}
            </div>
          ) : (
            <p className="text-neutral-600 text-sm">Sin dirección registrada</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
