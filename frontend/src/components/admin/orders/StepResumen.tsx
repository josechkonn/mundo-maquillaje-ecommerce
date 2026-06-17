import { ChevronDownIcon, SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { type Currency } from "../../../services/productService";
import { type ShippingMethod } from "../../../services/shippingMethodService";
import { type PaymentMethod } from "../../../services/paymentMethodService";
import { type UserProfile } from "../../../services/userService";
import { formatPrice } from "../../../lib/formatters";
import ReceiptUploader from "../../checkout/ReceiptUploader";
import { type ShippingAddressData } from "./StepCliente";
import { type OrderProductEntry } from "./StepProductos";

interface StepResumenProps {
  selectedClient: UserProfile | null;
  address: ShippingAddressData;
  products: OrderProductEntry[];
  currency: Currency | undefined;
  shippingMethod: ShippingMethod | undefined;
  shippingCost: number;
  paymentMethod: PaymentMethod | undefined;
  discountAmount: number;
  paymentReference: string;
  onPaymentReferenceChange: (ref: string) => void;
  receiptUrl: string;
  onReceiptUrlChange: (url: string) => void;
  includeVoucher: boolean;
  onIncludeVoucherChange: (include: boolean) => void;
  isCreating: boolean;
  onCreateOrder: () => void;
  onEnterPrev: () => void;
}

const StepResumen = ({
  selectedClient, address, products,
  currency, shippingMethod, shippingCost,
  paymentMethod, discountAmount,
  paymentReference, onPaymentReferenceChange,
  receiptUrl, onReceiptUrlChange,
  includeVoucher, onIncludeVoucherChange,
  isCreating, onCreateOrder, onEnterPrev,
}: StepResumenProps) => {
  const fmt = (amount: number) => formatPrice(amount, currency);

  const subtotal = products.reduce((s, p) => s + p.subtotal, 0);
  const total = subtotal + shippingCost - discountAmount;

  const isValid = !includeVoucher || (receiptUrl && paymentReference.trim());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-extrabold text-lg">3</div>
        <div>
          <h3 className="text-lg font-extrabold text-neutral-800">Comprobante y resumen</h3>
          <p className="text-sm text-neutral-500">Revisa todo antes de crear el pedido</p>
        </div>
      </div>

      {/* Comprobante */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-neutral-700">Comprobante de pago</h4>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-neutral-500">Incluir voucher</span>
            <div
              onClick={() => onIncludeVoucherChange(!includeVoucher)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${includeVoucher ? "bg-brand-400" : "bg-neutral-300"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${includeVoucher ? "translate-x-5" : ""}`} />
            </div>
          </label>
        </div>

        {includeVoucher ? (
          <div className="space-y-4">
            <ReceiptUploader
              onUploadComplete={onReceiptUrlChange}
              currentUrl={receiptUrl}
            />
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                Referencia del pago <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => onPaymentReferenceChange(e.target.value)}
                placeholder="Número de confirmación o referencia"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all placeholder-neutral-400"
              />
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-500 font-medium">Sin voucher</p>
            <p className="text-xs text-neutral-400 mt-0.5">El pedido se creará sin comprobante de pago</p>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h4 className="text-sm font-bold text-neutral-700">Resumen del pedido</h4>
        </div>

        <div className="p-5 space-y-5">
          {/* Cliente */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Cliente</p>
              <p className="text-sm font-bold text-neutral-800">{selectedClient?.name}</p>
              <p className="text-xs text-neutral-500">{selectedClient?.email}</p>
            </div>
          </div>

          {/* Dirección */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Dirección de envío</p>
              <p className="text-sm font-medium text-neutral-800">{address.fullname}</p>
              <p className="text-xs text-neutral-600">{address.direction}</p>
              <p className="text-xs text-neutral-600">{address.city}, {address.state}</p>
              {address.municipality && <p className="text-xs text-neutral-600">{address.municipality}{address.parish ? `, ${address.parish}` : ""}</p>}
              <p className="text-xs text-neutral-600">Telf: {address.phone}</p>
            </div>
          </div>

          {/* Config */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Configuración</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {currency && <span className="text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-medium">{currency.name} ({currency.code})</span>}
                {shippingMethod && <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{shippingMethod.name}</span>}
                {paymentMethod && <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">{paymentMethod.name}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="border-t border-neutral-100">
          <div className="px-5 py-3 bg-neutral-50/50">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Productos ({products.length})</p>
          </div>
          <div className="px-5 py-3 space-y-2">
            {products.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800 truncate">{p.productName}</p>
                  <p className="text-xs text-neutral-500">{p.variationName} x{p.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-800 ml-3">{fmt(p.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="border-t border-neutral-100 px-5 py-4 bg-neutral-50">
          <div className="space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="font-medium text-neutral-800">{fmt(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Descuento</span><span className="font-medium text-green-600">-{fmt(discountAmount)}</span></div>}
            {shippingCost > 0 && <div className="flex justify-between text-sm"><span className="text-neutral-500">Envío</span><span className="font-medium text-neutral-800">{fmt(shippingCost)}</span></div>}
            <div className="border-t border-neutral-300 pt-1.5 flex justify-between">
              <span className="font-bold text-neutral-800">Total</span>
              <span className="font-extrabold text-xl text-brand-600">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onEnterPrev} disabled={isCreating}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-all disabled:opacity-50">
          <ChevronDownIcon className="w-4 h-4 rotate-90" />
          Anterior
        </button>
        <button
          onClick={onCreateOrder}
          disabled={!isValid || isCreating}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-brand-400 to-brand-500 text-white hover:from-brand-500 hover:to-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isCreating ? (
            <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Creando pedido...</>
          ) : (
            <><SparklesIcon className="w-5 h-5" /> Crear pedido</>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepResumen;
