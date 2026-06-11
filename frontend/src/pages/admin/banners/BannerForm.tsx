import { useState } from "react";
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Banner } from "../../../services/bannerService";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";

interface BannerFormProps {
  banner?: Banner | null;
  onSave: (data: Partial<Banner>) => Promise<void>;
  onCancel: () => void;
}

const BannerForm = ({ banner, onSave, onCancel }: BannerFormProps) => {
  const isEditing = !!banner;
  const [title, setTitle] = useState(banner?.title || "");
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(banner?.mobileImageUrl || "");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl || "");
  const [displayOrder, setDisplayOrder] = useState(banner?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState<"desktop" | "mobile" | null>(null);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const handleSave = async () => {
    if (!imageUrl.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title,
        imageUrl,
        mobileImageUrl: mobileImageUrl || undefined,
        linkUrl: linkUrl || undefined,
        displayOrder,
        isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all bg-white";
  const labelClass = "text-sm font-semibold text-text-base";
  const cardClass = "bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-5";

  return (
    <>
      {dirty && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between animate-fade-in rounded-t-3xl">
          <p className="text-sm text-text-muted">Tienes cambios sin guardar</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">
              Descartar
            </button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">
              {isEditing ? banner.title || "Editar Banner" : "Nuevo Banner"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            {isEditing ? "Guardar" : "Crear banner"}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:max-w-[calc(70%-12px)] space-y-6">
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Información del Banner</h3>
            <div>
              <label className={labelClass}>Título</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="Ej: Nueva Colección Verano" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL de destino (opcional)</label>
              <input value={linkUrl} onChange={(e) => { setLinkUrl(e.target.value); markDirty(); }} placeholder="https://tienda.com/ofertas" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Orden de visualización</label>
              <input type="number" min={0} value={displayOrder} onChange={(e) => { setDisplayOrder(parseInt(e.target.value) || 0); markDirty(); }} className={inputClass} />
              <p className="text-p-xs text-text-muted mt-1">Los banners se muestran de menor a mayor orden</p>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Imágenes</h3>

            <div>
              <label className={labelClass}>Imagen de escritorio</label>
              <p className="text-p-xs text-text-muted mb-2">Tamaño recomendado: 1920×600px</p>
              <div className="mt-1.5 flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50">
                    <img src={imageUrl} alt="" className="w-full h-auto object-cover" />
                    <button onClick={() => { setImageUrl(""); markDirty(); }} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500 shadow-sm"><XMarkIcon className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="w-full max-w-md h-32 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setShowImagePicker("desktop"); }}>
                    <PhotoIcon className="w-8 h-8" />
                    <span className="text-p-xs mt-1">Subir imagen</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <label className={labelClass}>Imagen móvil (opcional)</label>
              <p className="text-p-xs text-text-muted mb-2">Tamaño recomendado: 750×1100px</p>
              <div className="mt-1.5 flex items-center gap-4">
                {mobileImageUrl ? (
                  <div className="relative w-40 rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50">
                    <img src={mobileImageUrl} alt="" className="w-full h-auto object-cover" />
                    <button onClick={() => { setMobileImageUrl(""); markDirty(); }} className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500 shadow-sm"><XMarkIcon className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-40 h-32 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setShowImagePicker("mobile"); }}>
                    <PhotoIcon className="w-6 h-6" />
                    <span className="text-p-xs mt-1">Subir</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[30%] space-y-6">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-p-b font-bold text-text-base">Estado</h3>
                <p className="text-p-sm text-text-muted">{isActive ? "Visible en el slider" : "Oculto"}</p>
              </div>
              <button
                onClick={() => { setIsActive(!isActive); markDirty(); }}
                className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-success-500" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>

          {imageUrl && (
            <div className={cardClass}>
              <h3 className="text-p-b font-bold text-text-base mb-3">Vista previa</h3>
              <div className="rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50">
                <img src={imageUrl} alt="" className="w-full h-auto" />
              </div>
            </div>
          )}
        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker !== null}
        onClose={() => setShowImagePicker(null)}
        currentUrl={showImagePicker === "desktop" ? imageUrl : mobileImageUrl}
        onSave={(url) => {
          if (showImagePicker === "desktop") setImageUrl(url);
          else setMobileImageUrl(url);
          markDirty();
        }}
      />
    </>
  );
};

export default BannerForm;
