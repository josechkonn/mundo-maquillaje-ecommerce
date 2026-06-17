import { useState, useEffect, useCallback } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { brandService, type Brand } from "../../../services/brandService";
import toast from "react-hot-toast";
import BrandForm from "./BrandForm";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import DataTable, { type ColumnDef } from "../../../components/ui/DataTable";

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch {
      toast.error("No se pudieron cargar las marcas.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const filtered = brands.filter((b) => {
    if (statusFilter === "active" && !b.isActive) return false;
    if (statusFilter === "inactive" && b.isActive) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBrands = brands.length;
  const activeCount = brands.filter((b) => b.isActive).length;

  const columns: ColumnDef<Brand>[] = [
    {
      key: "logo",
      header: "",
      className: "w-14",
      render: (b) => (
        b.logoUrl ? (
          <img src={b.logoUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-neutral-100" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
            {b.name.charAt(0).toUpperCase()}
          </div>
        )
      ),
    },
    {
      key: "name",
      header: "Marca",
      className: "min-w-[200px]",
      render: (b) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{b.name}</p>
          {b.description && (
            <p className="text-p-xs text-text-muted truncate">{b.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-20",
      render: (b) => (
        <button
          onClick={() => handleToggleActive(b)}
          className={`relative w-10 h-5 rounded-full transition-colors ${b.isActive ? "bg-success-500" : "bg-neutral-300"}`}
          title={b.isActive ? "Desactivar" : "Activar"}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${b.isActive ? "translate-x-5" : ""}`} />
        </button>
      ),
    },
  ];

  const handleToggleActive = async (brand: Brand) => {
    const wasActive = brand.isActive;
    setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, isActive: !b.isActive } : b));
    try {
      await brandService.updateBrand(brand.id, { ...brand, isActive: !brand.isActive });
    } catch {
      setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, isActive: wasActive } : b));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await brandService.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Marca eliminada correctamente.");
    } catch {
      toast.error("No se pudo eliminar la marca.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await brandService.deleteBrand(id); } catch { }
    }
    setBrands((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} marcas eliminadas.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const brand = brands.find((b) => b.id === id);
      if (brand) {
        try {
          await brandService.updateBrand(id, { ...brand, isActive: active });
          setBrands((prev) => prev.map((b) => b.id === id ? { ...b, isActive: active } : b));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const handleSaveForm = async (data: Partial<Brand>) => {
    try {
      if (editingBrand) {
        const updated = await brandService.updateBrand(editingBrand.id, data);
        setBrands((prev) => prev.map((b) => b.id === editingBrand.id ? updated : b));
      } else {
        const created = await brandService.createBrand(data);
        setBrands((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingBrand(null);
      toast.success(editingBrand ? "Marca actualizada correctamente." : "Marca creada correctamente.");
    } catch {
      throw new Error("Error al guardar");
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <BrandForm
          brand={editingBrand}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingBrand(null); }}
        />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete === "bulk") handleBulkDelete();
          else if (confirmDelete) handleDelete(confirmDelete);
        }}
        title={confirmDelete === "bulk" ? "Eliminar marcas" : "Eliminar marca"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} marcas? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar esta marca? Esta acción no se puede deshacer."
        }
        loading={deleting}
      />

      <DataTable
        title="Marcas"
        titleInfo={`${totalBrands} marcas · ${activeCount} activas`}
        columns={columns}
        data={filtered}
        isLoading={loading}
        totalItems={totalBrands}
        onSearch={setSearch}
        searchPlaceholder="Buscar marcas..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(b) => b.id}
        onEdit={(b) => { setEditingBrand(b as Brand); setShowForm(true); }}
        onDelete={(b) => setConfirmDelete(b.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar marcas"
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { label: "Activas", value: "active" },
              { label: "Inactivas", value: "inactive" },
            ],
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as "" | "active" | "inactive"),
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <button
              onClick={() => { setEditingBrand(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Crear
            </button>
          </div>
        )}
        headerExtra={selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in mt-6">
            <span className="text-sm font-medium text-text-base">{selectedIds.size} seleccionadas</span>
            <div className="w-px h-5 bg-brand-200" />
            <button onClick={() => handleBulkToggle(true)} className="text-sm font-medium text-brand-400 hover:text-brand-500">Activar</button>
            <button onClick={() => handleBulkToggle(false)} className="text-sm font-medium text-text-muted hover:text-text-base">Desactivar</button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
          </div>
        )}
        renderEmpty={(
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <p className="text-text-muted font-medium text-lg mb-2">No hay marcas</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primera marca para empezar.</p>
            <button onClick={() => { setEditingBrand(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear marca
            </button>
          </div>
        )}
      />
    </>
  );
};

export default BrandsPage;
