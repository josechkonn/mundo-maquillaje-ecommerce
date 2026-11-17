import { createClient } from "@supabase/supabase-js";

// Estas variables deben venir del archivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// VITE_SUPABASE_ANON_PUBLIC es el nombre nuevo (Vercel bloquea nombres públicos con "KEY");
// se mantiene el antiguo como respaldo para entornos locales.
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_PUBLIC ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_PUBLIC)."
  );
}

// Helper para traducir los errores de autenticación comunes de Supabase
export const translateAuthError = (errorMsg: string): string => {
  const messages: Record<string, string> = {
    "Invalid login credentials": "Las credenciales son incorrectas. Verifica tu correo y contraseña.",
    "User already registered": "Ese correo ya está registrado en nuestro sistema.",
    "Email not confirmed": "Debes confirmar tu correo electrónico antes de iniciar sesión.",
    "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
    "To security purposes, you can only request this once every 60 seconds": "Por seguridad, espera unos 60 segundos antes de intentar nuevamente.",
    "Signup requires a valid password": "Por favor ingresa una contraseña válida.",
    "Rate limit exceeded": "Has hecho demasiados intentos. Por favor, intenta de nuevo más tarde."
  };

  // Si el mensaje está en nuestro diccionario lo retorna, si no, retorna un genérico o el original
  return messages[errorMsg] || "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
};

// Cliente global de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
