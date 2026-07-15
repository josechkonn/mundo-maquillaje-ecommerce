import { useState, useEffect, useCallback } from "react";
import { PlusIcon, CreditCardIcon, XMarkIcon, ArrowUpIcon, ArrowDownIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { paymentMethodService, type PaymentMethod } from "../../services/paymentMethodService";
import { currencyService } from "../../services/currencyService";
import { cashRegisterService, type CashRegister } from "../../services/cashRegisterService";
import type { Currency } from "../../services/productService";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ImagePickerModal from "../../components/admin/modals/ImagePickerModal";
import toast from "react-hot-toast";
import MetodosPagoSkeleton from "../../components/admin/skeletons/MetodosPagoSkeleton";

interface FieldRow {
  id: string;
  field: string;
  value: string;
  displayOrder: number;
}

const MetodosPagoPage = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    displayOrder: 1,
    currencyId: "",
    cashRegisterId: "",
    isActive: true,
    imageUrl: "",
    fields: [] as FieldRow[],
  });

  const [showImagePicker, setShowImagePicker] = useState(false);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentMethodService.getAll();
      setMethods(data);
    } catch {
      toast.error("No se pudieron cargar los métodos de pago.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMethods();
    currencyService.getAllCurrencies().then(setCurrencies).catch(() => toast.error("Error al cargar monedas"));
    cashRegisterService.getAllCashRegisters().then(setCashRegisters).catch(() => {});
  }, [fetchMethods]);

  const filtered = methods.filter((m) => {
    if (statusFilter === "active" && !m.isActive) return false;
    if (statusFilter === "inactive" && m.isActive) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = methods.filter((m) => m.isActive).length;

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", slug: "", displayOrder: methods.length + 1, currencyId: currencies[0]?.id || "", cashRegisterId: "", isActive: true, imageUrl: "", fields: [] });
    setShowForm(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditing(m);
    setFormData({
      name: m.name,
      slug: m.slug,
      displayOrder: m.displayOrder,
      currencyId: m.currency?.id || "",
      cashRegisterId: m.cashRegister?.id || "",
      isActive: m.isActive,
      imageUrl: m.imageUrl || "",
      fields: (m.fields || []).map((f, i) => ({ id: f.id, field: f.field, value: f.value, displayOrder: f.displayOrder ?? i + 1 })),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error("El nombre es obligatorio."); return; }
    if (!formData.slug.trim()) { toast.error("El slug es obligatorio."); return; }
    if (!formData.currencyId) { toast.error("Selecciona una moneda."); return; }
    setSaving(true);
    try {
      const currency = currencies.find(c => c.id === formData.currencyId);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || undefined,
        currency: currency || undefined,
        fields: formData.fields.map((f, i) => ({
          id: f.id.startsWith("new-") ? "" : f.id,
          field: f.field.trim(),
          value: f.value.trim(),
          displayOrder: i + 1,
        })) as any,
      };
      if (editing) {
        await paymentMethodService.update(editing.id, payload);
        await paymentMethodService.assignCashRegister(editing.id, formData.cashRegisterId || null);
        toast.success("Método de pago actualizado.");
      } else {
        const created = await paymentMethodService.create(payload);
        if (formData.cashRegisterId) {
          await paymentMethodService.assignCashRegister(created.id, formData.cashRegisterId);
        }
        toast.success("Método de pago creado.");
      }
      setShowForm(false);
      await fetchMethods();
    } catch {
      toast.error("Error al guardar.");
    }
    setSaving(false);
  };

  const handleToggleActive = async (m: PaymentMethod) => {
    const wasActive = m.isActive;
    setMethods((prev) => prev.map((x) => x.id === m.id ? { ...x, isActive: !x.isActive } : x));
    try {
      await paymentMethodService.update(m.id, { ...m, isActive: !wasActive });
    } catch {
      setMethods((prev) => prev.map((x) => x.id === m.id ? { ...x, isActive: wasActive } : x));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await paymentMethodService.delete(id);
      setMethods((prev) => prev.filter((x) => x.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Método de pago eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await paymentMethodService.delete(id); } catch { }
    }
    setMethods((prev) => prev.filter((x) => !selectedIds.has(x.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} métodos eliminados.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const m = methods.find((x) => x.id === id);
      if (m) {
        try {
          await paymentMethodService.update(id, { ...m, isActive: active });
          setMethods((prev) => prev.map((x) => x.id === id ? { ...x, isActive: active } : x));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const addField = () => {
    setFormData(p => ({
      ...p,
      fields: [...p.fields, { id: `new-${Date.now()}`, field: "", value: "", displayOrder: p.fields.length + 1 }],
    }));
  };

  const updateField = (index: number, key: "field" | "value", val: string) => {
    setFormData(p => ({
      ...p,
      fields: p.fields.map((f, i) => i === index ? { ...f, [key]: val } : f),
    }));
  };

  const removeField = (index: number) => {
    setFormData(p => ({
      ...p,
      fields: p.fields.filter((_, i) => i !== index),
    }));
  };

  const moveField = (index: number, dir: -1 | 1) => {
    setFormData(p => {
      const fields = [...p.fields];
      const target = index + dir;
      if (target < 0 || target >= fields.length) return p;
      [fields[index], fields[target]] = [fields[target], fields[index]];
      return { ...p, fields };
    });
  };

  const columns: ColumnDef<PaymentMethod>[] = [
    {
      key: "image",
      header: "",
      className: "w-20",
      render: (m) => m.imageUrl ? (
        <div className="w-12 h-8 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 flex-shrink-0">
          <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-8 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-text-muted">
          <PhotoIcon className="w-4 h-4" />
        </div>
      ),
    },
    {
      key: "order",
      header: "#",
      className: "text-center w-12",
      render: (m) => <span className="text-sm font-bold text-text-muted">{m.displayOrder}</span>,
    },
    {
      key: "name",
      header: "Método",
      className: "min-w-[200px]",
      render: (m) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{m.name}</p>
          <p className="text-p-xs text-text-muted truncate">{m.slug}</p>
        </div>
      ),
    },
    {
      key: "currency",
      header: "Moneda",
      className: "text-center w-24",
      render: (m) => m.currency ? (
        <span className="px-2 py-1 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold">{m.currency.code}</span>
      ) : <span className="text-p-xs text-text-muted">—</span>,
    },
    {
      key: "cashRegister",
      header: "Caja",
      className: "text-center w-28",
      render: (m) => m.cashRegister ? (
        <span className="px-2 py-1 rounded-lg bg-success-50 text-success-600 text-xs font-bold">{m.cashRegister.name}</span>
      ) : <span className="text-p-xs text-text-muted">Sin caja</span>,
    },
    {
      key: "fields",
      header: "Campos",
      className: "text-center w-20",
      render: (m) => <span className="text-sm font-semibold text-text-base">{m.fields?.length || 0}</span>,
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-20",
      render: (m) => (
        <button
          onClick={() => handleToggleActive(m)}
          className={`relative w-10 h-5 rounded-full transition-colors ${m.isActive ? "bg-success-500" : "bg-neutral-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${m.isActive ? "translate-x-5" : ""}`} />
        </button>
      ),
    },
  ];

  if (showForm) {
    return (
      <>
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">{editing ? "Editar Método" : "Nuevo Método"}</h2>
            <p className="text-p-xs text-text-muted">Configura el método de pago y sus campos.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Nombre</label>
              <input value={formData.name} onChange={e => {
                const name = e.target.value;
                setFormData(p => ({
                  ...p,
                  name,
                  slug: !editing ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : p.slug,
                }));
              }} placeholder="Ej: Pago Móvil BDV" className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" autoFocus />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Slug</label>
              <input value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} placeholder="pago-movil-bdv" className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white text-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Moneda</label>
              <select value={formData.currencyId} onChange={e => setFormData(p => ({ ...p, currencyId: e.target.value, cashRegisterId: "" }))} className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white">
                <option value="">Seleccionar...</option>
                {currencies.filter(c => c.isActive !== false).map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Orden</label>
              <input type="number" min={1} value={formData.displayOrder} onChange={e => setFormData(p => ({ ...p, displayOrder: parseInt(e.target.value) || 1 }))} className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Caja asignada</label>
              <select value={formData.cashRegisterId} onChange={e => setFormData(p => ({ ...p, cashRegisterId: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white">
                <option value="">Ninguna</option>
                {cashRegisters.filter(cr => cr.isActive && (!formData.currencyId || cr.currency?.id === formData.currencyId)).map(cr => (
                  <option key={cr.id} value={cr.id}>{cr.name} ({cr.currency?.code})</option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1">Caja donde se depositarán los pagos de este método</p>
            </div>
          </div>

          {/* Imagen del método */}
          <div>
            <label className="text-sm font-semibold text-text-base mb-1.5 block">Imagen</label>
            <div className="flex items-center gap-3">
              {formData.imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200">
                  <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setFormData(p => ({ ...p, imageUrl: "" }))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowImagePicker(true)} className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 hover:text-brand-500 transition-colors">
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-[9px] mt-0.5">Imagen</span>
                </button>
              )}
              <p className="text-p-xs text-text-muted">Imagen que se muestra en el checkout</p>
            </div>
          </div>

          {/* Campos dinámicos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-text-base">Campos del método</label>
              <button onClick={addField} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-500 text-xs font-bold hover:bg-brand-100 transition-colors">
                <PlusIcon className="w-4 h-4" /> Agregar campo
              </button>
            </div>

            {formData.fields.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-sm text-text-muted">No hay campos. Agrega información como teléfono, cuenta, etc.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveField(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 transition-colors">
                        <ArrowUpIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveField(i, 1)} disabled={i === formData.fields.length - 1} className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 transition-colors">
                        <ArrowDownIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input value={f.field} onChange={e => updateField(i, "field", e.target.value)} placeholder="Nombre del campo (ej: Teléfono)" className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
                    <input value={f.value} onChange={e => updateField(i, "value", e.target.value)} placeholder="Valor (ej: 0414-1234567)" className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-brand-200 bg-white" />
                    <button onClick={() => removeField(i)} className="p-2 rounded-lg hover:bg-danger-50 text-neutral-400 hover:text-danger-500 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              {editing ? "Guardar cambios" : "Crear método"}
            </button>
          </div>
        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        currentUrl={formData.imageUrl || ""}
        onSave={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
        bucket="pmethods"
        title="Imagen del método de pago"
      />
      </>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete === "bulk") handleBulkDelete(); else if (confirmDelete) handleDelete(confirmDelete); }}
        title={confirmDelete === "bulk" ? "Eliminar métodos" : "Eliminar método"}
        message={confirmDelete === "bulk" ? `¿Eliminar ${selectedIds.size} métodos? Esta acción no se puede deshacer.` : "¿Eliminar este método? Esta acción no se puede deshacer."}
        loading={deleting}
      />

      {loading ? <MetodosPagoSkeleton /> : (
      <DataTable
        title="Métodos de Pago"
        titleInfo={`${methods.length} métodos · ${activeCount} activos`}
        columns={columns}
        data={filtered}
        isLoading={false}
        totalItems={methods.length}
        onSearch={setSearch}
        searchPlaceholder="Buscar métodos..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(m) => m.id}
        onEdit={openEdit}
        onDelete={(m) => setConfirmDelete(m.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar métodos"
        filters={[
          { key: "status", label: "Estado", options: [{ label: "Activos", value: "active" }, { label: "Inactivos", value: "inactive" }], value: statusFilter, onChange: (v) => setStatusFilter(v as "" | "active" | "inactive") },
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
            <CreditCardIcon className="w-16 h-16 text-neutral-200 mb-4" />
            <p className="text-text-muted font-medium text-lg mb-2">No hay métodos de pago</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primer método para empezar.</p>
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-400 text-white hover:bg-brand-500 transition-all active:scale-95">
              <PlusIcon className="w-5 h-5" /> Crear método
            </button>
          </div>
        }
      />)}
    </>
  );
};

export default MetodosPagoPage;
