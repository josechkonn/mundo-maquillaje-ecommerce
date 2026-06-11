import { useState, useEffect } from "react";
import { ArrowLeftIcon, XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { UserProfile } from "../../../services/userService";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";
import { api } from "../../../lib/api";

interface StateOption {
  id: string;
  name: string;
}

interface UserFormProps {
  user?: UserProfile | null;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
}

const ROLES: { label: string; value: "USER" | "EMPLOYEE" | "ADMIN" }[] = [
  { label: "Cliente", value: "USER" },
  { label: "Empleado", value: "EMPLOYEE" },
  { label: "Admin", value: "ADMIN" },
];

const UserForm = ({ user, onSave, onCancel }: UserFormProps) => {
  const isEditing = !!user;
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [role, setRole] = useState<"USER" | "EMPLOYEE" | "ADMIN">(user?.role || "USER");
  const [stateId, setStateId] = useState((user as any)?.state?.id || "");
  const [states, setStates] = useState<StateOption[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    api.get("/locations/states")
      .then((data) => setStates(data))
      .catch(() => setStates([]));
  }, []);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!email.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<UserProfile> = {
        name,
        email,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
        role,
        state: stateId ? { id: stateId, name: "" } : undefined,
      };
      await onSave(payload);
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
              {isEditing ? user.name : "Nuevo Usuario"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${
              role === "ADMIN" ? "bg-purple-100 text-purple-700" :
              role === "EMPLOYEE" ? "bg-blue-100 text-blue-700" :
              "bg-neutral-100 text-text-muted"
            }`}>
              {role === "ADMIN" ? "Admin" : role === "EMPLOYEE" ? "Empleado" : "Cliente"}
            </span>
          </div>
        </div>
        {!dirty && (
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors disabled:opacity-50">
            {isEditing ? "Guardar" : "Crear usuario"}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:max-w-[calc(70%-12px)] space-y-6">
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Información Personal</h3>
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} placeholder="Ej: María García" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); markDirty(); }} placeholder="correo@ejemplo.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={phone} onChange={(e) => { setPhone(e.target.value); markDirty(); }} placeholder="+58 412 1234567" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Foto de perfil</label>
              <div className="mt-1.5 flex items-center gap-4">
                {avatarUrl ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-neutral-100">
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => { setAvatarUrl(""); markDirty(); }} className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-danger-500"><XMarkIcon className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 transition-colors cursor-pointer" onClick={() => { setShowImagePicker(true); }}>
                    <PhotoIcon className="w-6 h-6" />
                    <span className="text-p-xs mt-1">Agregar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[30%] space-y-6">
          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Rol</h3>
            <select value={role} onChange={(e) => { setRole(e.target.value as "USER" | "EMPLOYEE" | "ADMIN"); markDirty(); }} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <p className="text-p-xs text-text-muted mt-1">
              {role === "ADMIN" && "Acceso completo al panel de administración"}
              {role === "EMPLOYEE" && "Puede gestionar pedidos y ver reportes"}
              {role === "USER" && "Solo puede realizar compras y ver su cuenta"}
            </p>
          </div>

          <div className={cardClass}>
            <h3 className="text-p-b font-bold text-text-base">Ubicación</h3>
            <select value={stateId} onChange={(e) => { setStateId(e.target.value); markDirty(); }} className={inputClass}>
              <option value="">Sin estado</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        currentUrl={avatarUrl}
        onSave={(url) => { setAvatarUrl(url); markDirty(); }}
      />
    </>
  );
};

export default UserForm;
