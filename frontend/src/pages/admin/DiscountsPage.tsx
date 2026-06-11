import { useState, useEffect, useCallback } from "react";
import { PlusIcon, TagIcon, CalendarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { discountService, type DiscountCode } from "../../services/discountService";
import { currencyService } from "../../services/currencyService";
import type { Currency } from "../../services/productService";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import DiscountsSkeleton from "../../components/admin/skeletons/DiscountsSkeleton";

const getDiscountStatus = (d: DiscountCode): "valid" | "scheduled" | "expired" | "inactive" => {
  if (!d.isActive) return "inactive";
  const now = new Date();
  if (d.startsAt && new Date(d.startsAt) > now) return "scheduled";
  if (d.expiresAt && new Date(d.expiresAt) < now) return "expired";
  return "valid";
};

const statusConfig = {
  valid: { label: "Válido", bg: "bg-success-500/10", text: "text-success-500" },
  scheduled: { label: "Programado", bg: "bg-amber-500/10", text: "text-amber-500" },
  expired: { label: "Expirado", bg: "bg-danger-500/10", text: "text-danger-500" },
  inactive: { label: "Inactivo", bg: "bg-neutral-100", text: "text-text-muted" },
};

const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FLAT_AMOUNT",
    value: 0,
    currencyId: "",
    minPurchase: "" as string | undefined,
    maxDiscount: "" as string | undefined,
    usageLimit: "" as string | undefined,
    maxUsesPerUser: 1,
    startsAt: "",
    expiresAt: "",
    isActive: true,
  });

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discountService.getAll();
      setDiscounts(data);
    } catch {
      toast.error("No se pudieron cargar los descuentos.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDiscounts();
    currencyService.getAllCurrencies().then(setCurrencies).catch(() => toast.error("Error al cargar monedas"));
  }, [fetchDiscounts]);

  const filtered = discounts.filter((d) => {
    const status = getDiscountStatus(d);
    if (statusFilter && status !== statusFilter) return false;
    if (search && !d.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = discounts.filter((d) => d.isActive).length;

  const openCreate = () => {
    setEditing(null);
    setFormData({ code: "", type: "PERCENTAGE", value: 0, currencyId: currencies.find(c => c.code === "USD")?.id || "", minPurchase: undefined, maxDiscount: undefined, usageLimit: undefined, maxUsesPerUser: 1, startsAt: "", expiresAt: "", isActive: true });
    setShowForm(true);
  };

  const openEdit = (d: DiscountCode) => {
    setEditing(d);
    setFormData({
      code: d.code,
      type: d.type,
      value: d.value,
      currencyId: d.currency?.id || "",
      minPurchase: d.minPurchase != null ? String(d.minPurchase) : undefined,
      maxDiscount: d.maxDiscount != null ? String(d.maxDiscount) : undefined,
      usageLimit: d.usageLimit != null ? String(d.usageLimit) : undefined,
      maxUsesPerUser: d.maxUsesPerUser ?? 1,
      startsAt: d.startsAt ? d.startsAt.slice(0, 16) : "",
      expiresAt: d.expiresAt ? d.expiresAt.slice(0, 16) : "",
      isActive: d.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) { toast.error("El código es obligatorio."); return; }
    if (formData.value <= 0) { toast.error("El valor debe ser mayor a 0."); return; }
    if (formData.type === "FLAT_AMOUNT" && !formData.currencyId) { toast.error("Selecciona una moneda."); return; }
    setSaving(true);
    try {
      const currency = currencies.find(c => c.id === formData.currencyId);
      const payload: Partial<DiscountCode> = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: formData.value,
        currency: formData.type === "FLAT_AMOUNT" && currency ? currency : undefined,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isActive: formData.isActive,
      };
      if (editing) {
        await discountService.update(editing.id, payload);
        toast.success("Descuento actualizado.");
      } else {
        await discountService.create(payload);
        toast.success("Descuento creado.");
      }
      setShowForm(false);
      await fetchDiscounts();
    } catch {
      toast.error("Error al guardar.");
    }
    setSaving(false);
  };

  const handleToggleActive = async (d: DiscountCode) => {
    const wasActive = d.isActive;
    setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: !x.isActive } : x));
    try {
      await discountService.update(d.id, { ...d, isActive: !wasActive });
    } catch {
      setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: wasActive } : x));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await discountService.delete(id);
      setDiscounts((prev) => prev.filter((x) => x.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Descuento eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await discountService.delete(id); } catch { }
    }
    setDiscounts((prev) => prev.filter((x) => !selectedIds.has(x.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} descuentos eliminados.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const d = discounts.find((x) => x.id === id);
      if (d) {
        try {
          await discountService.update(id, { ...d, isActive: active });
          setDiscounts((prev) => prev.map((x) => x.id === id ? { ...x, isActive: active } : x));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const formatUsage = (d: DiscountCode) => {
    if (d.usageLimit) return `${d.timesUsed} / ${d.usageLimit}`;
    return `${d.timesUsed} / ∞`;
  };

  const formatDateRange = (d: DiscountCode) => {
    if (d.startsAt && d.expiresAt) {
      const s = new Date(d.startsAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      const e = new Date(d.expiresAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      return `${s} → ${e}`;
    }
    if (d.startsAt) return `Desde ${new Date(d.startsAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`;
    if (d.expiresAt) return `Hasta ${new Date(d.expiresAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}`;
    return "Sin fecha";
  };

  const columns: ColumnDef<DiscountCode>[] = [
    {
      key: "code",
      header: "Código",
      className: "min-w-[140px]",
      render: (d) => (
        <span className="text-sm font-bold text-text-base tracking-wider font-mono">{d.code}</span>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      className: "text-center w-28",
      render: (d) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${d.type === "PERCENTAGE" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
          {d.type === "PERCENTAGE" ? "%" : "$"}
        </span>
      ),
    },
    {
      key: "value",
      header: "Valor",
      className: "text-center w-28",
      render: (d) => (
        <span className="text-sm font-semibold text-text-base">
          {d.type === "PERCENTAGE" ? `${d.value}%` : `${d.currency?.symbol || ""}${d.value.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usos",
      className: "text-center w-24",
      render: (d) => <span className="text-sm text-text-base">{formatUsage(d)}</span>,
    },
    {
      key: "validity",
      header: "Vigencia",
      className: "text-center w-36",
      render: (d) => <span className="text-p-xs text-text-muted flex items-center gap-1 justify-center"><CalendarIcon className="w-3.5 h-3.5" />{formatDateRange(d)}</span>,
    },
    {
      key: "status",
      header: "Estado",
      className: "text-center w-28",
      render: (d) => {
        const status = getDiscountStatus(d);
        const cfg = statusConfig[status];
        return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
      },
    },
    {
      key: "isActive",
      header: "",
      className: "text-center w-12",
      render: (d) => (
        <button
          onClick={() => handleToggleActive(d)}
          className={`relative w-10 h-5 rounded-full transition-colors ${d.isActive ? "bg-success-500" : "bg-neutral-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${d.isActive ? "translate-x-5" : ""}`} />
        </button>
      ),
    },
  ];

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">{editing ? "Editar Descuento" : "Nuevo Descuento"}</h2>
            <p className="text-p-xs text-text-muted">Crea un código promocional con reglas personalizadas.</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-5">
          {/* Código */}
          <div>
            <label className="text-sm font-semibold text-text-base mb-1.5 block">Código</label>
            <input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") }))} placeholder="Ej: DESCUENTO20" className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-brand-200 bg-white tracking-wider" autoFocus />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-semibold text-text-base mb-1.5 block">Tipo de descuento</label>
            <div className="flex gap-2">
              {(["PERCENTAGE", "FLAT_AMOUNT"] as const).map(type => (
                <button key={type} onClick={() => setFormData(p => ({ ...p, type }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${formData.type === type ? "bg-brand-50 border-brand-400 text-brand-500" : "bg-white border-neutral-200 text-text-base hover:border-neutral-300"}`}>
                  {type === "PERCENTAGE" ? "Porcentaje (%)" : "Monto fijo ($)"}
                </button>
              ))}
            </div>
          </div>

          {/* Valor + Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Valor {formData.type === "PERCENTAGE" ? "(%)" : ""}</label>
              <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                <input type="number" min={0} step={formData.type === "PERCENTAGE" ? 1 : 0.01} max={formData.type === "PERCENTAGE" ? 100 : undefined} value={formData.value} onChange={e => setFormData(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} className="flex-1 py-3 px-3 text-sm font-bold outline-none bg-transparent" />
                {formData.type === "PERCENTAGE" && <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">%</span>}
              </div>
            </div>
            {formData.type === "FLAT_AMOUNT" && (
              <div>
                <label className="text-sm font-semibold text-text-base mb-1.5 block">Moneda</label>
                <select value={formData.currencyId} onChange={e => setFormData(p => ({ ...p, currencyId: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white">
                  <option value="">Seleccionar...</option>
                  {currencies.filter(c => c.isActive !== false).map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Compra mínima + Descuento máximo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-text-base mb-1.5 block">
                Compra mínima
                <span title="Monto mínimo del carrito para aplicar el descuento"><InformationCircleIcon className="w-4 h-4 text-neutral-400 cursor-help" /></span>
              </label>
              <input type="number" min={0} step={0.01} value={formData.minPurchase ?? ""} onChange={e => setFormData(p => ({ ...p, minPurchase: e.target.value || undefined }))} placeholder="Opcional" className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
            {formData.type === "PERCENTAGE" && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-text-base mb-1.5 block">
                  Descuento máximo
                  <span title="Tope máximo del descuento en monto fijo"><InformationCircleIcon className="w-4 h-4 text-neutral-400 cursor-help" /></span>
                </label>
                <input type="number" min={0} step={0.01} value={formData.maxDiscount ?? ""} onChange={e => setFormData(p => ({ ...p, maxDiscount: e.target.value || undefined }))} placeholder="Opcional" className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
              </div>
            )}
          </div>

          {/* Límites de uso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-text-base mb-1.5 block">
                Límite total de usos
                <span title="0 = ilimitado"><InformationCircleIcon className="w-4 h-4 text-neutral-400 cursor-help" /></span>
              </label>
              <input type="number" min={0} value={formData.usageLimit ?? ""} onChange={e => setFormData(p => ({ ...p, usageLimit: e.target.value || undefined }))} placeholder="Ilimitado" className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-text-base mb-1.5 block">
                Usos por usuario
                <span title="1 = un solo uso, 0 = ilimitado"><InformationCircleIcon className="w-4 h-4 text-neutral-400 cursor-help" /></span>
              </label>
              <input type="number" min={0} value={formData.maxUsesPerUser} onChange={e => setFormData(p => ({ ...p, maxUsesPerUser: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Inicio</label>
              <input type="datetime-local" value={formData.startsAt} onChange={e => setFormData(p => ({ ...p, startsAt: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Expiración</label>
              <input type="datetime-local" value={formData.expiresAt} onChange={e => setFormData(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-text-base">{formData.isActive ? "Activo" : "Inactivo"}</span>
            <button onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} className={`relative w-12 h-7 rounded-full transition-colors ${formData.isActive ? "bg-success-500" : "bg-neutral-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold text-text-base hover:bg-neutral-50 transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white text-sm font-bold hover:bg-brand-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {editing ? "Guardar cambios" : "Crear descuento"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete === "bulk") handleBulkDelete(); else if (confirmDelete) handleDelete(confirmDelete); }}
        title={confirmDelete === "bulk" ? "Eliminar descuentos" : "Eliminar descuento"}
        message={confirmDelete === "bulk" ? `¿Eliminar ${selectedIds.size} descuentos? Esta acción no se puede deshacer.` : "¿Eliminar este descuento? Esta acción no se puede deshacer."}
        loading={deleting}
      />

      {loading ? <DiscountsSkeleton /> : (
      <DataTable
        title="Descuentos"
        titleInfo={`${discounts.length} códigos · ${activeCount} activos`}
        columns={columns}
        data={filtered}
        isLoading={false}
        totalItems={discounts.length}
        onSearch={setSearch}
        searchPlaceholder="Buscar por código..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(d) => d.id}
        onEdit={openEdit}
        onDelete={(d) => setConfirmDelete(d.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar descuentos"
        filters={[
          { key: "status", label: "Estado", options: [
            { label: "Válidos", value: "valid" },
            { label: "Programados", value: "scheduled" },
            { label: "Expirados", value: "expired" },
            { label: "Inactivos", value: "inactive" },
          ], value: statusFilter, onChange: (v) => setStatusFilter(v as string) },
        ]}
        renderHeaderActions={
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 shadow-sm transition-all active:scale-95">
            <PlusIcon className="w-5 h-5" /> Crear
          </button>
        }
        headerExtra={selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in mt-6">
            <span className="text-sm font-medium text-text-base">{selectedIds.size} seleccionados</span>
            <div className="w-px h-5 bg-brand-200" />
            <button onClick={() => handleBulkToggle(true)} className="text-sm font-medium text-brand-400 hover:text-brand-500">Activar</button>
            <button onClick={() => handleBulkToggle(false)} className="text-sm font-medium text-text-muted hover:text-text-base">Desactivar</button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
          </div>
        )}
        renderEmpty={
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <TagIcon className="w-16 h-16 text-neutral-200 mb-4" />
            <p className="text-text-muted font-medium text-lg mb-2">No hay descuentos</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primer código promocional.</p>
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 transition-all active:scale-95">
              <PlusIcon className="w-5 h-5" /> Crear descuento
            </button>
          </div>
        }
      />)}
    </>
  );
};

export default DiscountsPage;
