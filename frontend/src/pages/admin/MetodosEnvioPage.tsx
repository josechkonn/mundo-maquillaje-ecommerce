import { useState, useEffect, useCallback } from "react";
import { PlusIcon, TruckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { shippingMethodService, type ShippingMethod } from "../../services/shippingMethodService";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import MetodosEnvioSkeleton from "../../components/admin/skeletons/MetodosEnvioSkeleton";

const MetodosEnvioPage = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    freeShippingThreshold: "" as string | undefined,
    isActive: true,
    isCod: false,
  });

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shippingMethodService.getAll();
      setMethods(data);
    } catch {
      toast.error("No se pudieron cargar los métodos de envío.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const filtered = methods.filter((m) => {
    if (statusFilter === "active" && !m.isActive) return false;
    if (statusFilter === "inactive" && m.isActive) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = methods.filter((m) => m.isActive).length;

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", description: "", price: 0, freeShippingThreshold: undefined, isActive: true, isCod: false });
    setShowForm(true);
  };

  const openEdit = (m: ShippingMethod) => {
    setEditing(m);
    setFormData({
      name: m.name,
      description: m.description || "",
      price: m.price,
      freeShippingThreshold: m.freeShippingThreshold != null ? String(m.freeShippingThreshold) : undefined,
      isActive: m.isActive,
      isCod: m.isCod,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error("El nombre es obligatorio."); return; }
    if (formData.price < 0) { toast.error("El precio no puede ser negativo."); return; }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        freeShippingThreshold: formData.freeShippingThreshold ? parseFloat(formData.freeShippingThreshold) : undefined,
        isActive: formData.isActive,
        isCod: formData.isCod,
      };
      if (editing) {
        await shippingMethodService.update(editing.id, payload);
        toast.success("Método de envío actualizado.");
      } else {
        await shippingMethodService.create(payload);
        toast.success("Método de envío creado.");
      }
      setShowForm(false);
      await fetchMethods();
    } catch {
      toast.error("Error al guardar.");
    }
    setSaving(false);
  };

  const handleToggleActive = async (m: ShippingMethod) => {
    const wasActive = m.isActive;
    setMethods((prev) => prev.map((x) => x.id === m.id ? { ...x, isActive: !x.isActive } : x));
    try {
      await shippingMethodService.update(m.id, { ...m, isActive: !wasActive });
    } catch {
      setMethods((prev) => prev.map((x) => x.id === m.id ? { ...x, isActive: wasActive } : x));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await shippingMethodService.delete(id);
      setMethods((prev) => prev.filter((x) => x.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Método de envío eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await shippingMethodService.delete(id); } catch { }
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
          await shippingMethodService.update(id, { ...m, isActive: active });
          setMethods((prev) => prev.map((x) => x.id === id ? { ...x, isActive: active } : x));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const columns: ColumnDef<ShippingMethod>[] = [
    {
      key: "icon",
      header: "",
      className: "w-12",
      render: (m) => (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.isActive ? "bg-brand-50 text-brand-500" : "bg-neutral-100 text-neutral-400"}`}>
          <TruckIcon className="w-5 h-5" />
        </div>
      ),
    },
    {
      key: "name",
      header: "Método",
      className: "min-w-[180px]",
      render: (m) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{m.name}</p>
          {m.description && <p className="text-p-xs text-text-muted truncate">{m.description}</p>}
        </div>
      ),
    },
    {
      key: "price",
      header: "Precio",
      className: "text-center w-28",
      render: (m) => <span className="text-sm font-semibold text-text-base">${m.price.toFixed(2)}</span>,
    },
    {
      key: "threshold",
      header: "Envío gratis desde",
      className: "text-center w-36",
      render: (m) => m.freeShippingThreshold
        ? <span className="text-sm font-semibold text-success-500">${m.freeShippingThreshold.toFixed(2)}</span>
        : <span className="text-p-xs text-text-muted">—</span>,
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
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">{editing ? "Editar Método" : "Nuevo Método"}</h2>
            <p className="text-p-xs text-text-muted">Configura el método de envío y sus tarifas.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-text-base mb-1.5 block">Nombre</label>
            <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Zoom, MRW, Delivery" className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white" autoFocus />
          </div>

          <div>
            <label className="text-sm font-semibold text-text-base mb-1.5 block">Descripción</label>
            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe el servicio..." rows={2} className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-text-base mb-1.5 block">Precio (USD)</label>
              <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">$</span>
                <input type="number" min={0} step={0.01} value={formData.price} onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="flex-1 py-3 px-3 text-sm font-bold outline-none bg-transparent" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-text-base mb-1.5 block">
                Envío gratis desde
                <span title="Monto mínimo de compra para envío gratis">
                  <InformationCircleIcon className="w-4 h-4 text-neutral-400 cursor-help" />
                </span>
              </label>
              <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">$</span>
                <input type="number" min={0} step={0.01} value={formData.freeShippingThreshold ?? ""} onChange={e => setFormData(p => ({ ...p, freeShippingThreshold: e.target.value || undefined }))} placeholder="Sin umbral" className="flex-1 py-3 px-3 text-sm font-bold outline-none bg-transparent" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-text-base">{formData.isActive ? "Activo" : "Inactivo"}</span>
            <button onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))} className={`relative w-12 h-7 rounded-full transition-colors ${formData.isActive ? "bg-success-500" : "bg-neutral-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-text-base">Pago contra entrega</span>
            <button onClick={() => setFormData(p => ({ ...p, isCod: !p.isCod }))} className={`relative w-12 h-7 rounded-full transition-colors ${formData.isCod ? "bg-brand-400" : "bg-neutral-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.isCod ? "translate-x-5" : ""}`} />
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

      {loading ? <MetodosEnvioSkeleton /> : (
      <DataTable
        title="Métodos de Envío"
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
            <TruckIcon className="w-16 h-16 text-neutral-200 mb-4" />
            <p className="text-text-muted font-medium text-lg mb-2">No hay métodos de envío</p>
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

export default MetodosEnvioPage;
