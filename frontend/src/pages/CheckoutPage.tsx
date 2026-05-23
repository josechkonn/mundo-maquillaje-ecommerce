import React, { useEffect } from "react";
import { useCheckoutStore } from "../store/checkoutStore";
import { useCartStore } from "../store/cartStore";
import { useCurrencyStore } from "../store/currencyStore";
import { convertAndFormatPrice } from "../lib/formatters";
import CartSummary from "../components/cart/CartSummary";
import AddressCard from "../components/account/AddressCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import AddressForm from "../components/account/AddressForm";
import ReceiptUploader from "../components/checkout/ReceiptUploader";


const CheckoutPage = () => {
  const {
    fetchConfig,
    isLoading,
    addresses,
    shippingMethods,
    paymentMethods,
    selectedAddressId,
    selectedShippingId,
    selectedPaymentId,
    receiptUrl,
    setSelectedAddress,
    setSelectedShipping,
    setSelectedPayment,
    setReceiptUrl
  } = useCheckoutStore();

  const { items, discountInfo, applyDiscount, removeDiscount } = useCartStore();
  const { currencies, selectedCurrency } = useCurrencyStore();

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<any>(null);

  const usdSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const getMethodDisplayPrice = (method: any) => {
    if (!method) return "";
    const name = method.name.toLowerCase();
    const threshold = method.freeShippingThreshold;
    const isFree = threshold != null && usdSubtotal >= threshold;

    if (name.includes("delivery")) {
      if (isFree) return "Gratis";
      const usdPrice = method.price;
      return convertAndFormatPrice(usdPrice, { code: "USD", symbol: "$", decimalPlaces: 2, symbolPosition: "LEFT", exchangeRate: 1 } as any, selectedCurrency, currencies);
    }
    return isFree ? "Gratis (Prepago)" : "Cobro en Destino";
  };

  const currentShippingMethod = shippingMethods.find(m => m.id === selectedShippingId);
  const calculatedShippingCost = (() => {
    if (!currentShippingMethod) return 0;
    const name = currentShippingMethod.name.toLowerCase();
    const threshold = currentShippingMethod.freeShippingThreshold;
    const isFree = threshold != null && usdSubtotal >= threshold;

    if (name.includes("delivery")) {
      return isFree ? 0 : currentShippingMethod.price;
    }
    return 0; // Para Zoom y MRW la tienda cobra $0.00 de envío (C.O.D. o prepago por tienda)
  })();

  const calculatedShippingLabel = (() => {
    if (!currentShippingMethod) return "A calcular";
    const name = currentShippingMethod.name.toLowerCase();
    const threshold = currentShippingMethod.freeShippingThreshold;
    const isFree = threshold != null && usdSubtotal >= threshold;

    if (name.includes("delivery")) {
      return isFree ? "Gratis" : undefined; // undefined para que renderice el precio convertido
    }
    return isFree ? "Gratis (Prepago)" : "Cobro en Destino";
  })();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPaymentId);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (data: any) => {
    console.log("Guardando dirección:", data);
    // Aquí iría la llamada al store/API para persistir
    setIsAddressModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-primary-50 pt-12 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-h2-s md:text-h2-b font-bold text-text-base">Finalizar Compra</h1>
          <p className="text-p-s text-text-muted mt-2">Completa este pequeño formulario para finalizar tu compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:items-start">
          {/* Lado Izquierdo: Pasos (Timeline) */}
          <div className="relative space-y-16">
            {/* Línea vertical conectora sólida (Imagen) */}
            <div className="absolute left-[18px] top-5 bottom-10 w-[4px] bg-brand-400 hidden md:block"></div>

            {/* Paso 1: Dirección */}
            <CheckoutStep number={1} title="Selecciona la dirección de envío">
              <div className="grid grid-cols-1 gap-4">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      variant="checkout"
                      isSelected={selectedAddressId === addr.id}
                      onSelect={() => setSelectedAddress(addr.id)}
                      onEdit={handleOpenEditAddress}
                    />
                  ))
                ) : (
                  <p className="text-p-s text-text-muted italic bg-white p-6 rounded-2xl border border-neutral-100">
                    No tienes direcciones registradas. Agrega una para continuar.
                  </p>
                )}
                <div className="flex justify-start mt-2">
                  <Button
                    variant="primary"
                    fullWidth={false}
                    onClick={handleOpenAddAddress}
                    className="!bg-brand-400 hover:!bg-brand-500 !py-3 !px-10 !rounded-2xl"
                  >
                    Agregar Dirección
                  </Button>
                </div>
              </div>
            </CheckoutStep>

            {/* Paso 2: Método de Envío */}
            <CheckoutStep number={2} title="Selecciona el método de envío">
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <SelectionCard
                    key={method.id}
                    title={method.name}
                    price={getMethodDisplayPrice(method)}
                    isSelected={selectedShippingId === method.id}
                    onSelect={() => setSelectedShipping(method.id)}
                  />
                ))}
              </div>
            </CheckoutStep>

            {/* Paso 3: Método de Pago */}
            <CheckoutStep number={3} title="Selecciona el método de pago">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <SelectionCard
                    key={method.id}
                    title={method.name}
                    isSelected={selectedPaymentId === method.id}
                    onSelect={() => setSelectedPayment(method.id)}
                    showFields={selectedPaymentId === method.id}
                    fields={method.fields}
                  />
                ))}
              </div>
            </CheckoutStep>

          </div>

          {/* Lado Derecho: Resumen (Sticky) */}
          <div className="lg:sticky lg:top-44 space-y-6 lg:mt-10">
            <CartSummary
              items={items}
              shippingCost={calculatedShippingCost}
              shippingLabel={calculatedShippingLabel}
              isCheckout={true}
              discountInfo={discountInfo}
              onApplyDiscount={applyDiscount}
              onRemoveDiscount={removeDiscount}
              onProcessCheckout={() => console.log("Finalizando compra")}
            />
          </div>
        </div>

        {/* Sección inferior para Paso 4 y Botón de Finalizar (para que el sticky termine en el Paso 3) */}
        <div className="mt-16 border-t border-neutral-100 pt-16 max-w-4xl">
          <div className="space-y-16">
            {/* Paso 4: Comprobante */}
            <CheckoutStep number={4} title="Ingresa aquí el comprobante de pago">
              <ReceiptUploader
                onUploadComplete={setReceiptUrl}
                currentUrl={receiptUrl}
              />
            </CheckoutStep>

            <div className="flex justify-center pt-8">
              <Button
                variant="primary"
                fullWidth={false}
              >
                Finalizar compra
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Dirección */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? "Editar Dirección" : "Agregar Nueva Dirección"}
        maxWidth="3xl"
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSaveAddress}
          onCancel={() => setIsAddressModalOpen(false)}
          hideHeader
        />
      </Modal>
    </div>
  );
};

