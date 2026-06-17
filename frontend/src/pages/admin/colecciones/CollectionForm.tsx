import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { ProductCollection } from "../../../services/collectionService";
import type { Product } from "../../../services/productService";
import { productService } from "../../../services/productService";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";
import AlertModal from "../../../components/ui/AlertModal";

interface CollectionFormProps {
  collection?: ProductCollection | null;
  onSave: (data: Partial<ProductCollection>) => Promise<void>;
  onCancel: () => void;
}

const CollectionForm = ({ collection, onSave, onCancel }: CollectionFormProps) => {
  const isEditing = !!collection;
  const [title, setTitle] = useState(collection?.title || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [extraDescription, setExtraDescription] = useState(collection?.extraDescription || "");
  const [imageUrl, setImageUrl] = useState(collection?.imageUrl || "");
  const [isActive, setIsActive] = useState(collection?.isActive ?? true);
  const [product, setProduct] = useState<Product | undefined>(collection?.product);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
      await onSave({
        title,
        description,
        extraDescription,
        imageUrl,
        isActive,
        product: product ? ({ id: product.id } as any) : undefined,
        displayOrder: collection?.displayOrder ?? 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (dirty) { setShowExitAlert(true); }
    else { onCancel(); }
  };

  const selectProduct = (p: Product) => {
    setProduct(p);
    markDirty();
    setProductSearch("");
    setSearchResults([]);
  };

  const removeProduct = () => {
    setProduct(undefined);
    markDirty();
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
              {isEditing ? collection.title : "Nueva Colección"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
              {isActive ? "Activa" : "Borrador"}
            </span>
          </div>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            {isEditing ? "Guardar" : "Crear colección"}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column - 70% */}
        <div className="flex-1 space-y-6 lg:max-w-[calc(70%-12px)]">
          {/* Card 1: Identity */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Identidad de la Colección</h3>
            <div>
              <label className={labelClass}>Título</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="Ej: Look de Noche, Productos Trending..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} rows={4} placeholder="Descripción principal de la colección..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Card 2: Extra Description */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Descripción Extra (Destacada)</h3>
            <p className="text-p-xs text-text-muted">Usada para marketing, SEO o subtítulos enriquecidos al pie de la página.</p>
            <textarea value={extraDescription} onChange={(e) => { setExtraDescription(e.target.value); markDirty(); }} rows={5} placeholder="Texto enriquecido adicional..." className={`${inputClass} resize-none`} />
          </div>

          {/* Card 3: Product */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Producto asociado</h3>
            <p className="text-p-xs text-text-muted">Selecciona el producto al que redirigirá esta colección.</p>

            {!product ? (
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-400 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
                {searching && <p className="text-sm text-text-muted py-2">Buscando...</p>}
                {searchResults.length > 0 && (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar mt-2">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left"
                      >
                        {p.variations?.[0]?.images?.[0]?.urlImage && (
                          <img src={p.variations[0].images[0].urlImage} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="text-sm text-text-base truncate">{p.name}</span>
                        <PlusIcon className="w-4 h-4 text-brand-400 ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
                {product.variations?.[0]?.images?.[0]?.urlImage && (
                  <img src={product.variations[0].images[0].urlImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                )}
                <span className="text-sm font-medium text-text-base truncate flex-1">{product.name}</span>
                <button onClick={removeProduct} className="text-sm text-danger-500 hover:text-red-600 font-medium">Cambiar</button>
              </div>
            )}
          </div>
        </div>

        {/* Side column - 30% */}
        <div className="lg:w-[30%] space-y-6">
          {/* Card A: Estado */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Estado de Publicación</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-base">Estado</span>
                <select
                  value={isActive ? "active" : "draft"}
                  onChange={(e) => { setIsActive(e.target.value === "active"); markDirty(); }}
                  className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="active">Activa</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card B: Imagen */}
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Imagen de la Colección</h3>
            <p className="text-p-xs text-text-muted">Proporción recomendada: <strong>4:3</strong> (ej. 800×600 px)</p>
            <div className="flex items-center justify-center">
              {imageUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-100">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setImageUrl(""); markDirty(); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setShowImagePicker(true)}
                  className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer"
                >
                  <PhotoIcon className="w-10 h-10" />
                  <span className="text-p-xs mt-2 font-medium">Arrastra o haz clic para subir</span>
                  <span className="text-[10px] text-text-muted/60 mt-1">4:3 recomendado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        currentUrl={imageUrl}
        onSave={(url) => { setImageUrl(url); markDirty(); }}
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

export default CollectionForm;
