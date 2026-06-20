import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import { bannerService, type Banner } from "../../services/bannerService";
import toast from "react-hot-toast";
import BannerForm from "./banners/BannerForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";
import BannersSkeleton from "../../components/admin/skeletons/BannersSkeleton";

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch {
      toast.error("No se pudieron cargar los banners.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  useEffect(() => {
    const handleClose = () => { setOpenMenuId(null); setMenuPos(null); };
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => { window.removeEventListener("scroll", handleClose, true); window.removeEventListener("resize", handleClose); };
  }, []);

  const filtered = banners.filter((b) => {
    if (statusFilter === "active" && !b.isActive) return false;
    if (statusFilter === "inactive" && b.isActive) return false;
    if (search && !b.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCount = banners.filter((b) => b.isActive).length;

  const columns: ColumnDef<Banner>[] = [
    {
      key: "image",
      header: "",
      className: "w-24",
      render: (b) => (
        <div className="w-20 h-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
          {b.imageUrl ? (
            <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs font-bold">
              ?
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Título",
      className: "min-w-[200px]",
      render: (b) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{b.title || "Sin título"}</p>
          {b.linkUrl && (
            <p className="text-p-xs text-text-muted truncate">{b.linkUrl}</p>
          )}
        </div>
      ),
    },
    {
      key: "displayOrder",
      header: "Orden",
      className: "w-24 text-center",
      sortable: true,
      render: (b) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 text-sm font-bold text-text-muted">
          {b.displayOrder}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      className: "w-24 text-center",
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

  const handleToggleActive = async (banner: Banner) => {
    const wasActive = banner.isActive;
    setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    try {
      await bannerService.updateBanner(banner.id, { ...banner, isActive: !banner.isActive });
    } catch {
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: wasActive } : b));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await bannerService.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Banner eliminado correctamente.");
    } catch {
      toast.error("No se pudo eliminar el banner.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await bannerService.deleteBanner(id); } catch { }
    }
    setBanners((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} banners eliminados.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const banner = banners.find((b) => b.id === id);
      if (banner) {
        try {
          await bannerService.updateBanner(id, { ...banner, isActive: active });
          setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: active } : b));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const handleMoveUp = async (banner: Banner) => {
    const idx = banners.findIndex((b) => b.id === banner.id);
    if (idx <= 0) return;
    const prev = banners[idx - 1];
    const newOrder = banner.displayOrder;
    const prevOrder = prev.displayOrder;

    setBanners((banners) =>
      banners.map((b) => {
        if (b.id === banner.id) return { ...b, displayOrder: prevOrder };
        if (b.id === prev.id) return { ...b, displayOrder: newOrder };
        return b;
      })
    );

    try {
      await Promise.all([
        bannerService.updateBanner(banner.id, { ...banner, displayOrder: prevOrder }),
        bannerService.updateBanner(prev.id, { ...prev, displayOrder: newOrder }),
      ]);
    } catch {
      fetchBanners();
      toast.error("No se pudo reordenar.");
    }
  };

  const handleMoveDown = async (banner: Banner) => {
    const idx = banners.findIndex((b) => b.id === banner.id);
    if (idx >= banners.length - 1) return;
    const next = banners[idx + 1];
    const newOrder = banner.displayOrder;
    const nextOrder = next.displayOrder;

    setBanners((banners) =>
      banners.map((b) => {
        if (b.id === banner.id) return { ...b, displayOrder: nextOrder };
        if (b.id === next.id) return { ...b, displayOrder: newOrder };
        return b;
      })
    );

    try {
      await Promise.all([
        bannerService.updateBanner(banner.id, { ...banner, displayOrder: nextOrder }),
        bannerService.updateBanner(next.id, { ...next, displayOrder: newOrder }),
      ]);
    } catch {
      fetchBanners();
      toast.error("No se pudo reordenar.");
    }
  };

  const handleSaveForm = async (data: Partial<Banner>) => {
    try {
      if (editingBanner) {
        const updated = await bannerService.updateBanner(editingBanner.id, data);
        setBanners((prev) => prev.map((b) => b.id === editingBanner.id ? updated : b));
      } else {
        const maxOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.displayOrder)) : 0;
        const created = await bannerService.createBanner({
          ...data,
          displayOrder: data.displayOrder ?? maxOrder + 1,
          isActive: data.isActive ?? true,
        } as Omit<Banner, "id">);
        setBanners((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingBanner(null);
      toast.success(editingBanner ? "Banner actualizado correctamente." : "Banner creado correctamente.");
    } catch {
      toast.error("Error al guardar");
      throw new Error("Error al guardar");
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <BannerForm
          banner={editingBanner}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingBanner(null); }}
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
        title={confirmDelete === "bulk" ? "Eliminar banners" : "Eliminar banner"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} banners? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar este banner? Esta acción no se puede deshacer."
        }
        loading={deleting}
      />

      {loading ? <BannersSkeleton /> : (
      <DataTable
        title="Banners"
        titleInfo={`${banners.length} banners · ${activeCount} activos`}
        columns={columns}
        data={filtered}
        isLoading={false}
        totalItems={banners.length}
        onSearch={setSearch}
        searchPlaceholder="Buscar banners..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(b) => b.id}
        onEdit={(b) => { setEditingBanner(b as Banner); setShowForm(true); }}
        onDelete={(b) => setConfirmDelete(b.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar banners"
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { label: "Activos", value: "active" },
              { label: "Inactivos", value: "inactive" },
            ],
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as "" | "active" | "inactive"),
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <button
              onClick={() => { setEditingBanner(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Crear
            </button>
          </div>
        )}
        headerExtra={selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in mt-6">
            <span className="text-sm font-medium text-text-base">{selectedIds.size} seleccionados</span>
            <div className="w-px h-5 bg-brand-200" />
            <button onClick={() => handleBulkToggle(true)} className="text-sm font-medium text-brand-400 hover:text-brand-500">Activar</button>
            <button onClick={() => handleBulkToggle(false)} className="text-sm font-medium text-text-muted hover:text-text-base">Desactivar</button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
          </div>
        )}
        renderEmpty={(
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <p className="text-text-muted font-medium text-lg mb-2">No hay banners</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primer banner para el slider del home.</p>
            <button onClick={() => { setEditingBanner(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear banner
            </button>
          </div>
        )}
        renderActionsColumn={(item) => {
          const id = item.id;
          const isOpen = openMenuId === id;
          const banner = item as Banner;
          const idx = filtered.findIndex((x) => x.id === banner.id);
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMoveUp(banner)}
                disabled={idx === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover arriba"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
              <button
                onClick={() => handleMoveDown(banner)}
                disabled={idx === filtered.length - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover abajo"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="relative flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOpen) {
                      setOpenMenuId(null);
                      setMenuPos(null);
                    } else {
                      setOpenMenuId(id);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menuWidth = 192;
                      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
                      setMenuPos({ top: rect.bottom + 4, left });
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>
              {isOpen && menuPos && createPortal(
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => { setOpenMenuId(null); setMenuPos(null); }} />
                  <div className="fixed z-[100] w-48 bg-white rounded-2xl border border-neutral-100 shadow-xl py-2 animate-fade-in" style={{ top: menuPos.top, left: menuPos.left }}>
                    <button
                      onClick={() => { setOpenMenuId(null); setMenuPos(null); setEditingBanner(banner); setShowForm(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                      Editar
                    </button>
                    <div className="h-px bg-neutral-100 my-1" />
                    <button
                      onClick={() => { setOpenMenuId(null); setMenuPos(null); setConfirmDelete(banner.id); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      Eliminar
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
          );
        }}
      />)}
    </>
  );
};

export default BannersPage;