// --- Sub-componentes auxiliares ---

const CheckoutStep = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
  <div className="relative pl-0 md:pl-20">
    <div className="absolute left-0 top-0 w-10 h-10 bg-brand-400 rounded-full flex items-center justify-center text-white font-bold z-10 hidden md:flex shadow-lg shadow-brand-100">
      {number}
    </div>
    <h3 className="text-h4-s md:text-h4-b font-bold text-text-base mb-8 flex items-center gap-4">
      <span className="md:hidden w-8 h-8 bg-brand-400 rounded-full flex items-center justify-center text-white text-p-sm">{number}</span>
      {title}
    </h3>
    {children}
  </div>
);

const SelectionCard = ({ title, price, isSelected, onSelect, showFields, fields }: any) => {
  return (
    <div
      onClick={onSelect}
      className={`rounded-[20px] transition-all cursor-pointer overflow-hidden ${isSelected
        ? "bg-brand-100"
        : "bg-white border border-neutral-200 hover:border-brand-100"
        }`}
    >
      {/* Header del método */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isSelected ? (
            <div className="w-7 h-7 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-neutral-300 flex-shrink-0" />
          )}
          <p className={`font-bold text-p-b transition-colors ${isSelected ? "text-text-base" : "text-text-muted"}`}>
            {title}
          </p>
        </div>
        {price !== undefined && (
          <p className="font-bold text-brand-400 text-p-b">{price === 0 ? "Gratis" : price}</p>
        )}
      </div>

      {/* Campos expandidos */}
      {showFields && fields && fields.length > 0 && (
        <div className="bg-white   p-6 space-y-4">
          <p className="text-h5-s font-bold text-text-base">Datos para el pago</p>
          <div className="space-y-3">
            {fields.map((f: any) => (
              <p key={f.id} className="text-p-b text-text-base">
                <span className="text-text-muted">{f.field}:</span>{" "}
                <span>{f.value}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
