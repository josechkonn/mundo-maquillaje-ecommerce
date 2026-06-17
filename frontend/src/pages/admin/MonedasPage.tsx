import { useState, useEffect, useMemo } from "react";
import {
  PlusIcon,
  CheckIcon,
  TrashIcon,
  CalculatorIcon,
  ArrowUturnLeftIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { currencyService } from "../../services/currencyService";
import { type Currency } from "../../services/productService";
import { formatPrice, convertAndFormatPrice } from "../../lib/formatters";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import MonedasSkeleton from "../../components/admin/skeletons/MonedasSkeleton";

const flagColor = (code: string) => {
  const map: Record<string, string> = {
    USD: "bg-brand-500", EUR: "bg-brand-400", GBP: "bg-brand-600",
    JPY: "bg-danger-500", CAD: "bg-brand-300", MXN: "bg-success-500",
    BRL: "bg-success-500", CHF: "bg-danger-500", CNY: "bg-brand-700",
    AUD: "bg-neutral-600", COP: "bg-brand-800", VES: "bg-neutral-500",
    VEF: "bg-neutral-500", BS: "bg-neutral-500",
  };
  return map[code] || "bg-neutral-400";
};

/* Preview: how 10 USD converts to this currency */
const previewConvert = (target: Currency, all: Currency[]) => {
  const getRate = (code: string) => {
    const c = all.find(curr => {
      const db = curr.code.toUpperCase().trim();
      const s = code.toUpperCase().trim();
      return db === s || (s === "VES" && ["VEF", "BS", "VES"].includes(db));
    });
    return c?.exchangeRate || 1;
  };
  const rateVES = getRate("VES");
  const rateCOP = getRate("COP");
  const tgtCode = target.code.toUpperCase();
  const isVES = (c: string) => ["VES", "VEF", "BS"].includes(c);
  let val = 10;
  if (isVES(tgtCode)) val = 10 * rateVES;
  else if (tgtCode === "COP") val = 10 * (rateVES * rateCOP);
  else val = 10 * (target.exchangeRate || 1);
  return formatPrice(val, target);
};

const validateCurrency = (c: Partial<Currency>): string | null => {
  if (!c.name || c.name.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (!c.code || !/^[A-Z]{3}$/.test(c.code.trim())) return "El código debe ser 3 letras mayúsculas (ej: VES)";
  if (!c.symbol || c.symbol.trim().length === 0) return "El símbolo es obligatorio";
  if (c.exchangeRate === undefined || c.exchangeRate === null || c.exchangeRate <= 0) return "La tasa debe ser mayor a 0";
  if (c.decimalPlaces === undefined || c.decimalPlaces === null || c.decimalPlaces < 0 || c.decimalPlaces > 4) return "Decimales entre 0 y 4";
  return null;
};

const MonedasPage = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, Partial<Currency>>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncingBCV, setSyncingBCV] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
    name: "", code: "", symbol: "", exchangeRate: 700,
    decimalPlaces: 2, symbolPosition: "LEFT", isActive: true,
  });
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

  const [simAmount, setSimAmount] = useState("10");
  const [simCurrency, setSimCurrency] = useState<string>("USD");

  useEffect(() => { fetchCurrencies(); }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      setCurrencies(await currencyService.getAllCurrencies());
    } catch { toast.error("Error al cargar monedas"); }
    setLoading(false);
  };

  const activeCurrencies = useMemo(() => currencies.filter(c => c.isActive !== false), [currencies]);

  const getValue = (id: string, key: keyof Currency) => {
    if (editing[id] && key in editing[id]) return editing[id][key];
    const c = currencies.find(x => x.id === id);
    return c ? (c as any)[key] : "";
  };

  const updateField = (id: string, key: keyof Currency, value: any) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const hasChanges = (id: string) => {
    if (!editing[id]) return false;
    const orig = currencies.find(c => c.id === id)!;
    const draft = editing[id];
    return Object.keys(draft).some(k => (draft as any)[k] !== (orig as any)[k]);
  };

  const saveOne = async (id: string) => {
    const draft = editing[id];
    if (!draft) return;
    const original = currencies.find(c => c.id === id)!;
    const payload = { ...original, ...draft };
    const error = validateCurrency(payload);
    if (error) { toast.error(error); return; }
    try {
      await currencyService.updateCurrency(id, payload);
      toast.success("Guardado");
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchCurrencies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error al guardar");
    }
  };

  const discardOne = (id: string) => {
    if (hasChanges(id)) setConfirmDiscard(id);
    else setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleDeleteClick = (id: string) => setConfirmDelete(id);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete);
    try {
      await currencyService.deleteCurrency(confirmDelete);
      toast.success("Eliminada");
      await fetchCurrencies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error al eliminar");
    }
    setDeletingId(null); setConfirmDelete(null);
  };

  const isVESCode = (code: string) => ["VES", "VEF", "BS"].includes(code.toUpperCase());

  const handleSyncBCV = async () => {
    setSyncingBCV(true);
    try {
      const result = await currencyService.syncBCVRate();
      if (result.success) {
        toast.success(`Tasa BCV sincronizada: ${result.rate}`);
        await fetchCurrencies();
      } else {
        toast.error(result.message || "Error al sincronizar con BCV");
      }
    } catch (err: any) {
      toast.error(err?.message || "No se pudo conectar con el BCV");
    }
    setSyncingBCV(false);
  };

  const handleCreate = async () => {
    const error = validateCurrency(newCurrency);
    if (error) { toast.error(error); setNewErrors({ general: error }); return; }
    if (currencies.some(c => c.code === newCurrency.code?.toUpperCase().trim())) {
      toast.error("Ese código ya existe");
      setNewErrors({ code: "Código duplicado" });
      return;
    }
    setCreating(true);
    try {
      await currencyService.createCurrency(newCurrency);
      toast.success(`${newCurrency.code} añadida`);
      setAddOpen(false);
      setNewCurrency({ name: "", code: "", symbol: "", exchangeRate: 700, decimalPlaces: 2, symbolPosition: "LEFT", isActive: true });
      setNewErrors({});
      await fetchCurrencies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error al añadir");
    }
    setCreating(false);
  };

  const simAmountNum = parseFloat(simAmount) || 0;
  const simSource = currencies.find(c => c.code === simCurrency);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Monedas</h2>
          <p className="text-p-s md:text-p-b text-text-muted mt-1">Todas las divisas de la tienda son manuales. Edita la tasa de cada una.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-neutral-200 text-text-base font-bold text-sm hover:border-brand-300 transition-colors"
          >
            <CalculatorIcon className="w-5 h-5 text-brand-500" />
            Simular conversión
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="hidden inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Añadir
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? <MonedasSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currencies.map(c => {
            const changed = hasChanges(c.id);
            const isActive = getValue(c.id, "isActive") !== false;

            return (
              <div key={c.id} className={`bg-white rounded-[30px] border transition-all ${changed ? "border-brand-300 shadow-md" : "border-neutral-100 shadow-sm"} ${!isActive ? "opacity-50" : ""}`}>
                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${flagColor(c.code)}`}>
                      {c.code.slice(0,2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-base">{c.name}</p>
                      <p className="text-p-xs text-text-muted">{c.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isVESCode(c.code) && (
                      <button
                        onClick={handleSyncBCV}
                        disabled={syncingBCV}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Sincronizar tasa oficial BCV"
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${syncingBCV ? "animate-spin" : ""}`} />
                      </button>
                    )}
                    {changed && (
                      <>
                        <button onClick={() => discardOne(c.id)} className="p-2 rounded-xl bg-neutral-50 text-neutral-500 hover:bg-neutral-100" title="Descartar">
                          <ArrowUturnLeftIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => saveOne(c.id)} className="p-2 rounded-xl bg-brand-50 text-brand-500 hover:bg-brand-100" title="Guardar">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDeleteClick(c.id)} className="hidden p-2 rounded-xl hover:bg-danger-50 text-neutral-400 hover:text-danger-500" title="Eliminar">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                  {/* Tasa */}
                  <div>
                    <label className="flex items-center gap-1.5 text-p-xs font-bold text-text-muted mb-1.5">
                      Tasa de cambio
                      <span title="Valor por el que se multiplica el precio base">{/* @ts-ignore */}
                        <InformationCircleIcon className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
                      </span>
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                      <span className="shrink-0 px-3 py-2.5 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">×</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={Number(getValue(c.id, "exchangeRate") ?? 0)}
                        onChange={e => updateField(c.id, "exchangeRate", parseFloat(e.target.value))}
                        className="flex-1 py-2.5 px-3 text-sm font-bold text-text-base outline-none bg-transparent min-w-0"
                      />
                    </div>
                    <p className="text-p-xs text-neutral-700 mt-1">Multiplicador usado en la conversión del sistema.</p>
                  </div>

                  {/* Símbolo + Decimales */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-p-xs font-bold text-text-muted block mb-1.5">Símbolo</label>
                      <input
                        type="text"
                        value={String(getValue(c.id, "symbol") ?? "")}
                        onChange={e => updateField(c.id, "symbol", e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-p-xs font-bold text-text-muted block mb-1.5">Decimales</label>
                      <input
                        type="number" min={0} max={4}
                        value={Number(getValue(c.id, "decimalPlaces") ?? 2)}
                        onChange={e => updateField(c.id, "decimalPlaces", parseInt(e.target.value))}
                        className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white text-center"
                      />
                    </div>
                  </div>

                  {/* Posición */}
                  <div>
                    <label className="text-p-xs font-bold text-text-muted block mb-1.5">Posición del símbolo</label>
                    <div className="flex gap-2">
                      {(["LEFT","RIGHT"] as const).map(pos => (
                        <button key={pos} onClick={() => updateField(c.id, "symbolPosition", pos)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${getValue(c.id, "symbolPosition") === pos ? "bg-brand-50 border-brand-400 text-brand-500" : "bg-white border-neutral-200 text-text-base hover:border-neutral-300"}`}>
                          {pos === "LEFT" ? "$ 1.234" : "1.234 $"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Activa */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-text-base">{isActive ? "Activa" : "Inactiva"}</span>
                    <button onClick={() => updateField(c.id, "isActive", !isActive)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${isActive ? "bg-brand-500" : "bg-neutral-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isActive ? "translate-x-5" : ""}`} />
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-p-xs text-text-muted mb-0.5">Ejemplo: $10 USD →</p>
                    <p className="text-sm font-bold text-brand-500">{previewConvert(c, currencies)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Simulator Modal ─── */}
      <Modal
        isOpen={simOpen}
        onClose={() => setSimOpen(false)}
        maxWidth="2xl"
        header={
          <div className="flex items-center gap-3">
            <CalculatorIcon className="w-6 h-6 text-brand-500" />
            <div>
              <h3 className="text-lg font-bold text-neutral-800">Simulador de conversión</h3>
              <p className="text-p-xs text-text-muted">Ingresa un monto y ve cómo se vería en cada moneda.</p>
            </div>
          </div>
        }
        footer={
          <button onClick={() => setSimOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-base hover:bg-neutral-50 transition-colors">
            Cerrar
          </button>
        }
      >
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Monto</label>
              <input
                type="number"
                value={simAmount}
                onChange={e => setSimAmount(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Moneda de origen</label>
              <select
                value={simCurrency}
                onChange={e => setSimCurrency(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-p-xs font-bold text-text-muted mb-3">Resultados</p>
            <div className="flex flex-wrap gap-3">
              {activeCurrencies.map(c => (
                <div key={c.code} className="flex-1 min-w-[130px] bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
                  <p className="text-p-xs font-bold text-text-base">{c.code}</p>
                  <p className="text-base font-bold text-brand-500 mt-1">
                    {simSource ? convertAndFormatPrice(simAmountNum, simSource, c, currencies) : formatPrice(simAmountNum, c)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Add Modal ─── */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setNewErrors({}); }}
        maxWidth="lg"
        header={
          <div>
            <h3 className="text-lg font-bold text-neutral-800">Añadir Moneda</h3>
            <p className="text-p-xs text-text-muted">Crea una nueva divisa manualmente.</p>
          </div>
        }
        footer={
          <>
            <button onClick={() => { setAddOpen(false); setNewErrors({}); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-text-base hover:bg-neutral-50 transition-colors">Cancelar</button>
            <button onClick={handleCreate} disabled={creating} className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors disabled:opacity-50">
              {creating ? "Añadiendo..." : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-p-xs font-bold text-text-muted block mb-1.5">Nombre de la moneda</label>
            <input type="text" value={newCurrency.name}
              onChange={e => { setNewCurrency(p => ({...p, name: e.target.value})); setNewErrors(prev => { const n={...prev}; delete n.name; delete n.general; return n; }); }}
              placeholder="Ej: Bolívar"
              className={`w-full py-2.5 px-3 rounded-xl border text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white ${newErrors.name||newErrors.general?"border-danger-500":"border-neutral-300"}`} autoFocus />
            {(newErrors.name||newErrors.general) && <p className="text-p-xs text-danger-500 mt-1">{newErrors.name||newErrors.general}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Código ISO (3 letras)</label>
              <input type="text" value={newCurrency.code}
                onChange={e => { setNewCurrency(p => ({...p, code: e.target.value.toUpperCase()})); setNewErrors(prev => { const n={...prev}; delete n.code; delete n.general; return n; }); }}
                placeholder="VES" maxLength={3}
                className={`w-full py-2.5 px-3 rounded-xl border text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white uppercase ${newErrors.code||newErrors.general?"border-danger-500":"border-neutral-300"}`} />
              {(newErrors.code||newErrors.general) && <p className="text-p-xs text-danger-500 mt-1">{newErrors.code||newErrors.general}</p>}
            </div>
            <div className="w-28">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Símbolo</label>
              <input type="text" value={newCurrency.symbol}
                onChange={e => { setNewCurrency(p => ({...p, symbol: e.target.value})); setNewErrors(prev => { const n={...prev}; delete n.symbol; delete n.general; return n; }); }}
                placeholder="Bs."
                className={`w-full py-2.5 px-3 rounded-xl border text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white text-center ${newErrors.symbol||newErrors.general?"border-danger-500":"border-neutral-300"}`} />
              {(newErrors.symbol||newErrors.general) && <p className="text-p-xs text-danger-500 mt-1">{newErrors.symbol||newErrors.general}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-p-xs font-bold text-text-muted mb-1.5">
              Tasa de cambio (multiplicador)
              <span title="Valor por el que se multiplica el precio base">
                <InformationCircleIcon className="w-3.5 h-3.5 text-neutral-400 cursor-help" />
              </span>
            </label>
            <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
              <span className="shrink-0 px-3 py-2.5 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">×</span>
              <input type="number" step="0.0001" value={newCurrency.exchangeRate}
                onChange={e => setNewCurrency(p => ({...p, exchangeRate: parseFloat(e.target.value)||0}))}
                placeholder="700" className="flex-1 py-2.5 px-3 text-sm font-bold text-text-base outline-none bg-transparent min-w-0" />
            </div>
            <p className="text-p-xs text-neutral-700 mt-1">Ej: 700 significa que 1 USD = 700 unidades de esta moneda.</p>
          </div>

          <div className="flex gap-3">
            <div className="w-28">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Decimales</label>
              <input type="number" min={0} max={4} value={newCurrency.decimalPlaces}
                onChange={e => setNewCurrency(p => ({...p, decimalPlaces: parseInt(e.target.value)||0}))}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-sm font-bold text-text-base outline-none focus:ring-2 focus:ring-brand-200 bg-white text-center" />
            </div>
            <div className="flex-1">
              <label className="text-p-xs font-bold text-text-muted block mb-1.5">Posición del símbolo</label>
              <div className="flex gap-2">
                {(["LEFT","RIGHT"] as const).map(pos => (
                  <button key={pos} onClick={() => setNewCurrency(p => ({...p, symbolPosition: pos}))}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${newCurrency.symbolPosition===pos?"bg-brand-50 border-brand-400 text-brand-500":"bg-white border-neutral-200 text-text-base hover:border-neutral-300"}`}>
                    {pos==="LEFT"?"$ 1.234":"1.234 $"}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </Modal>

      {/* Dialogs */}
      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDeleteConfirm}
        title="Eliminar moneda" message={`¿Eliminar ${currencies.find(c=>c.id===confirmDelete)?.code || ""} permanentemente?`} confirmLabel="Eliminar" cancelLabel="Cancelar" loading={!!deletingId} />
      <ConfirmDialog isOpen={!!confirmDiscard} onClose={() => setConfirmDiscard(null)}
        onConfirm={() => { if (confirmDiscard) { setEditing(p => { const n={...p}; delete n[confirmDiscard]; return n; }); setConfirmDiscard(null); } }}
        title="Descartar cambios" message="¿Descartar los cambios no guardados?" confirmLabel="Descartar" cancelLabel="Seguir editando" />
    </div>
  );
};

export default MonedasPage;
