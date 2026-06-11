import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  PauseCircleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { cashRegisterService, type CashRegister } from "../../services/cashRegisterService";
import CajasSkeleton from "../../components/admin/skeletons/CajasSkeleton";
import { currencyService } from "../../services/currencyService";
import type { Currency } from "../../services/productService";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

/* ─── Mock audit history ─── */
interface AuditEntry {
  id: string;
  concept: string;
  orderId?: string;
  amount: number;
  type: "in" | "out";
  date: string;
}

const MOCK_HISTORY: AuditEntry[] = [
  { id: "1", concept: "Venta web #1283", orderId: "ORD-1283", amount: 45.00, type: "in", date: "2026-06-02T14:30:00" },
  { id: "2", concept: "Retiro a banco", amount: 120.00, type: "out", date: "2026-06-02T10:15:00" },
  { id: "3", concept: "Venta web #1280", orderId: "ORD-1280", amount: 32.50, type: "in", date: "2026-06-01T18:45:00" },
  { id: "4", concept: "Reembolso parcial", orderId: "ORD-1275", amount: 15.00, type: "out", date: "2026-06-01T09:20:00" },
];

/* ─── Helpers ─── */
const formatMoney = (amount: number | undefined, symbol: string, position: "LEFT" | "RIGHT", decimals: number) => {
  const val = amount ?? 0;
  const str = val.toLocaleString("es-VE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return position === "LEFT" ? `${symbol}${str}` : `${str} ${symbol}`;
};

const formatDateTime = (d: string) => new Date(d).toLocaleString("es-VE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const PURPOSES = [
  { label: "Ventas web", color: "bg-blue-500" },
  { label: "Tienda física", color: "bg-orange-500" },
  { label: "Caja chica", color: "bg-emerald-500" },
  { label: "Reservas", color: "bg-purple-500" },
];

const CajasPage = () => {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCaja, setEditingCaja] = useState<CashRegister | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmFreeze, setConfirmFreeze] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailCaja, setDetailCaja] = useState<CashRegister | null>(null);

  /* Wizard state */
  const [wizardStep, setWizardStep] = useState(1);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formCurrencyId, setFormCurrencyId] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLimitAlert, setFormLimitAlert] = useState("");
  const [formAllowWithdraw, setFormAllowWithdraw] = useState(true);
  const [formAllowDeposit, setFormAllowDeposit] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cajas, monedas] = await Promise.all([
        cashRegisterService.getAllCashRegisters(),
        currencyService.getAllCurrencies(),
      ]);
      setCashRegisters(cajas);
      setCurrencies(monedas);
    } catch {
      toast.error("No se pudieron cargar las cajas.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetWizard = () => {
    setWizardStep(1);
    setFormName("");
    setFormDescription("");
    setFormPurpose("");
    setFormCurrencyId(currencies[0]?.id || "");
    setFormIsActive(true);
    setFormLimitAlert("");
    setFormAllowWithdraw(true);
    setFormAllowDeposit(true);
    setEditingCaja(null);
  };

  const openCreate = () => {
    resetWizard();
    setShowForm(true);
  };

  const openEdit = (caja: CashRegister) => {
    setEditingCaja(caja);
    setFormName(caja.name);
    setFormDescription(caja.description || "");
    setFormCurrencyId(caja.currency.id);
    setFormIsActive(caja.isActive);
    setShowForm(true);
    setWizardStep(1);
    setOpenMenuId(null);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCurrencyId) {
      toast.error("Nombre y moneda son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      if (editingCaja) {
        const updated = await cashRegisterService.updateCashRegister(editingCaja.id, {
          name: formName,
          description: formDescription,
          currencyId: formCurrencyId,
          isActive: formIsActive,
        });
        setCashRegisters((prev) => prev.map((c) => c.id === editingCaja.id ? updated : c));
        toast.success("Caja actualizada correctamente.");
      } else {
        const created = await cashRegisterService.createCashRegister({
          name: formName,
          description: [formPurpose, formDescription].filter(Boolean).join(" — "),
          currencyId: formCurrencyId,
          isActive: formIsActive,
        });
        setCashRegisters((prev) => [...prev, created]);
        toast.success("Caja creada correctamente.");
      }
      setShowForm(false);
      resetWizard();
    } catch {
      toast.error("Error al guardar la caja.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await cashRegisterService.deleteCashRegister(id);
      setCashRegisters((prev) => prev.filter((c) => c.id !== id));
      if (detailCaja?.id === id) setDetailCaja(null);
      toast.success("Caja eliminada correctamente.");
    } catch {
      toast.error("No se pudo eliminar la caja.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleFreeze = async (id: string) => {
    const caja = cashRegisters.find((c) => c.id === id);
    if (!caja) return;
    try {
      const updated = await cashRegisterService.updateCashRegister(id, {
        name: caja.name,
        description: caja.description,
        currencyId: caja.currency.id,
        isActive: !caja.isActive,
      });
      setCashRegisters((prev) => prev.map((c) => c.id === id ? updated : c));
      if (detailCaja?.id === id) setDetailCaja(updated);
      toast.success(caja.isActive ? "Caja congelada correctamente." : "Caja reactivada correctamente.");
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
    setConfirmFreeze(null);
  };

  /* ─── Wizard renderer ─── */
  if (showForm) {
    const selectedCurrency = currencies.find((c) => c.id === formCurrencyId);
    const canNextStep1 = formName.trim().length > 0;
    const canNextStep2 = !!formCurrencyId;

    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setShowForm(false); resetWizard(); }} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">
            {editingCaja ? "Editar Caja" : "Nueva Caja"}
          </h2>
        </div>

        {/* Stepper */}
        {!editingCaja && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${wizardStep >= s ? "bg-brand-400 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                  {wizardStep > s ? <CheckCircleIcon className="w-5 h-5" /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${wizardStep >= s ? "text-brand-400" : "text-neutral-400"}`}>
                  {s === 1 ? "Identidad" : s === 2 ? "Moneda" : "Control"}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${wizardStep > s ? "bg-brand-400" : "bg-neutral-200"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Identity */}
        {(editingCaja || wizardStep === 1) && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-text-base block mb-2">Nombre de la caja</label>
                  <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: Caja Principal" className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-text-base block mb-2">Propósito</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PURPOSES.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setFormPurpose(p.label)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${formPurpose === p.label ? "bg-brand-50 border-brand-400 text-brand-500" : "bg-white border-neutral-200 text-text-base hover:border-neutral-300"}`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} /> {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-text-base block mb-2">Descripción adicional</label>
                  <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Notas internas..." className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white resize-none" />
                </div>
              </div>
              <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 flex flex-col items-center justify-center">
                {formPurpose && (
                  <span className={`w-10 h-10 rounded-full mb-3 ${PURPOSES.find((p) => p.label === formPurpose)?.color}`} />
                )}
                <p className="text-lg font-bold text-neutral-800">{formName || "Nueva Caja"}</p>
                <p className="text-p-xs text-text-muted mt-1">{formPurpose || "Sin propósito definido"}</p>
              </div>
            </div>

            {!editingCaja && (
              <div className="flex justify-end">
                <button onClick={() => canNextStep1 && setWizardStep(2)} disabled={!canNextStep1} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-40 flex items-center gap-2">
                  Siguiente <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Currency */}
        {wizardStep === 2 && !editingCaja && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                placeholder="Buscar moneda..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  const found = currencies.find((c) => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term));
                  if (found) setFormCurrencyId(found.id);
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currencies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFormCurrencyId(c.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${formCurrencyId === c.id ? "bg-brand-50 border-brand-400 ring-1 ring-brand-400" : "bg-white border-neutral-200 hover:border-neutral-300"}`}
                >
                  <p className="text-lg font-bold text-neutral-800">{c.code}</p>
                  <p className="text-p-xs text-text-muted">{c.name}</p>
                  <p className="text-sm text-brand-400 font-bold mt-1">{c.symbol}</p>
                </button>
              ))}
            </div>

            {selectedCurrency && (
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 text-center">
                <p className="text-p-xs text-text-muted mb-2">Previsualización del formato</p>
                <p className="text-3xl font-black text-neutral-800">
                  {formatMoney(12345.67, selectedCurrency.symbol, selectedCurrency.symbolPosition, selectedCurrency.decimalPlaces)}
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-700">Una vez creada la caja, <strong>la moneda no podrá ser modificada</strong> para mantener la integridad contable.</p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setWizardStep(1)} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">Atrás</button>
              <button onClick={() => canNextStep2 && setWizardStep(3)} disabled={!canNextStep2} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-40 flex items-center gap-2">
                Siguiente <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Controls */}
        {wizardStep === 3 && !editingCaja && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                <div>
                  <h3 className="text-p-b font-bold text-text-base">Permitir retiros</h3>
                  <p className="text-p-sm text-text-muted">Los usuarios autorizados pueden retirar dinero</p>
                </div>
                <button onClick={() => setFormAllowWithdraw(!formAllowWithdraw)} className={`relative w-12 h-6 rounded-full transition-colors ${formAllowWithdraw ? "bg-success-500" : "bg-neutral-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formAllowWithdraw ? "translate-x-6" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                <div>
                  <h3 className="text-p-b font-bold text-text-base">Permitir depósitos</h3>
                  <p className="text-p-sm text-text-muted">Los usuarios autorizados pueden ingresar dinero</p>
                </div>
                <button onClick={() => setFormAllowDeposit(!formAllowDeposit)} className={`relative w-12 h-6 rounded-full transition-colors ${formAllowDeposit ? "bg-success-500" : "bg-neutral-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formAllowDeposit ? "translate-x-6" : ""}`} />
                </button>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                <h3 className="text-p-b font-bold text-text-base mb-2">Límite de alerta</h3>
                <p className="text-p-sm text-text-muted mb-3">Si el balance supera o baja de esta cantidad, se envía una notificación.</p>
                <input
                  type="number"
                  value={formLimitAlert}
                  onChange={(e) => setFormLimitAlert(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-between bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                <div>
                  <h3 className="text-p-b font-bold text-text-base">Estado inicial</h3>
                  <p className="text-p-sm text-text-muted">{formIsActive ? "Caja activa" : "Caja en borrador"}</p>
                </div>
                <button onClick={() => setFormIsActive(!formIsActive)} className={`relative w-12 h-6 rounded-full transition-colors ${formIsActive ? "bg-success-500" : "bg-neutral-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formIsActive ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setWizardStep(2)} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">Atrás</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : "Crear caja"}
              </button>
            </div>
          </div>
        )}

        {/* Edit mode: simple save */}
        {editingCaja && (
          <div className="flex justify-end pt-6 border-t border-neutral-100">
            <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── Detail panel ─── */
  if (detailCaja) {
    const caja = detailCaja;
    const inTotal = MOCK_HISTORY.filter((h) => h.type === "in").reduce((s, h) => s + h.amount, 0);
    const outTotal = MOCK_HISTORY.filter((h) => h.type === "out").reduce((s, h) => s + h.amount, 0);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setDetailCaja(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">{caja.name}</h2>
              <p className="text-p-sm text-text-muted mt-0.5">
                {formatMoney(caja.balance, caja.currency.symbol, caja.currency.symbolPosition, caja.currency.decimalPlaces)} — {caja.currency.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setConfirmFreeze(caja.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-300 text-text-base hover:bg-neutral-50 transition-colors">
              <PauseCircleIcon className="w-4 h-4" /> {caja.isActive ? "Congelar" : "Reactivar"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-neutral-300 text-text-base hover:bg-neutral-50 transition-colors">
              <DocumentArrowDownIcon className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left 35% */}
          <div className="lg:w-[35%] space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
              <h3 className="text-p-b font-bold text-text-base mb-4">Métodos de pago</h3>
              <div className="relative w-40 h-40 mx-auto">
                {/* CSS donut chart */}
                <div className="w-full h-full rounded-full" style={{ background: "conic-gradient(#E6426E 0% 45%, #3B82F6 45% 75%, #10B981 75% 100%)" }} />
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-text-muted">Total</p>
                    <p className="text-sm font-bold text-neutral-800">{caja.currency.symbol}{inTotal + outTotal}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-[#E6426E]" /> Tarjeta (45%)</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-blue-500" /> Transferencia (30%)</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Efectivo (25%)</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
              <h3 className="text-p-b font-bold text-text-base mb-4">Resumen 24h</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">Entradas</span>
                  <span className="text-sm font-bold text-success-500">+{caja.currency.symbol}{inTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">Salidas</span>
                  <span className="text-sm font-bold text-danger-500">-{caja.currency.symbol}{outTotal.toFixed(2)}</span>
                </div>
                <div className="h-px bg-neutral-100" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-text-base">Neto</span>
                  <span className="text-sm font-bold text-neutral-800">{caja.currency.symbol}{(inTotal - outTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 65% */}
          <div className="lg:flex-1 bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
            <h3 className="text-p-b font-bold text-text-base mb-4">Historial de movimientos</h3>
            <div className="space-y-1">
              {MOCK_HISTORY.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${entry.type === "in" ? "bg-success-500/10" : "bg-red-50"}`}>
                    {entry.type === "in" ? <ArrowDownRightIcon className="w-5 h-5 text-success-500" /> : <ArrowUpRightIcon className="w-5 h-5 text-danger-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-base truncate">{entry.concept}</p>
                    <p className="text-p-xs text-text-muted">{entry.orderId || "Movimiento manual"} — {formatDateTime(entry.date)}</p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${entry.type === "in" ? "text-success-500" : "text-danger-500"}`}>
                    {entry.type === "in" ? "+" : "-"}{caja.currency.symbol}{entry.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main list ─── */
  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Eliminar caja"
        message="¿Estás seguro de eliminar esta caja? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleting}
      />
      <ConfirmDialog
        isOpen={confirmFreeze !== null}
        onClose={() => setConfirmFreeze(null)}
        onConfirm={() => confirmFreeze && handleFreeze(confirmFreeze)}
        title={cashRegisters.find((c) => c.id === confirmFreeze)?.isActive ? "Congelar caja" : "Reactivar caja"}
        message={cashRegisters.find((c) => c.id === confirmFreeze)?.isActive
          ? "Al congelar la caja, no se podrán realizar movimientos hasta que sea reactivada."
          : "La caja volverá a estar operativa para recibir y enviar movimientos."
        }
        confirmLabel={cashRegisters.find((c) => c.id === confirmFreeze)?.isActive ? "Congelar" : "Reactivar"}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h4-s md:text-h4-b font-extrabold text-neutral-800 tracking-tight">Cajas</h2>
          <p className="text-p-sm text-text-muted mt-0.5">{cashRegisters.length} cajas registradas</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm">
          <PlusIcon className="w-5 h-5" /> Nueva caja
        </button>
      </div>

      {loading ? <CajasSkeleton /> : cashRegisters.length === 0 ? (
        <div className="p-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-neutral-100">
          <BanknotesIcon className="w-12 h-12 text-neutral-300 mb-4" />
          <p className="text-text-muted font-medium text-lg mb-2">No hay cajas registradas</p>
          <p className="text-text-muted text-sm mb-6">Crea tu primera caja para empezar a gestionar tu liquidez.</p>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
            <PlusIcon className="w-5 h-5" /> Nueva caja
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cashRegisters.map((caja) => {
            const isOpen = openMenuId === caja.id;
            return (
              <div
                key={caja.id}
                onClick={() => setDetailCaja(caja)}
                className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-5 hover:shadow-md transition-all cursor-pointer relative"
              >
                {/* Top: Currency + Menu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${caja.isActive ? "bg-success-500 animate-pulse" : "bg-neutral-300"}`} />
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{caja.currency.code} {caja.currency.symbol}</span>
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(isOpen ? null : caja.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-2xl border border-neutral-100 shadow-xl py-2 animate-fade-in">
                          <button onClick={() => openEdit(caja)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
                            <PencilIcon className="w-4 h-4 text-text-muted" /> Editar
                          </button>
                          <button onClick={() => { setOpenMenuId(null); setConfirmFreeze(caja.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
                            <PauseCircleIcon className="w-4 h-4 text-text-muted" /> {caja.isActive ? "Congelar" : "Reactivar"}
                          </button>
                          <button onClick={() => { setOpenMenuId(null); setConfirmDelete(caja.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <TrashIcon className="w-4 h-4" /> Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Center: Balance */}
                <div className="text-center py-4">
                  <p className="text-3xl font-black text-neutral-800 tracking-tight">
                    {formatMoney(caja.balance, caja.currency.symbol, caja.currency.symbolPosition, caja.currency.decimalPlaces)}
                  </p>
                  <p className="text-p-xs text-text-muted mt-1">Balance actual</p>
                </div>

                {/* Bottom: Name + Status */}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-800 truncate">{caja.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${caja.isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
                      {caja.isActive ? "Activa" : "Congelada"}
                    </span>
                  </div>
                  {caja.description && (
                    <p className="text-p-xs text-text-muted line-clamp-1">{caja.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CajasPage;
