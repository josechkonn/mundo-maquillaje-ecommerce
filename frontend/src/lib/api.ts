import { useAuthStore } from "../store/authStore";
import { supabase } from "./supabase";

const BASE_URL = "http://localhost:8080/api";

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
      // Si tenemos sesión nueva, reintentamos la petición original una vez
      // El authListener ya se encargará de sincronizar la cookie en segundo plano
      response = await fetch(url, defaultOptions);
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
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
};
