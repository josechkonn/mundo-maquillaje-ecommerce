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

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    // Manejo de errores global si es necesario
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
