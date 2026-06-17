import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Modal from "../../ui/Modal";
import toast from "react-hot-toast";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
  bucket?: string;
  title?: string;
}

const ImagePickerModal = ({ isOpen, onClose, currentUrl, onSave, bucket = "products", title }: ImagePickerModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentUrl || null);
      setIsDragging(false);
      setIsUploading(false);
    }
  }, [isOpen, currentUrl]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no puede superar 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `pmethod-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
        img.src = publicUrl;
      });

      setPreviewUrl(publicUrl);
      toast.success("Imagen subida correctamente");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (previewUrl) {
      onSave(previewUrl);
      onClose();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Imagen del producto"} maxWidth="md">
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleButtonClick}
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
              ${isDragging ? "border-brand-400 bg-brand-50" : "border-neutral-300 hover:border-brand-300"}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-400 mb-3" />
                <p className="text-sm text-text-muted font-medium">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3 text-brand-300">
                  <PhotoIcon className="w-8 h-8" />
                </div>
                <p className="text-sm text-text-muted mb-1 font-medium">
                  {isDragging ? "Suelta la imagen aquí" : "Sube una imagen del producto"}
                </p>
                <p className="text-xs text-text-muted/70 mb-4">Arrastra y suelta o haz clic para seleccionar</p>
                <div className="bg-brand-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-500 transition-colors">
                  Examinar Archivos
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative group">
            <div className="max-h-[40vh] overflow-hidden rounded-2xl bg-neutral-50">
              <img src={previewUrl} alt="Preview" className="w-full object-contain" />
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3" />
                <p className="text-white font-medium text-sm">Subiendo imagen...</p>
              </div>
            )}

            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3 z-20 pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                  className="pointer-events-auto bg-white text-text-base px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-100 transition-colors"
                >
                  Cambiar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  className="pointer-events-auto bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-neutral-300 text-text-base font-bold py-3 px-4 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!previewUrl}
            className="flex-1 bg-brand-400 text-white font-bold py-3 px-4 rounded-xl text-sm hover:bg-brand-500 transition-colors disabled:opacity-50"
          >
            Guardar imagen
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImagePickerModal;
