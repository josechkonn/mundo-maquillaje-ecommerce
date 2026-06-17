import { useState } from "react";
import Modal from "../../ui/Modal";

interface SEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialDescription: string;
  slug: string;
  onSave: (title: string, description: string) => void;
}

const SEOModal = ({ isOpen, onClose, initialTitle, initialDescription, slug, onSave }: SEOModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    onSave(title, description);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar SEO" maxWidth="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-base mb-1.5">Título SEO</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título para motores de búsqueda"
            className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
          />
          <p className="text-p-xs text-text-muted mt-1.5">
            {title.length} caracteres · Recomendado: 50-60
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-base mb-1.5">Meta descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descripción para motores de búsqueda"
            className="w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all resize-none"
          />
          <p className="text-p-xs text-text-muted mt-1.5">
            {description.length} caracteres · Recomendado: 150-160
          </p>
        </div>

        {/* Live preview */}
        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">Vista previa</p>
          <p className="text-sm text-blue-600 font-medium truncate">{title || "Título de la categoría"} — Mundo Maquillaje</p>
          <p className="text-xs text-neutral-600 truncate">https://mundomaquillaje.com/categoria/{slug || "nombre-categoria"}</p>
          <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{description || "Descripción de la categoría..."}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-neutral-300 text-text-base font-bold py-3 px-4 rounded-[15px] text-sm hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-brand-400 text-white font-bold py-3 px-4 rounded-[15px] text-sm hover:bg-brand-500 transition-colors"
          >
            Guardar SEO
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SEOModal;
