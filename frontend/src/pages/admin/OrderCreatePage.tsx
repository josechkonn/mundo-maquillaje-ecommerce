import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService";
import { currencyService } from "../../services/currencyService";
import { shippingMethodService } from "../../services/shippingMethodService";
import { paymentMethodService } from "../../services/paymentMethodService";
import StepCliente from "../../components/admin/orders/StepCliente";
import type { ShippingAddressData } from "../../components/admin/orders/StepCliente";
import StepProductos from "../../components/admin/orders/StepProductos";
import type { OrderProductEntry } from "../../components/admin/orders/StepProductos";
import StepResumen from "../../components/admin/orders/StepResumen";
import type { Currency } from "../../services/productService";
import type { ShippingMethod } from "../../services/shippingMethodService";
import type { PaymentMethod } from "../../services/paymentMethodService";

const STEP_LABELS = ["Cliente", "Productos", "Resumen"];

const OrderCreatePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1 state
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [address, setAddress] = useState<ShippingAddressData>({
    name: "", fullname: "", phone: "", direction: "", city: "",
    state: "", municipality: "", parish: "",
  });

  // Step 2 state
  const [orderProducts, setOrderProducts] = useState<OrderProductEntry[]>([]);
  const [currencyId, setCurrencyId] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Resolved objects for summary
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
  const [allShippingMethods, setAllShippingMethods] = useState<ShippingMethod[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([]);

  const currency = allCurrencies.find((c) => c.id === currencyId);
  const shippingMethod = allShippingMethods.find((s) => s.id === shippingMethodId);
  const paymentMethod = allPaymentMethods.find((p) => p.id === paymentMethodId);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    currencyService.getAllCurrencies().then(setAllCurrencies).catch(() => {});
    shippingMethodService.getAll().then(setAllShippingMethods).catch(() => {});
    paymentMethodService.getAll().then(setAllPaymentMethods).catch(() => {});
  }, []);

  // Step 3 state
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [includeVoucher, setIncludeVoucher] = useState(true);

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 2)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleCreateOrder = async () => {
    if (!selectedClient) return;
    setIsCreating(true);
    try {
      await orderService.createAdminOrder({
        profileId: selectedClient.id,
        products: orderProducts,
        currencyId,
        paymentMethodId,
        shippingMethodId,
        shippingCost,
        discountAmount,
        shippingAddress: {
          name: address.fullname,
          fullname: address.fullname,
          phone: address.phone,
          direction: address.direction,
          city: address.city,
          state: address.state,
          municipality: address.municipality,
          parish: address.parish,
        },
        paymentReference: includeVoucher ? paymentReference : undefined,
        receiptUrl: includeVoucher ? receiptUrl : undefined,
      });
      toast.success("Pedido creado exitosamente");
      navigate("/admin/pedidos");
    } catch (error: any) {
      toast.error(error?.response?.data || error.message || "Error al crear el pedido");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/admin/pedidos")}
          className="flex items-center gap-2 text-neutral-700 hover:text-brand-400 transition-colors font-medium">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver a pedidos</span>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200">
        <div className="flex items-center justify-center gap-0 max-w-md mx-auto">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? "bg-green-500 text-white" :
                  i === step ? "bg-brand-400 text-white shadow-md shadow-brand-200" :
                  "bg-neutral-200 text-neutral-500"
                }`}>
                  {i < step ? <CheckIcon className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium transition-colors duration-200 ${
                  i === step ? "text-brand-600" : i < step ? "text-green-600" : "text-neutral-400"
                }`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] transition-colors duration-300 ${
                  i < step ? "bg-green-400" : "bg-neutral-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200">
        {step === 0 && (
          <StepCliente
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            address={address}
            onAddressChange={setAddress}
            onEnterNext={nextStep}
          />
        )}
        {step === 1 && (
          <StepProductos
            products={orderProducts}
            onProductsChange={setOrderProducts}
            currencyId={currencyId}
            onCurrencyChange={setCurrencyId}
            shippingMethodId={shippingMethodId}
            onShippingMethodChange={setShippingMethodId}
            shippingCost={shippingCost}
            onShippingCostChange={setShippingCost}
            paymentMethodId={paymentMethodId}
            onPaymentMethodChange={setPaymentMethodId}
            discountAmount={discountAmount}
            onDiscountAmountChange={setDiscountAmount}
            onEnterNext={nextStep}
            onEnterPrev={prevStep}
          />
        )}
        {step === 2 && (
          <StepResumen
            selectedClient={selectedClient}
            address={address}
            products={orderProducts}
            currency={currency}
            shippingMethod={shippingMethod}
            shippingCost={shippingCost}
            paymentMethod={paymentMethod}
            discountAmount={discountAmount}
            paymentReference={paymentReference}
            onPaymentReferenceChange={setPaymentReference}
            receiptUrl={receiptUrl}
            onReceiptUrlChange={setReceiptUrl}
            includeVoucher={includeVoucher}
            onIncludeVoucherChange={setIncludeVoucher}
            isCreating={isCreating}
            onCreateOrder={handleCreateOrder}
            onEnterPrev={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default OrderCreatePage;
