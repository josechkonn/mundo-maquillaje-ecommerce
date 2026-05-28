import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess, toastLoading, dismissToast } from "../lib/toasts";
import { useCheckoutStore } from "../store/checkoutStore";
import { useCartStore } from "../store/cartStore";
import { useCurrencyStore } from "../store/currencyStore";
import { convertAndFormatPrice } from "../lib/formatters";
import CartSummary from "../components/cart/CartSummary";
import AddressCard from "../components/account/AddressCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import AlertModal from "../components/ui/AlertModal";
import AddressForm from "../components/account/AddressForm";
import ReceiptUploader from "../components/checkout/ReceiptUploader";
import { checkoutService } from "../services/checkoutService";


const CheckoutPage = () => {
  const navigate = useNavigate();
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
    paymentReference,
    setSelectedAddress,
    setSelectedShipping,
    setSelectedPayment,
    setReceiptUrl,
    setPaymentReference,
    reset
  } = useCheckoutStore();

  const { items, discountInfo, applyDiscount, removeDiscount, clearCart } = useCartStore();
  const { currencies, selectedCurrency, setSelectedCurrency } = useCurrencyStore();

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateCheckout = (): boolean => {
    const errors: string[] = [];

    if (!selectedAddressId) {
      errors.push("Selecciona una dirección de envío");
    }
    if (!selectedShippingId) {
      errors.push("Selecciona un método de envío");
    }
    if (!selectedPaymentId) {
      errors.push("Selecciona un método de pago");
    }
    if (!receiptUrl) {
      errors.push("Sube el comprobante de pago");
    }
    if (!paymentReference.trim()) {
      errors.push("Ingresa la referencia del pago");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return false;
    }
    return true;
  };

  const handleFinalizePurchase = async () => {
    if (!validateCheckout()) {
      return;
    }

    setIsProcessing(true);
    const loadingId = toastLoading("Procesando tu compra...");

    try {
      const response = await checkoutService.processCheckout({
        addressId: selectedAddressId,
        shippingMethodId: selectedShippingId,
        paymentMethodId: selectedPaymentId,
        paymentReference: paymentReference,
        receiptUrl: receiptUrl,
        discountCode: discountInfo?.code || undefined
      });

      dismissToast(loadingId);
      toastSuccess("¡Compra realizada con éxito!");
      
      await clearCart(true);
      
      navigate("/compra-finalizada", { state: { order: response } });
      
      reset();
    } catch (error: any) {
      dismissToast(loadingId);
      console.error("Error al procesar la compra:", error);
      const errorMessage = error.response?.data || error.message || "Ocurrió un error al procesar la compra.";
      toastError(errorMessage, { duration: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleSelectPayment = (id: string) => {
    setSelectedPayment(id);
    const method = paymentMethods.find(m => m.id === id);
    if (method?.currency?.code) {
      setSelectedCurrency(method.currency.code);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 pt-12 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-h2-s md:text-h2-b font-bold text-text-base">Finalizar Compra</h1>
          <p className="text-p-s text-text-muted mt-2">Completa este pequeño formulario para finalizar tu compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:items-start">
          {/* Lado Izquierdo: Pasos 1-3 (Timeline) */}
          <div className="relative space-y-16">
            {/* Línea vertical conectora sólida */}
            <div className="absolute left-[18px] top-[20px] bottom-0 w-[4px] bg-brand-400 hidden md:block"></div>

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
                    onSelect={() => handleSelectPayment(method.id)}
                    showFields={selectedPaymentId === method.id}
                    fields={method.fields}
                  />
                ))}
              </div>
            </CheckoutStep>

          </div>

          {/* Lado Derecho: Resumen (Sticky) */}
          <div className="lg:sticky lg:top-52 space-y-6 lg:mt-10">
            <CartSummary
              items={items}
              shippingCost={calculatedShippingCost}
              shippingLabel={calculatedShippingLabel}
              isCheckout={true}
              discountInfo={discountInfo}
              onApplyDiscount={applyDiscount}
              onRemoveDiscount={removeDiscount}
              onProcessCheckout={handleFinalizePurchase}
            />
          </div>
        </div>

        {/* Conector entre paso 3 y paso 4 */}
        <div className="relative max-w-4xl mt-16">
          <div className="absolute left-[18px] -top-16 bottom-0 w-[4px] bg-brand-400 hidden md:block"></div>

          {/* Paso 4: Comprobante */}
          <div className="relative space-y-16 md:pl-0">
            <CheckoutStep number={4} title="Ingresa aquí el comprobante de pago">
              <div className="space-y-6 bg-white p-6 md:p-8 rounded-[30px] border border-neutral-200">
                <ReceiptUploader
                  onUploadComplete={setReceiptUrl}
                  currentUrl={receiptUrl}
                />
                <div className="space-y-2">
                  <label className="block text-p-s font-bold text-neutral-800">
                    Número de Referencia del Pago
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ingrese el número de confirmación o referencia"
                    className="w-full bg-white border border-neutral-300 rounded-[20px] px-5 py-3.5 text-p-s text-neutral-800 focus:outline-none focus:border-brand-400 placeholder-neutral-400"
                  />
                </div>
              </div>
            </CheckoutStep>
          </div>
        </div>

        {/* Botón de Finalizar */}
        <div className="flex justify-center pt-16 max-w-4xl">
          <Button
            variant="primary"
            fullWidth={false}
            onClick={handleFinalizePurchase}
            disabled={isProcessing}
            className="!bg-brand-500 hover:!bg-brand-600 !py-4 !px-16 !rounded-[20px]"
          >
            {isProcessing ? "Procesando..." : "Finalizar compra"}
          </Button>
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

      {/* Modal de Validación Centralizado */}
      <AlertModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        type="warning"
        title="Campos incompletos"
        message="Para finalizar tu compra, completa los siguientes pasos:"
        details={validationErrors}
        primaryAction={{
          label: "Entendido",
          onClick: () => {},
        }}
      />

      {/* Pantalla de carga bonita procesando compra */}
      {isProcessing && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white/95 rounded-[30px] p-8 md:p-12 max-w-sm w-[90%] text-center shadow-2xl border border-brand-100 flex flex-col items-center">
            {/* Spinner y animación */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h3 className="text-h4-s font-black text-neutral-900 mb-2">
              Procesando tu compra
            </h3>
            <p className="text-p-s text-neutral-600 leading-relaxed">
              Estamos registrando tu orden y validando los datos de pago. Por favor, no cierres esta ventana.
            </p>
          </div>
        </div>
      )}
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
    <div>
      {/* Card cabecera */}
      <div
        onClick={onSelect}
        className={`rounded-[20px] transition-all cursor-pointer px-6 py-5 flex items-center justify-between relative z-10 ${
          isSelected
            ? "bg-brand-100 shadow-lg shadow-[#222222]/20"
            : "bg-white border border-neutral-200 hover:border-brand-100 hover:shadow-md hover:shadow-[#222222]/20"
        }`}
      >
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

      {/* Panel expandido */}
      {showFields && fields && fields.length > 0 && (
        <div className="bg-white rounded-b-[20px] shadow-lg shadow-[#222222]/20 px-6 py-5 space-y-4 -mt-4 pt-9">
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
