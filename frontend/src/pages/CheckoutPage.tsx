import React, { useEffect } from "react";
import { useCheckoutStore } from "../store/checkoutStore";
import { useCartStore } from "../store/cartStore";
import CartSummary from "../components/cart/CartSummary";
import AddressCard from "../components/account/AddressCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import AddressForm from "../components/account/AddressForm";


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
    setSelectedAddress,
    setSelectedShipping,
    setSelectedPayment
  } = useCheckoutStore();

  const { items, discountInfo, applyDiscount, removeDiscount } = useCartStore();

  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<any>(null);

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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
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
                    price={method.price}
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

            {/* Paso 4: Comprobante */}
            <CheckoutStep number={4} title="Ingresa aquí el comprobante de pago">
              <div className="bg-white border-2 border-dashed border-brand-200 rounded-[32px] p-12 text-center shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-neutral-100 rounded-[24px] flex items-center justify-center mb-4 text-brand-300">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-p-s text-text-muted mb-8 font-medium">Sube aquí tu comprobante de pago</p>
                  <button className="bg-brand-500 text-white px-10 py-3 rounded-full font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-200 uppercase text-xs tracking-widest">
                    Examinar Archivos
                  </button>
                </div>
              </div>
            </CheckoutStep>

            <div className="flex justify-center pt-8">
              <button className="bg-brand-500 text-white px-20 py-4 rounded-full text-h4-s font-bold hover:bg-brand-600 transition-all shadow-xl shadow-brand-200">
                Finalizar compra
              </button>
            </div>
          </div>

          {/* Lado Derecho: Resumen (Sticky) */}
          <div className="lg:sticky lg:top-32 space-y-6 lg:mt-20">
            <CartSummary
              items={items}
              shippingCost={shippingMethods.find(m => m.id === selectedShippingId)?.price || 0}
              isCheckout={true}
              discountInfo={discountInfo}
              onApplyDiscount={applyDiscount}
              onRemoveDiscount={removeDiscount}
              onProcessCheckout={() => console.log("Finalizando compra")}
            />
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
      className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${isSelected ? "border-brand-400 bg-[#FCE8ED]" : "border-white bg-white hover:border-brand-100"
        }`}
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-brand-400" : "border-neutral-200"
            }`}>
            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>}
          </div>
          <p className={`font-bold text-p-sm transition-colors ${isSelected ? "text-text-base" : "text-text-muted"}`}>{title}</p>
        </div>
        {price !== undefined && (
          <p className="font-bold text-brand-400">{price === 0 ? "Gratis" : `$${price}`}</p>
        )}
      </div>

      {showFields && fields && fields.length > 0 && (
        <div className="px-5 pb-5 pt-0 border-t border-brand-100/50 mt-2">
          <div className="mt-4 p-4 bg-white/50 rounded-xl space-y-2">
            <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider mb-2">Datos para el pago:</p>
            {fields.map((f: any) => (
              <p key={f.id} className="text-[12px] text-text-base flex justify-between">
                <span className="text-text-muted">{f.field}:</span>
                <span className="font-semibold">{f.value}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
