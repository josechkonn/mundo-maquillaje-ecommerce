import React, { useRef, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface ReceiptUploaderProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onUploadComplete,
  currentUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

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
      const fileName = `receipt-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Comprobante subido correctamente");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Error al subir el archivo");
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
  }, [uploadFile]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showImage = !!previewUrl;

  return (
    <div className="relative rounded-[32px] shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload zone - always rendered, hidden when image is shown */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`
          bg-white border-2 border-dashed rounded-[32px] p-12 text-center cursor-pointer
          ${isDragging
            ? "border-brand-400 bg-brand-50"
            : "border-brand-200 hover:border-brand-300"
          }
          ${showImage ? "hidden" : ""}
        `}
      >
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="w-20 h-20 bg-neutral-100 rounded-[24px] flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-400"></div>
              </div>
              <p className="text-p-s text-text-muted font-medium">Subiendo comprobante...</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-neutral-100 rounded-[24px] flex items-center justify-center mb-4 text-brand-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-p-s text-text-muted mb-2 font-medium">
                {isDragging ? "Suelta tu comprobante aquí" : "Sube aquí tu comprobante de pago"}
              </p>
              <p className="text-[12px] text-text-muted/70 mb-6">
                Arrastra y suelta o haz clic para seleccionar
              </p>
              <div className="bg-brand-400 text-white px-8 py-3 rounded-2xl font-bold text-p-sm hover:bg-brand-500 transition-colors">
                Examinar Archivos
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image preview with hover overlay */}
      {showImage && (
        <div className="relative group rounded-[32px]">
          <div className="max-h-[40vh] overflow-y-auto overscroll-contain rounded-[32px]">
            <img
              src={previewUrl!}
              alt="Comprobante de pago"
              className="w-full object-contain bg-white rounded-[32px]"
            />
          </div>

          {/* Loading overlay during upload */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 rounded-[32px] flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white font-bold text-p-sm">Subiendo comprobante...</p>
            </div>
          )}

          {/* Hover overlay - outside scroll container */}
          {!isUploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[32px] flex flex-col items-center justify-center gap-4 z-20 pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}
                className="pointer-events-auto bg-white text-text-base px-6 py-3 rounded-2xl font-bold text-p-sm hover:bg-neutral-100 transition-colors"
              >
                Editar comprobante
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                className="pointer-events-auto bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-p-sm hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
