import { useAuthStore } from "../store/authStore";
import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // El backend vive en otro dominio (onrender.com): el navegador no le envía la
  // cookie SameSite=Lax, así que mandamos el token de Supabase en el header.
  const { data: { session: current } } = await supabase.auth.getSession();

  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(current?.access_token ? { Authorization: `Bearer ${current.access_token}` } : {}),
      ...options.headers,
    },
  };

  let response = await fetch(url, defaultOptions);

  // Si el backend responde 401 (No autorizado)
  if (response.status === 401) {
    console.warn("Backend 401 detectado. Intentando refrescar sesión...");

    // Forzamos a Supabase a revisar la sesión (esto dispara el refresh si es necesario)
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Si tenemos sesión nueva, reintentamos la petición original una vez con el token actualizado
      response = await fetch(url, {
        ...defaultOptions,
        headers: { ...(defaultOptions.headers as Record<string, string>), Authorization: `Bearer ${session.access_token}` },
      });
    } else {
      // Si no hay sesión, cerramos todo
      useAuthStore.getState().signOut();
      throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(error.message || "Error en la petición");
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: (endpoint: string, options?: Omit<RequestInit, "method" | "body">) => apiFetch(endpoint, { method: "GET", ...options }),
  post: (endpoint: string, body: any, options?: Omit<RequestInit, "method" | "body">) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (endpoint: string, body: any, options?: Omit<RequestInit, "method" | "body">) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body), ...options }),
  patch: (endpoint: string, body: any, options?: Omit<RequestInit, "method" | "body">) => apiFetch(endpoint, { method: "PATCH", body: JSON.stringify(body), ...options }),
  delete: (endpoint: string, options?: Omit<RequestInit, "method" | "body">) => apiFetch(endpoint, { method: "DELETE", ...options }),
};
