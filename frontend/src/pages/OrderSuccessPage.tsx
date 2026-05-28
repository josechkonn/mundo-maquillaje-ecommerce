import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { formatPrice } from "../lib/formatters";
import { productService, type Product, type Currency } from "../services/productService";
import ProductCarousel from "../components/ui/ProductCarousel";

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchCarouselProducts = async () => {
      try {
        const response = await productService.getAllProducts(0, 10);
        const data = Array.isArray(response) ? response : response.content;
        setCarouselProducts(data || []);
      } catch (err) {
        console.error("Error al cargar productos recomendados:", err);
      }
    };
    fetchCarouselProducts();
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FFF2F4] text-neutral-800 font-sans">
        <h3 className="text-h3-s md:text-h3-b font-bold mb-4 text-center">
          No se encontró información de la compra
        </h3>
        <p className="text-p-s text-neutral-600 mb-6 text-center">
          Parece que has accedido a esta página de manera directa o expiro tu sesión.
        </p>
        <Link
          to="/"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-8 rounded-2xl transition-colors"
        >
          Ir al Inicio
        </Link>
      </div>
    );
  }

  const orderCurrency: Currency = order.currency || order.paymentMethod?.currency || {
    id: "USD",
    name: "US Dollar",
    code: "USD",
    symbol: "$",
    exchangeRate: 1,
    decimalPlaces: 2,
    symbolPosition: "LEFT"
  };

  const formatOrderPrice = (amount: number) => {
    return formatPrice(amount, orderCurrency);
  };

  const shippingCost = order.shippingCost || 0;

  const discountPercentage = order.discountAmount > 0 && order.subtotal > 0
    ? Math.round((order.discountAmount / order.subtotal) * 100)
    : 0;

  return (
    <div className="w-full min-h-screen bg-[#FFF2F4] py-12 md:py-20 px-0 font-sans text-neutral-800">
      <div className="w-[80vw]  mx-auto">

        <div className="flex justify-center mb-6">
          <div className="w-[100px] h-[100px] bg-brand-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-100/50">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-center text-h3-s md:text-h3-b font-extrabold text-neutral-800 tracking-tight">
          Tu compra ha finalizado <br /> exitosamente
        </h3>

        <p className="text-center text-neutral-800 text-p-s md:text-p-b mt-4 font-normal">
          Puedes ver aquí los detalles de tu compra
        </p>

        <div className="max-w-md mx-auto my-8 space-y-2 text-center text-p-s md:text-p-b text-neutral-800">
          <p className="font-normal">
            <span className="font-bold">Numero de orden:</span> {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="font-normal">
            <span className="font-bold">Fecha:</span> {new Date(order.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
          <p className="font-normal">
            <span className="font-bold">Total:</span> {formatOrderPrice(order.totalAmount)}
          </p>
          <p className="font-normal">
            <span className="font-bold">Moneda:</span> {orderCurrency.code}
          </p>
          <p className="font-normal">
            <span className="font-bold">Método de pago:</span> {order.paymentMethod?.name || "No especificado"}
          </p>
        </div>

        <div className="w-full overflow-x-auto my-8 border-t border-b border-neutral-300 py-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-neutral-800 text-p-xs font-bold uppercase tracking-wider border-b border-neutral-200">
                <th className="pb-4 px-2 text-center md:text-left">Imagen de Producto</th>
                <th className="pb-4 px-2">Producto</th>
                <th className="pb-4 px-2 text-center">Precio Unitario</th>
                <th className="pb-4 px-2 text-center">Cantidad</th>
                <th className="pb-4 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.products?.map((item: any) => {
                const imgUrl = item.variation?.images?.[0]?.urlImage || "/placeholder-product.png";
                return (
                  <tr key={item.id} className="text-neutral-800 text-p-s md:text-p-b">
                    <td className="py-4 px-2 flex justify-center md:justify-start">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] overflow-hidden bg-white flex items-center justify-center border border-neutral-100">
                        <img
                          src={imgUrl}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-2 font-medium">
                      <p className="text-neutral-800 font-bold leading-tight">{item.productName}</p>
                      {item.variationName && (
                        <div className="flex items-center gap-1.5 mt-1 text-p-xs text-neutral-500">
                          <span>Variante: {item.variationName}</span>
                          {item.variation?.hexColor && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-neutral-200 block"
                              style={{ backgroundColor: item.variation.hexColor }}
                            />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2 text-center font-medium">
                      {formatOrderPrice(item.price)}
                    </td>
                    <td className="py-4 px-2 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-neutral-800">
                      {formatOrderPrice(item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="max-w-xs ml-auto space-y-3 text-p-s md:text-p-b text-neutral-800 font-medium">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatOrderPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio de envío:</span>
            <span>{shippingCost === 0 ? "Gratis" : formatOrderPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Descuento aplicado:</span>
            <span>{discountPercentage > 0 ? `${discountPercentage}%` : "0%"}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-neutral-300 text-p-b md:text-h5-b font-extrabold text-neutral-800">
            <span className="text-brand-500">Total</span>
            <span className="text-brand-500">{formatOrderPrice(order.totalAmount)}</span>
          </div>
        </div>

        <div className="w-full md:w-[60vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          <div className="bg-white p-6 rounded-[24px] shadow-sm border-none space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h5 className="font-extrabold text-neutral-800 text-p-b">Detalles de envío</h5>
              </div>
              <div className="space-y-2.5 text-p-s text-neutral-800">
                <p><span className="font-bold">Receptor:</span> {order.shippingAddress?.fullname || "No especificado"}</p>
                <p><span className="font-bold">Ciudad:</span> {order.shippingAddress?.city || "No especificado"}</p>
                <p><span className="font-bold">Dirección:</span> {order.shippingAddress?.direction || "No especificado"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] shadow-sm border-none space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h5 className="font-extrabold text-neutral-800 text-p-b">Gracias</h5>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-neutral-800 flex-shrink-0 mt-0.5">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-p-s text-neutral-800 leading-relaxed font-normal">
                  Un correo electrónico con todos los detalles sobre la compra ha sido enviado a: <br />
                  <span className="font-bold text-neutral-800">{order.profile?.email || "correo@gmail.com"}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-3 pt-3">
              <Link
                to="/"
                className="flex-1 text-center bg-brand-400 hover:bg-brand-500 text-white py-2.5 px-4 rounded-[15px] font-bold text-p-sm transition-all active:scale-[0.98]"
              >
                Volver a Inicio
              </Link>
              <Link
                to="/cuenta/pedidos"
                className="flex-1 text-center border border-brand-400 hover:bg-brand-50 text-neutral-700 py-2.5 px-4 rounded-[15px] font-normal text-p-sm transition-all active:scale-[0.98]"
              >
                Ver historial de pedidos
              </Link>
            </div>
          </div>

        </div>

      </div>

      {carouselProducts.length > 0 && (
        <div className="w-[95vw] mx-auto mt-20">
          <h3 className="text-center text-h3-s md:text-h3-b font-extrabold text-neutral-800 tracking-tight mb-10">
            También te puede interesar
          </h3>
          <div className="w-full">
            <ProductCarousel
              products={carouselProducts}
              id="recommended-success"
              autoplayDelay={4500}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderSuccessPage;
