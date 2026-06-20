import { useState, useEffect, useCallback, useRef } from "react";
import {
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { categoryService, type Category } from "../../../services/categoryService";
import toast from "react-hot-toast";
import CategoryForm from "./CategoryForm";
import Checkbox from "../../../components/ui/Checkbox";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import DataTable from "../../../components/ui/DataTable";
import type { ColumnDef } from "../../../components/ui/DataTable";

interface TreeNode extends Category {
  children: TreeNode[];
  depth: number;
}

const buildTree = (categories: Category[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  categories.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));

  categories.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent && map.has(c.parent.id)) {
      const parent = map.get(c.parent.id)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = [];
  const walk = (list: TreeNode[]) => {
    list.forEach((n) => {
      result.push(n);
      walk(n.children);
    });
  };
  walk(nodes);
  return result;
};

const countDescendants = (node: TreeNode): number => {
  let count = node.children.length;
  node.children.forEach((child) => { count += countDescendants(child); });
  return count;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsedTreeIds, setCollapsedTreeIds] = useState<Set<string>>(new Set());
  const hasInitCollapsed = useRef(false);

  // Parent filter state
  const [parentFilterIds, setParentFilterIds] = useState<Set<string>>(new Set());
  const [parentFilterSearch, setParentFilterSearch] = useState("");
  const [parentFilterOpen, setParentFilterOpen] = useState(false);
  const parentFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories.length > 0 && !hasInitCollapsed.current) {
      hasInitCollapsed.current = true;
      const toCollapse = new Set<string>();
      const markWithChildren = (nodes: TreeNode[]) => {
        nodes.forEach((n) => {
          if (n.children.length > 0) {
            toCollapse.add(n.id);
            markWithChildren(n.children);
          }
        });
      };
      markWithChildren(buildTree(categories));
      setCollapsedTreeIds(toCollapse);
    }
  }, [categories]);

  const toggleTreeExpand = (id: string) => {
    setCollapsedTreeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch {
      toast.error("No se pudieron cargar las categorías.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (parentFilterRef.current && !parentFilterRef.current.contains(e.target as Node)) {
        setParentFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = categories.filter((c) => {
    if (statusFilter === "active" && !c.isActive) return false;
    if (statusFilter === "inactive" && c.isActive) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (parentFilterIds.size > 0) {
      if (parentFilterIds.has("root") && !c.parent) return true;
      if (c.parent && parentFilterIds.has(c.parent.id)) return true;
      return false;
    }
    return true;
  });

  const parentOptions = categories.filter((c) => !c.parent);
  const filteredParentOptions = parentOptions.filter((c) =>
    c.name.toLowerCase().includes(parentFilterSearch.toLowerCase())
  );

  const tree = buildTree(filtered);
  const flatTree = flattenTree(tree);

  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;

  const hasSubcategories = (id: string) => categories.some((c) => c.parent?.id === id);

  // Columns definition for DataTable
  const treeColumns: ColumnDef<TreeNode>[] = [
    {
      key: "dragHandle", // Not a real key, just for rendering
      header: "",
      className: "w-12", // Match 48px width
      render: (node) => (
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragEnd={handleDragEnd}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-text-muted hover:text-text-base"
          title="Arrastrar para reorganizar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      )
    },
    {
      key: "name",
      header: "Categoría",
      className: "min-w-[200px]", // Allow more space
      render: (node) => {
        const subCount = hasSubcategories(node.id) ? countDescendants(node) : 0;
        return (
          <div className="flex items-center gap-2 min-w-0">
            {node.depth === 0 && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
                {node.logoUrl ? (
                  <img src={node.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs font-bold">
                    {node.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-base truncate">{node.name}</p>
              {node.parent && (
                <p className="text-p-xs text-text-muted truncate">Sub de {node.parent?.name}</p>
              )}
            </div>
            {subCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-brand-50 text-brand-400 text-p-xs font-bold">
                {subCount} sub
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "products",
      header: "Productos",
      className: "text-right w-32",
      render: () => <span className="text-sm text-text-muted font-medium">-</span>
    },
    {
      key: "subcategories",
      header: "Subcategorías",
      className: "text-center w-28",
      render: (node) => {
        const subCount = hasSubcategories(node.id) ? countDescendants(node) : 0;
        return <span className="text-sm text-text-muted">{subCount || "-"}</span>;
      }
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-20",
      render: (node) => (
        <button
          onClick={() => handleToggleActive(node)}
          className={`relative w-10 h-5 rounded-full transition-colors ${node.isActive ? "bg-success-500" : "bg-neutral-300"}`}
          title={node.isActive ? "Desactivar" : "Activar"}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${node.isActive ? "translate-x-5" : ""}`} />
        </button>
      )
    },
  ];

  const listColumns: ColumnDef<Category>[] = [
    {
      key: "name",
      header: "Categoría",
      className: "min-w-[200px]",
      render: (cat) => {
        const subCount = categories.filter((c) => c.parent?.id === cat.id).length;
        return (
          <div className="flex items-center gap-3 min-w-0">
            {!cat.parent && (
              cat.logoUrl ? (
                <img src={cat.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-100 aspect-square" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0 aspect-square">
                  {cat.name.charAt(0).toUpperCase()}
                </div>
              )
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-base truncate">{cat.name}</p>
              {cat.parent && (
                <p className="text-p-xs text-text-muted truncate">Sub de {cat.parent.name}</p>
              )}
            </div>
            {subCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-brand-50 text-brand-400 text-xs font-bold">
                {subCount} sub
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "products",
      header: "Productos",
      className: "text-right w-32",
      render: () => <span className="text-sm text-text-muted font-medium">-</span>
    },
    {
      key: "subcategories",
      header: "Subcategorías",
      className: "text-center w-28",
      render: (cat) => {
        const subCount = categories.filter((c) => c.parent?.id === cat.id).length;
        return <span className="text-sm text-text-muted">{subCount || "-"}</span>;
      }
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-20",
      render: (cat) => (
        <button
          onClick={() => handleToggleActive(cat)}
          className={`relative w-10 h-5 rounded-full transition-colors ${cat.isActive ? "bg-success-500" : "bg-neutral-300"}`}
          title={cat.isActive ? "Desactivar" : "Activar"}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${cat.isActive ? "translate-x-5" : ""}`} />
        </button>
      )
    },
  ];

  const currentColumns = viewMode === "tree" ? treeColumns : listColumns;

  const dataToRender = viewMode === "tree" ? flatTree : filtered;


  const handleToggleActive = async (cat: Category) => {
    const wasActive = cat.isActive;
    setCategories((cats) => cats.map((c) => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
    try {
      await categoryService.updateCategory(cat.id, { ...cat, isActive: !cat.isActive });
    } catch {
      setCategories((cats) => cats.map((c) => c.id === cat.id ? { ...c, isActive: wasActive } : c));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Categoría eliminada correctamente.");
    } catch {
      toast.error("No se pudo eliminar la categoría.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    for (const id of selectedIds) {
      try { await categoryService.deleteCategory(id); } catch { }
    }
    setCategories((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} categorías eliminadas.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleDuplicate = async (cat: Category) => {
    try {
      const created = await categoryService.createCategory({
        name: `${cat.name} (copia)`,
        description: cat.description,
        logoUrl: cat.logoUrl,
        isActive: false,
        parent: cat.parent,
      });
      setCategories((prev) => [...prev, created]);
      toast.success("Categoría duplicada correctamente.");
    } catch {
      toast.error("No se pudo duplicar.");
    }
  };

  const handleSaveForm = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        const updated = await categoryService.updateCategory(editingCategory.id, data);
        setCategories((prev) => prev.map((c) => c.id === editingCategory.id ? updated : c));
      } else {
        const created = await categoryService.createCategory(data);
        setCategories((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingCategory(null);
      toast.success(editingCategory ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
    } catch {
      throw new Error("Error al guardar");
    }
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const cat = categories.find((c) => c.id === id);
      if (cat) {
        try {
          await categoryService.updateCategory(id, { ...cat, isActive: active });
          setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: active } : c));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  // Drag handlers
  const dragData = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    dragData.current = id;
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverId(null);
    setDragOverRoot(false);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
    setDragOverRoot(false);
  };

  const handleDragLeave = () => { setDragOverId(null); };

  const handleDropRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRoot(false);
    setIsDragging(false);
    const sourceId = e.dataTransfer.getData("text/plain") || dragData.current;
    if (!sourceId) return;
    dragData.current = null;
    const source = categories.find((c) => c.id === sourceId);
    if (!source || !source.parent) return;
    try {
      await categoryService.updateCategory(sourceId, { ...source, parent: undefined });
      setCategories((prev) => prev.map((c) => c.id === sourceId ? { ...c, parent: undefined } : c));
      toast.success("Categoría movida a raíz.");
    } catch {
      toast.error("No se pudo reorganizar.");
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    setIsDragging(false);
    const sourceId = e.dataTransfer.getData("text/plain") || dragData.current;
    dragData.current = null;
    if (!sourceId || sourceId === targetId) return;

    const source = categories.find((c) => c.id === sourceId);
    const target = categories.find((c) => c.id === targetId);
    if (!source || !target) return;

    try {
      await categoryService.updateCategory(sourceId, { ...source, parent: target });
      setCategories((prev) => prev.map((c) => c.id === sourceId ? { ...c, parent: target } : c));
      toast.success("Categoría reorganizada.");
    } catch {
      toast.error("No se pudo reorganizar.");
    }
  };



  // Remove activeFilters as DataTable handles it
  // const activeFilters = statusFilter !== "";

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingCategory(null); }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete === "bulk") handleBulkDelete();
          else if (confirmDelete) handleDelete(confirmDelete);
        }}
        title={confirmDelete === "bulk" ? "Eliminar categorías" : "Eliminar categoría"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} categorías? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
        }
        loading={deleting}
      />

      <DataTable
        title="Categorías"
        titleInfo={`${totalCategories} categorías · ${activeCount} activas`}
        columns={currentColumns as ColumnDef<Category>[]}
        data={dataToRender}
        isLoading={loading}
        totalItems={totalCategories}
        onSearch={setSearch}
        searchPlaceholder="Buscar categorías..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(item) => item.id}
        getChildren={viewMode === "tree" ? (item) => (item as any).children : undefined}
        onEdit={(item) => { setEditingCategory(item as Category); setShowForm(true); }}
        onDelete={(item) => setConfirmDelete(item.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar categorías"
        renderExtraActions={(item) => {
          const cat = item as Category;
          return (
            <>
              <button onClick={() => handleDuplicate(cat)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
                <DocumentDuplicateIcon className="w-4 h-4 text-text-muted" /> Duplicar
              </button>
              <button onClick={() => window.open(`/categoria${categoryService.getCategoryPath(cat)}`, "_blank")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-brand-50 transition-colors">
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
              { label: "Inactivas", value: "inactive" },
            ],
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as "" | "active" | "inactive"),
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <div className="relative" ref={parentFilterRef}>
              <button
                onClick={() => setParentFilterOpen(!parentFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border h-[46px] ${
                  parentFilterIds.size > 0
                    ? "bg-brand-50 border-brand-300 text-brand-500"
                    : "bg-white border-neutral-400 text-text-muted hover:text-text-base"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Categoría padre</span>
                {parentFilterIds.size > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-400 text-white text-p-xs flex items-center justify-center font-bold">
                    {parentFilterIds.size}
                  </span>
                )}
                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${parentFilterOpen ? "rotate-90" : ""}`} />
              </button>

              {parentFilterOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-neutral-100">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        value={parentFilterSearch}
                        onChange={(e) => setParentFilterSearch(e.target.value)}
                        placeholder="Buscar categoría padre..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-64 custom-scrollbar p-1">
                    <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer">
                      <Checkbox
                        checked={parentFilterIds.has("root")}
                        onChange={() => {
                          const next = new Set(parentFilterIds);
                          if (next.has("root")) next.delete("root");
                          else next.add("root");
                          setParentFilterIds(next);
                        }}
                      />
                      <span className="text-sm text-text-base font-medium">— Raíz (sin padre) —</span>
                    </label>
                    <div className="h-px bg-neutral-100 mx-3 my-1" />
                    {filteredParentOptions.map((c) => {
                      const checked = parentFilterIds.has(c.id);
                      return (
                        <label key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer">
                          <Checkbox
                            checked={checked}
                            onChange={() => {
                              const next = new Set(parentFilterIds);
                              if (next.has(c.id)) next.delete(c.id);
                              else next.add(c.id);
                              setParentFilterIds(next);
                            }}
                          />
                          <span className="text-sm text-text-base truncate">{c.name}</span>
                        </label>
                      );
                    })}
                    {filteredParentOptions.length === 0 && parentFilterSearch && (
                      <p className="px-3 py-6 text-center text-sm text-text-muted">Sin resultados</p>
                    )}
                  </div>
                  {parentFilterIds.size > 0 && (
                    <div className="border-t border-neutral-100 p-2">
                      <button
                        onClick={() => { setParentFilterIds(new Set()); setParentFilterSearch(""); }}
                        className="w-full py-2 text-sm font-medium text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => { setEditingCategory(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm h-[46px]"
            >
              <PlusIcon className="w-5 h-5" />
              Crear
            </button>
            <div className="flex bg-white rounded-xl border border-neutral-400 h-[46px] overflow-hidden">
              <button
                onClick={() => setViewMode("tree")}
                className={`w-[46px] flex items-center justify-center transition-colors ${viewMode === "tree" ? "bg-brand-400 text-white" : "text-text-muted hover:text-text-base"}`}
                title="Vista de árbol"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <div className="w-px h-full bg-neutral-400" />
              <button
                onClick={() => setViewMode("list")}
                className={`w-[46px] flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-brand-400 text-white" : "text-text-muted hover:text-text-base"}`}
                title="Vista de lista"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
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
            <p className="text-text-muted font-medium text-lg mb-2">No hay categorías</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primera categoría para empezar.</p>
            <button onClick={() => { setEditingCategory(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear categoría
            </button>
          </div>
        )}
        renderBody={viewMode === "tree" ? (props) => (
          <tbody>
            {/* Zona de drop para mover a raíz — visible solo al arrastrar */}
            {isDragging && (
              <tr className="hover:bg-transparent border-0">
                <td colSpan={7} className="p-0 border-0">
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverRoot(true); setDragOverId(null); }}
                    onDragLeave={() => setDragOverRoot(false)}
                    onDrop={handleDropRoot}
                    className={`flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed rounded-xl mx-6 mt-4 mb-2 transition-all duration-200 ${dragOverRoot
                      ? "border-brand-400 bg-brand-50 text-brand-500"
                      : "border-neutral-300 bg-neutral-50 text-text-muted"
                      }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12h18M12 3v18" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-medium">Soltar aquí para mover a categoría raíz</span>
                  </div>
                </td>
              </tr>
            )}
            {(() => {
              const allNodes = props.data as TreeNode[];
              const nodeMap = new Map<string, TreeNode>();
              allNodes.forEach((n) => nodeMap.set(n.id, n));

              const isVisible = (node: TreeNode): boolean => {
                if (node.depth === 0) return true;
                let current: TreeNode | undefined = node;
                while (current && current.parent) {
                  if (collapsedTreeIds.has(current.parent.id)) return false;
                  current = nodeMap.get(current.parent.id);
                }
                return true;
              };

              return allNodes.filter(isVisible).map((node: TreeNode) => {
                const isDragOver = dragOverId === node.id;
                return (
                <tr
                  key={node.id}
                  onDragOver={(e) => {
                    if (props.getItemId(node) !== dragData.current) {
                      handleDragOver(e, node.id);
                    } else {
                      e.preventDefault();
                    }
                  }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, node.id)}
                  className={`border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors cursor-default ${isDragOver ? "bg-brand-50 border-t-2 border-brand-400" : ""}`}
                >
                  {props.selectable && (
                    <td className="py-5 pl-6 pr-2 w-12">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={props.selectedIds.has(props.getItemId(node))}
                          onChange={() => props.onSelectOne(node)}
                        />
                      </div>
                    </td>
                  )}
                  {treeColumns.map((col, colIndex) => (
                    <td
                      key={col.key || colIndex}
                      className={`py-5 px-6 text-sm text-neutral-700 font-medium ${col.className || ""}`}
                      style={col.key === "name" ? { paddingLeft: `${24 + node.depth * 28}px` } : undefined}
                    >
                      {col.key === "name" && node.children.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTreeExpand(node.id); }}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors shrink-0"
                            title={collapsedTreeIds.has(node.id) ? "Expandir" : "Colapsar"}
                          >
                            <ChevronRightIcon className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${collapsedTreeIds.has(node.id) ? "" : "rotate-90"}`} />
                          </button>
                          {col.render ? col.render(node) : (node as any)[col.key]}
                        </div>
                      ) : (
                        col.render ? col.render(node) : (node as any)[col.key]
                      )}
                    </td>
                  ))}
                  {props.renderActionsColumn && (
                    <td className="py-5 px-6 text-sm text-neutral-700 font-medium w-12">
                      {props.renderActionsColumn(node)}
                    </td>
                  )}
                </tr>
              );
            });
          })()}
          </tbody>
        ) : undefined}
      />
    </>
  );
};

export default CategoriesPage;
