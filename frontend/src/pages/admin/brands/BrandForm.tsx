import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Brand } from "../../../services/brandService";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";

interface BrandFormProps {
  brand?: Brand | null;
  onSave: (data: Partial<Brand>) => Promise<void>;
  onCancel: () => void;
}

const BrandForm = ({ brand, onSave, onCancel }: BrandFormProps) => {
  const isEditing = !!brand;
  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "");
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const slugManuallyEdited = useRef(false);

  useEffect(() => {
    if (!isEditing && name && !slugManuallyEdited.current) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [name, isEditing]);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, slug, description, logoUrl, isActive });
    } finally {
      setSaving(false);
    }
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">
              {isEditing ? brand.name : "Nueva Marca"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
              {isActive ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            {isEditing ? "Guardar" : "Crear marca"}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 lg:max-w-[calc(70%-12px)] space-y-6">
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Información Básica</h3>
            <div>
              <label className={labelClass}>Nombre</label>
              <input value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} placeholder="Ej: Maybelline, MAC, L'Oréal..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input value={slug} onChange={(e) => { setSlug(e.target.value); slugManuallyEdited.current = true; markDirty(); }} placeholder="url-amigable-de-la-marca" className={`${inputClass} text-text-muted text-sm`} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} rows={4} placeholder="Describe la marca..." className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Logo</label>
              <div className="mt-1.5 flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-100">
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setLogoUrl(""); markDirty(); }} className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setShowImagePicker(true); }}>
                    <PhotoIcon className="w-6 h-6" />
                    <span className="text-p-xs mt-1">Agregar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="lg:w-[30%] space-y-6">
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-p-b font-bold text-text-base">Estado</h3>
                <p className="text-p-sm text-text-muted">{isActive ? "Marca visible en la tienda" : "Marca oculta"}</p>
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

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        currentUrl={logoUrl}
        onSave={(url) => { setLogoUrl(url); markDirty(); }}
      />
    </>
  );
};

export default BrandForm;
