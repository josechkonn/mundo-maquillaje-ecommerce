import { useState, useEffect } from "react";
import { configService, type StoreConfig } from "../../services/configService";
import toast from "react-hot-toast";
import Tabs from "../../components/ui/Tabs";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  LinkIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ImagePickerModal from "../../components/admin/modals/ImagePickerModal";
import SettingsSkeleton from "../../components/admin/skeletons/SettingsSkeleton";

const SettingsPage = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState<string | null>(null);

  useEffect(() => {
    configService.getConfig()
      .then((data) => {
        setConfig({
          ...data,
          pillars: data.pillars || [],
          showPillars: data.showPillars ?? false,
          showMissionVision: data.showMissionVision ?? false,
          showMission: data.showMission ?? false,
          showVision: data.showVision ?? false,
        });
      })
      .catch(() => toast.error("No se pudo cargar la configuración."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const updateField = <K extends keyof StoreConfig>(key: K, value: StoreConfig[K]) => {
    setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
    setDirty(true);
  };

  const updatePillar = (index: number, field: keyof NonNullable<StoreConfig["pillars"]>[0], value: unknown) => {
    setConfig((prev) => {
      if (!prev?.pillars) return prev;
      const pillars = [...prev.pillars];
      pillars[index] = { ...pillars[index], [field]: value };
      return { ...prev, pillars };
    });
    setDirty(true);
  };

  const addPillar = () => {
    setConfig((prev) => {
      if (!prev) return prev;
      const pillars = prev.pillars || [];
      return { ...prev, pillars: [...pillars, { id: crypto.randomUUID(), title: "", content: "", imageUrl: "", isActive: true, orderIndex: pillars.length }] };
    });
    setDirty(true);
  };

  const removePillar = (index: number) => {
    setConfig((prev) => {
      if (!prev?.pillars) return prev;
      return { ...prev, pillars: prev.pillars.filter((_, i) => i !== index) };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await configService.updateConfig(config);
      setConfig(updated);
      setDirty(false);
      toast.success("Configuración guardada correctamente.");
    } catch {
      toast.error("Error al guardar la configuración.");
    }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all bg-white";
  const labelClass = "text-sm font-semibold text-text-base";
  const cardClass = "bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-5";

  if (loading) {
    return <SettingsSkeleton />;
  }

  const ContactTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-1">
          <PhoneIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Contacto</h3>
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input value={config?.address || ""} onChange={(e) => updateField("address", e.target.value)} placeholder="Av. Principal, Centro Comercial..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input value={config?.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+58 212 1234567" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input value={config?.whatsapp || ""} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="+58 412 1234567" className={inputClass} />
          <p className="text-p-xs text-text-muted mt-1">Número para botón de WhatsApp flotante</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-1">
          <ClockIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Horarios</h3>
        </div>
        <div>
          <label className={labelClass}>Lunes a Viernes</label>
          <input value={config?.hoursMonFri || ""} onChange={(e) => updateField("hoursMonFri", e.target.value)} placeholder="9:00 AM - 6:00 PM" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sábados</label>
          <input value={config?.hoursSat || ""} onChange={(e) => updateField("hoursSat", e.target.value)} placeholder="9:00 AM - 2:00 PM" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Domingos</label>
          <input value={config?.hoursSun || ""} onChange={(e) => updateField("hoursSun", e.target.value)} placeholder="Cerrado" className={inputClass} />
        </div>
      </div>
    </div>
  );

  const SocialTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-1">
          <LinkIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Redes Sociales</h3>
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input value={config?.instagramUrl || ""} onChange={(e) => updateField("instagramUrl", e.target.value)} placeholder="https://instagram.com/mundomaquillaje" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>TikTok</label>
          <input value={config?.tiktokUrl || ""} onChange={(e) => updateField("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@mundomaquillaje" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Facebook</label>
          <input value={config?.facebookUrl || ""} onChange={(e) => updateField("facebookUrl", e.target.value)} placeholder="https://facebook.com/mundomaquillaje" className={inputClass} />
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-1">
          <MapPinIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Mapa</h3>
        </div>
        <div>
          <label className={labelClass}>Google Maps Embed</label>
          <textarea
            value={config?.googleMapsEmbed || ""}
            onChange={(e) => updateField("googleMapsEmbed", e.target.value)}
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
            rows={6}
            className={`${inputClass} font-mono text-xs resize-none`}
          />
          <p className="text-p-xs text-text-muted mt-1">Pega el código iframe de Google Maps (Compartir → Insertar mapa)</p>
        </div>
      </div>
    </div>
  );

  const ContentTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-1">
          <DocumentTextIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Nuestra Esencia</h3>
        </div>
        <textarea
          value={config?.ourEssence || ""}
          onChange={(e) => updateField("ourEssence", e.target.value)}
          placeholder="Texto que aparece en la sección 'Nuestra Esencia' del sitio..."
          rows={8}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <DocumentTextIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Misión y Visión</h3>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-semibold text-text-muted">Mostrar sección</label>
          <button
            role="switch"
            aria-checked={!!config?.showMissionVision}
            onClick={() => updateField("showMissionVision", !config?.showMissionVision)}
            className={`relative w-10 h-5 rounded-full transition-colors ${config?.showMissionVision ? "bg-success-500" : "bg-neutral-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config?.showMissionVision ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-text-muted">Mostrar Misión</label>
            <button
              role="switch"
              aria-checked={!!config?.showMission}
              onClick={() => updateField("showMission", !config?.showMission)}
              className={`relative w-8 h-4 rounded-full transition-colors ${config?.showMission ? "bg-success-500" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${config?.showMission ? "translate-x-4" : ""}`} />
            </button>
          </div>
          <input value={config?.missionTitle || ""} onChange={(e) => updateField("missionTitle", e.target.value)} placeholder="Título de la misión" className={`${inputClass} py-2 text-sm`} />
          <textarea value={config?.missionContent || ""} onChange={(e) => updateField("missionContent", e.target.value)} placeholder="Contenido de la misión..." rows={3} className={`${inputClass} text-sm resize-none`} />
        </div>

        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-text-muted">Mostrar Visión</label>
            <button
              role="switch"
              aria-checked={!!config?.showVision}
              onClick={() => updateField("showVision", !config?.showVision)}
              className={`relative w-8 h-4 rounded-full transition-colors ${config?.showVision ? "bg-success-500" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${config?.showVision ? "translate-x-4" : ""}`} />
            </button>
          </div>
          <input value={config?.visionTitle || ""} onChange={(e) => updateField("visionTitle", e.target.value)} placeholder="Título de la visión" className={`${inputClass} py-2 text-sm`} />
          <textarea value={config?.visionContent || ""} onChange={(e) => updateField("visionContent", e.target.value)} placeholder="Contenido de la visión..." rows={3} className={`${inputClass} text-sm resize-none`} />
        </div>
      </div>
    </div>
  );

  const PillarsTab = (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-brand-400" />
          <h3 className="text-p-b font-bold text-text-base">Pilares</h3>
        </div>
        <button onClick={addPillar} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-500 text-xs font-bold hover:bg-brand-100 transition-colors">
          <PhotoIcon className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-semibold text-text-muted">Título de la sección</label>
        <input value={config?.pillarsTitle || ""} onChange={(e) => updateField("pillarsTitle", e.target.value)} placeholder="Nuestros Pilares" className={`${inputClass} py-2 text-sm`} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-semibold text-text-muted">Mostrar sección</label>
        <button
          role="switch"
          aria-checked={!!config?.showPillars}
          onClick={() => updateField("showPillars", !config?.showPillars)}
          className={`relative w-10 h-5 rounded-full transition-colors ${config?.showPillars ? "bg-success-500" : "bg-neutral-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config?.showPillars ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {(config?.pillars ?? []).map((pillar, idx) => (
        <div key={idx} className="border border-neutral-100 rounded-2xl p-4 mb-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Pilar {idx + 1}</span>
            <div className="flex items-center gap-2">
              <button
                role="switch"
                aria-checked={pillar.isActive}
                onClick={() => updatePillar(idx, "isActive", !pillar.isActive)}
                className={`relative w-8 h-4 rounded-full transition-colors ${pillar.isActive ? "bg-success-500" : "bg-neutral-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${pillar.isActive ? "translate-x-4" : ""}`} />
              </button>
              <button onClick={() => removePillar(idx)} className="p-1 rounded hover:bg-danger-50 text-text-muted hover:text-danger-500 transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input value={pillar.title} onChange={(e) => updatePillar(idx, "title", e.target.value)} placeholder="Título" className={`${inputClass} py-2 text-sm`} />
          <textarea value={pillar.content} onChange={(e) => updatePillar(idx, "content", e.target.value)} placeholder="Descripción" rows={2} className={`${inputClass} text-sm resize-none`} />
          <div className="flex items-center gap-3">
            {pillar.imageUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-100">
                <img src={pillar.imageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => updatePillar(idx, "imageUrl", "")} className="absolute top-0.5 right-0.5 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-2.5 h-2.5" /></button>
              </div>
            ) : (
              <button onClick={() => setShowImagePicker(`pillar-${idx}`)} className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors">
                <PhotoIcon className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Imagen</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {(!config?.pillars || config.pillars.length === 0) && (
        <div className="text-center py-6 text-text-muted text-sm">
          No hay pilares configurados
        </div>
      )}
    </div>
  );

  return (
    <>
      {dirty && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 px-8 py-4 flex items-center justify-between animate-fade-in rounded-t-3xl">
          <p className="text-sm text-text-muted">Tienes cambios sin guardar</p>
          <div className="flex gap-3">
            <button onClick={() => { configService.getConfig().then(setConfig); setDirty(false); }} className="px-5 py-2 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">
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
        <div>
          <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">Ajustes de la Tienda</h2>
          <p className="text-p-sm text-text-muted mt-1">Información de contacto, horarios, redes sociales y contenido del sitio</p>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            Guardar
          </button>
        )}
      </div>

      <Tabs tabs={[
        { id: "contact", label: "Contacto", icon: <PhoneIcon className="w-4 h-4" />, content: ContactTab },
        { id: "social", label: "Redes y Mapa", icon: <LinkIcon className="w-4 h-4" />, content: SocialTab },
        { id: "content", label: "Contenido", icon: <DocumentTextIcon className="w-4 h-4" />, content: ContentTab },
        { id: "pillars", label: "Pilares", icon: <ChatBubbleLeftIcon className="w-4 h-4" />, content: PillarsTab },
      ]} />

      <ImagePickerModal
        isOpen={showImagePicker !== null}
        onClose={() => setShowImagePicker(null)}
        currentUrl=""
        onSave={(url) => {
          if (showImagePicker?.startsWith("pillar-")) {
            const idx = parseInt(showImagePicker.split("-")[1]);
            updatePillar(idx, "imageUrl", url);
          }
          setShowImagePicker(null);
        }}
      />
    </>
  );
};

export default SettingsPage;
