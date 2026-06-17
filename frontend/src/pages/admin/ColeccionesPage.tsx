import { useState, useEffect, useCallback } from "react";
import { PlusIcon, EyeIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { collectionService, type ProductCollection } from "../../services/collectionService";
import toast from "react-hot-toast";
import CollectionForm from "./colecciones/CollectionForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import ColeccionesSkeleton from "../../components/admin/skeletons/ColeccionesSkeleton";

const ColeccionesPage = () => {
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ProductCollection | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await collectionService.getAllCollections();
      setCollections(data);
    } catch {
      toast.error("No se pudieron cargar las colecciones.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const filtered = collections.filter((c) => {
    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "inactive" && c.isActive) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCollections = collections.length;
  const activeCount = collections.filter((c) => c.isActive).length;

  const columns: ColumnDef<ProductCollection>[] = [
    {
      key: "image",
      header: "",
      className: "w-20",
      render: (c) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
              {c.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Colección",
      className: "min-w-[240px]",
      render: (c) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{c.title}</p>
          {c.description && (
            <p className="text-p-xs text-text-muted truncate max-w-[300px]">{c.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "product",
      header: "Producto",
      className: "min-w-[180px]",
      render: (c) => (
        c.product ? (
          <div className="flex items-center gap-2 min-w-0">
            {c.product.variations?.[0]?.images?.[0]?.urlImage && (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-100 flex-shrink-0">
                <img src={c.product.variations[0].images[0].urlImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="text-sm text-text-base truncate">{c.product.name}</span>
          </div>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        )
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-24",
      render: (c) => (
        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${c.isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
          {c.isActive ? "Activa" : "Borrador"}
        </span>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await collectionService.deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Colección eliminada correctamente.");
    } catch {
      toast.error("No se pudo eliminar la colección.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await collectionService.deleteCollection(id); } catch { }
    }
    setCollections((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} colecciones eliminadas.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const coll = collections.find((c) => c.id === id);
      if (coll) {
        try {
          await collectionService.updateCollection(id, {
            title: coll.title,
            description: coll.description,
            extraDescription: coll.extraDescription,
            imageUrl: coll.imageUrl,
            isActive: active,
            product: coll.product ? ({ id: coll.product.id } as any) : undefined,
            displayOrder: coll.displayOrder,
          });
          setCollections((prev) => prev.map((c) => c.id === id ? { ...c, isActive: active } : c));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const handleDuplicate = async (coll: ProductCollection) => {
    try {
      const created = await collectionService.createCollection({
        title: `${coll.title} (copia)`,
        description: coll.description,
        extraDescription: coll.extraDescription,
        imageUrl: coll.imageUrl,
        isActive: false,
        product: coll.product ? ({ id: coll.product.id } as any) : undefined,
      });
      setCollections((prev) => [...prev, created]);
      toast.success("Colección duplicada correctamente.");
    } catch {
      toast.error("No se pudo duplicar.");
    }
  };

  const handleSaveForm = async (data: Partial<ProductCollection>) => {
    try {
      if (editingCollection) {
        const updated = await collectionService.updateCollection(editingCollection.id, data);
        setCollections((prev) => prev.map((c) => c.id === editingCollection.id ? updated : c));
      } else {
        const created = await collectionService.createCollection(data);
        setCollections((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingCollection(null);
      toast.success(editingCollection ? "Colección actualizada correctamente." : "Colección creada correctamente.");
    } catch {
      throw new Error("Error al guardar");
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <CollectionForm
          collection={editingCollection}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingCollection(null); }}
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
        title={confirmDelete === "bulk" ? "Eliminar colecciones" : "Eliminar colección"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} colecciones? Esta acción no se puede deshacer.`
            : "Esta acción eliminará la colección y sus descripciones, pero NO eliminará el producto asociado."
        }
        confirmLabel={confirmDelete === "bulk" ? "Eliminar" : "Sí, eliminar colección"}
        loading={deleting}
      />

      {loading ? <ColeccionesSkeleton /> : (
      <DataTable
        title="Colecciones"
        titleInfo={`${totalCollections} colecciones · ${activeCount} activas`}
        columns={columns}
        data={filtered}
        isLoading={false}
        totalItems={totalCollections}
        onSearch={setSearch}
        searchPlaceholder="Buscar colecciones..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(c) => c.id}
        onEdit={(c) => { setEditingCollection(c as ProductCollection); setShowForm(true); }}
        onDelete={(c) => setConfirmDelete(c.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar colecciones"
        renderExtraActions={(item) => {
          const coll = item as ProductCollection;
          return (
            <>
              <button onClick={() => handleDuplicate(coll)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
                <DocumentDuplicateIcon className="w-4 h-4 text-text-muted" /> Clonar
              </button>
              <button onClick={() => window.open(coll.product ? `/producto/${coll.product.slug}` : "/productos", "_blank")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
                <EyeIcon className="w-4 h-4 text-text-muted" /> Ver en tienda
              </button>
            </>
          );
        }}
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { label: "Activas", value: "active" },
              { label: "Borradores", value: "inactive" },
            ],
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as "" | "active" | "inactive"),
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <button
              onClick={() => { setEditingCollection(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Crear colección
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
            <p className="text-text-muted font-medium text-lg mb-2">No hay colecciones</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primera colección para empezar.</p>
            <button onClick={() => { setEditingCollection(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear colección
            </button>
          </div>
        )}
      />)}
    </>
  );
};

export default ColeccionesPage;
