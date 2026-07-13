import { supabase } from "./supabase";

export async function uploadImageToSupabase(
  file: File,
  bucket = "products"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten archivos de imagen");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo no puede superar 5MB");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
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

  return publicUrl;
}
