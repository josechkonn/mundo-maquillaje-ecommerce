import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Category } from "../../../services/categoryService";
import type { Product } from "../../../services/productService";
import { productService } from "../../../services/productService";
import SEOModal from "../../../components/admin/modals/SEOModal";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";
import AlertModal from "../../../components/ui/AlertModal";
import Drawer from "../../../components/ui/Drawer";

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onSave: (data: Partial<Category>) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm = ({ category, categories, onSave, onCancel }: CategoryFormProps) => {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [logoUrl, setLogoUrl] = useState(category?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(category?.bannerUrl || "");
  const [subBannerUrl, setSubBannerUrl] = useState(category?.subBannerUrl || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [parentId, setParentId] = useState(category?.parent?.id || "__unset__");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showSEOModal, setShowSEOModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<"logo" | "banner" | "subBanner">("logo");
  const formRef = useRef<HTMLDivElement>(null);
  const slugManuallyEdited = useRef(false);
  const [parentSearchOpen, setParentSearchOpen] = useState(false);
  const [parentSearchInput, setParentSearchInput] = useState("");
  const parentDropdownRef = useRef<HTMLDivElement>(null);

  const getDescendantIds = (catId: string, allCats: Category[]): string[] => {
    const result: string[] = [];
    const children = allCats.filter((c) => c.parent?.id === catId);
    children.forEach((child) => {
      result.push(child.id);
      result.push(...getDescendantIds(child.id, allCats));
    });
    return result;
  };

  const excludedIds = category ? [category.id, ...getDescendantIds(category.id, categories)] : [];
  const availableParents = categories.filter((c) => !excludedIds.includes(c.id));

  const isRoot = parentId === "";
  const canHaveBanners = isRoot;

  interface TreeCategory extends Category {
    children: TreeCategory[];
  }

  const buildParentTree = (cats: Category[]): TreeCategory[] => {
    const map = new Map<string, TreeCategory>();
    const roots: TreeCategory[] = [];
    cats.forEach((c) => map.set(c.id, { ...c, children: [] }));
    cats.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parent && map.has(c.parent.id)) {
        map.get(c.parent.id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const parentTree = buildParentTree(availableParents);

  const treeHasMatch = (node: TreeCategory, query: string): boolean => {
    if (!query) return true;
    if (node.name.toLowerCase().includes(query.toLowerCase())) return true;
    return node.children.some((child) => treeHasMatch(child, query));
  };

  const renderTreeItems = (node: TreeCategory, depth: number): React.ReactNode[] => {
    if (parentSearchInput && !treeHasMatch(node, parentSearchInput)) return [];
    const isSelected = parentId === node.id;
    const indent = depth * 16;
    const items: React.ReactNode[] = [
      <button
        key={node.id}
        type="button"
        onClick={() => { setParentId(node.id); setParentSearchOpen(false); setParentSearchInput(""); markDirty(); }}
        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${isSelected ? "bg-brand-50 text-brand-500 font-medium" : "hover:bg-brand-50 text-text-base"}`}
        style={{ paddingLeft: `${16 + indent}px` }}
      >
        <span className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center shrink-0">
          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />}
        </span>
        <span className="truncate">{node.name}</span>
        {node.parent && (
          <span className="text-p-xs text-text-muted shrink-0 ml-auto">Sub de {node.parent.name}</span>
        )}
      </button>,
    ];
    node.children.forEach((child) => items.push(...renderTreeItems(child, depth + 1)));
    return items;
  };

  const anyTreeVisible = !parentSearchInput || parentTree.some((n) => treeHasMatch(n, parentSearchInput));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(e.target as Node)) {
        setParentSearchOpen(false);
        setParentSearchInput("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isEditing && name && !slugManuallyEdited.current) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [name, isEditing]);

  useEffect(() => {
    if (!productSearch.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productService.getAllProducts(0, 10, undefined, undefined, productSearch);
        setSearchResults(Array.isArray(res) ? res : res.content || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parent = parentId ? categories.find((c) => c.id === parentId) : undefined;
      await onSave({
        name,
        slug,
        description,
        logoUrl,
        bannerUrl,
        subBannerUrl,
        isActive,
        parent,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (dirty) { setShowExitAlert(true); }
    else { onCancel(); }
  };

  const addProduct = (p: Product) => {
    if (!selectedProducts.find((sp) => sp.id === p.id)) {
      setSelectedProducts([...selectedProducts, p]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all bg-white";
  const labelClass = "text-sm font-semibold text-text-base";
  const cardClass = "bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-5";

  return (
    <>
      {/* Floating save bar */}
      {dirty && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between animate-fade-in rounded-t-3xl">
          <p className="text-sm text-text-muted">Tienes cambios sin guardar</p>
          <div className="flex gap-3">
            <button onClick={handleCancel} className="px-5 py-2 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">
              Descartar
            </button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">
              {isEditing ? category.name : "Nueva Categoría"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
              {isActive ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            {isEditing ? "Guardar" : "Crear categoría"}
          </button>
        )}
      </div>

      <div ref={formRef} className="flex flex-col lg:flex-row gap-6">
        {/* Main column - 70% */}
        <div className="flex-1 space-y-6 lg:max-w-[calc(70%-12px)]">
          {/* Block 1: Basic info */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Información Básica</h3>
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} placeholder="Ej: Labiales, Maquillaje de ojos..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input value={slug} onChange={(e) => { setSlug(e.target.value); slugManuallyEdited.current = true; markDirty(); }} placeholder="url-amigable-de-la-categoria" className={`${inputClass} text-text-muted text-sm`} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} rows={4} placeholder="Describe la categoría..." className={`${inputClass} resize-none`} />
            </div>
            {/* Imagen principal — disponible para todas las categorías */}
            <div>
              <label className={labelClass}>Imagen principal</label>
              <p className="text-p-xs text-text-muted mt-0.5 mb-1.5">Se muestra como círculo en la página de inicio y filtros</p>
              <div className="max-w-[200px]">
                {logoUrl ? (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-neutral-100">
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setLogoUrl(""); markDirty(); }} className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setImagePickerTarget("logo"); setShowImagePicker(true); }}>
                    <PhotoIcon className="w-6 h-6" />
                    <span className="text-p-xs mt-1">Agregar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Portada y subportada — solo para categorías principales y subcategorías de primer nivel */}
            <div className="border-t border-neutral-100 pt-4">
              <h4 className="text-sm font-bold text-text-base mb-3">Imágenes de portada</h4>
              {canHaveBanners ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Imagen de portada</label>
                    <p className="text-p-xs text-text-muted mt-0.5">Banner principal de la categoría</p>
                    <div className="mt-1.5">
                      {bannerUrl ? (
                        <div className="relative w-full aspect-[5/3] rounded-2xl overflow-hidden border border-neutral-100">
                          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => { setBannerUrl(""); markDirty(); }} className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="w-full aspect-[5/3] rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setImagePickerTarget("banner"); setShowImagePicker(true); }}>
                          <PhotoIcon className="w-6 h-6" />
                          <span className="text-p-xs mt-1">Agregar</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Imagen de subportada</label>
                    <p className="text-p-xs text-text-muted mt-0.5">Se muestra debajo de las subcategorías</p>
                    <div className="mt-1.5">
                      {subBannerUrl ? (
                        <div className="relative w-full aspect-[5/3] rounded-2xl overflow-hidden border border-neutral-100">
                          <img src={subBannerUrl} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => { setSubBannerUrl(""); markDirty(); }} className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <div className="w-full aspect-[5/3] rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setImagePickerTarget("subBanner"); setShowImagePicker(true); }}>
                          <PhotoIcon className="w-6 h-6" />
                          <span className="text-p-xs mt-1">Agregar</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : parentId === "__unset__" ? (
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-center">
                  <PhotoIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    Primero elige en <strong>Jerarquía</strong> si será una categoría principal o una subcategoría
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-center">
                  <PhotoIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    Las imágenes de portada solo están disponibles para categorías principales y subcategorías de primer nivel
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Block 2: Products */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Productos en esta categoría ({selectedProducts.length})</h3>
            <button onClick={() => setShowProductDrawer(true)} className="flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-500 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Añadir productos
            </button>
            {selectedProducts.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {selectedProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.variations?.[0]?.images?.[0]?.urlImage && (
                        <img src={p.variations[0].images[0].urlImage} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      )}
                      <span className="text-sm font-medium text-text-base truncate">{p.name}</span>
                    </div>
                    <button onClick={() => removeProduct(p.id)} className="text-text-muted hover:text-danger-500 transition-colors shrink-0 ml-2">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-p-sm text-text-muted">No hay productos seleccionados. Haz clic en "Añadir productos" para buscarlos.</p>
            )}
          </div>

          {/* Block 3: SEO Preview */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Optimización SEO</h3>
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">Vista previa en Google</p>
              <p className="text-sm text-blue-600 font-medium truncate">{metaTitle || name || "Título de la categoría"} — Mundo Maquillaje</p>
              <p className="text-xs text-neutral-600 truncate">https://mundomaquillaje.com/categoria/{slug || "nombre-categoria"}</p>
              <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{metaDescription || description || "Descripción de la categoría..."}</p>
            </div>
            <button onClick={() => setShowSEOModal(true)} className="text-sm font-medium text-brand-400 hover:text-brand-500">Editar SEO</button>
          </div>
        </div>

        {/* Side column - 30% */}
        <div className="lg:w-[30%] space-y-6">
          {/* Block B: Parent category */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Jerarquía</h3>
            <div>
              <label className={labelClass}>Categoría padre</label>
              <div className="relative mt-1" ref={parentDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setParentSearchOpen(!parentSearchOpen); setParentSearchInput(""); }}
                  className={`${inputClass} flex items-center justify-between`}
                >
                  <span className={parentId === "__unset__" ? "text-text-muted" : "text-text-base"}>
                    {parentId === "__unset__"
                      ? "— Selecciona una opción —"
                      : parentId === ""
                        ? "— Ninguna (categoría raíz) —"
                        : categories.find((c) => c.id === parentId)?.name || "— Selecciona una opción —"}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-text-muted transition-transform duration-200 ${parentSearchOpen ? "rotate-180" : ""}`} />
                </button>

                {parentSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-neutral-100">
                      <input
                        value={parentSearchInput}
                        onChange={(e) => setParentSearchInput(e.target.value)}
                        placeholder="Buscar categoría..."
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-60 custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => { setParentId(""); setParentSearchOpen(false); setParentSearchInput(""); markDirty(); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${parentId === "" ? "bg-brand-50 text-brand-500 font-medium" : "hover:bg-brand-50 text-text-base"}`}
                      >
                        <span className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center shrink-0">
                          {parentId === "" && <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />}
                        </span>
                        — Ninguna (categoría raíz) —
                      </button>
                      {parentTree.flatMap((root) => {
                        if (parentSearchInput && !treeHasMatch(root, parentSearchInput)) return [];
                        return renderTreeItems(root, 0);
                      })}
                      {!anyTreeVisible && (
                        <p className="px-4 py-6 text-center text-sm text-text-muted">Sin resultados</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {parentId && parentId !== "__unset__" && (
                <p className="text-p-xs text-text-muted mt-1.5">Se mostrará como subcategoría de {categories.find((c) => c.id === parentId)?.name}</p>
              )}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-p-b font-bold text-text-base">Estado</h3>
                <p className="text-p-sm text-text-muted">{isActive ? "Categoría visible en la tienda" : "Categoría oculta"}</p>
              </div>
              <button
                onClick={() => { setIsActive(!isActive); markDirty(); }}
                className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-success-500" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={showProductDrawer}
        onClose={() => setShowProductDrawer(false)}
        title="Añadir productos"
        width="md:max-w-lg"
        footer={
          <button onClick={() => setShowProductDrawer(false)} className="w-full py-3 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors">
            Añadir ({selectedProducts.length} seleccionados)
          </button>
        }
      >
        <div className="-mx-6 -mt-6">
          <div className="px-6 py-4 border-b border-neutral-100">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
              />
            </div>
          </div>
          <div className="p-4">
            {searching ? (
              <div className="flex items-center justify-center py-10"><svg className="animate-spin w-6 h-6 text-brand-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((p) => {
                  const added = !!selectedProducts.find((sp) => sp.id === p.id);
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${added ? "bg-brand-50" : "hover:bg-neutral-50"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {p.variations?.[0]?.images?.[0]?.urlImage && (
                          <img src={p.variations[0].images[0].urlImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-base truncate">{p.name}</p>
                          <p className="text-p-xs text-text-muted">{p.variations?.[0]?.price ? `$${p.variations[0].price}` : ""}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => added ? removeProduct(p.id) : addProduct(p)}
                        className={`shrink-0 ml-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${added ? "bg-danger-500/10 text-danger-500 hover:bg-danger-500/20" : "bg-brand-400/10 text-brand-400 hover:bg-brand-400/20"}`}
                      >
                        {added ? <XMarkIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : productSearch ? (
              <p className="text-center py-10 text-text-muted text-sm">Sin resultados</p>
            ) : (
              <p className="text-center py-10 text-text-muted text-sm">Escribe para buscar productos</p>
            )}
          </div>
        </div>
      </Drawer>

      {/* SEO Modal */}
      <SEOModal
        isOpen={showSEOModal}
        onClose={() => setShowSEOModal(false)}
        initialTitle={metaTitle}
        initialDescription={metaDescription}
        slug={slug}
        onSave={(t, d) => { setMetaTitle(t); setMetaDescription(d); markDirty(); }}
      />

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        currentUrl={imagePickerTarget === "logo" ? logoUrl : imagePickerTarget === "banner" ? bannerUrl : subBannerUrl}
        onSave={(url) => {
          if (imagePickerTarget === "logo") setLogoUrl(url);
          else if (imagePickerTarget === "banner") setBannerUrl(url);
          else setSubBannerUrl(url);
          markDirty();
        }}
      />

      {/* Exit confirmation */}
      <AlertModal
        isOpen={showExitAlert}
        onClose={() => setShowExitAlert(false)}
        type="warning"
        title="¿Salir sin guardar?"
        message="Los cambios que no hayas guardado se perderán."
        primaryAction={{ label: "Salir sin guardar", onClick: onCancel }}
        secondaryAction={{ label: "Seguir editando", onClick: () => setShowExitAlert(false) }}
      />
    </>
  );
};

export default CategoryForm;
