import { api } from "../lib/api";

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
  symbolPosition: "LEFT" | "RIGHT";
}

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributeName?: string;
  attributeValue?: string;
  hexColor?: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  urlImage: string;
  order: number;
  altText: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  alertQuantity: number;
  isActive: boolean;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  currency: Currency;
  variations: ProductVariation[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
}

export const productService = {
  /**
   * Obtiene productos paginados, opcionalmente filtrados por categoría
   */
  getAllProducts: async (
    page = 0, 
    size = 10, 
    categoryId?: string, 
    parentCategoryId?: string, 
    search?: string, 
    lastId?: string,
    brandId?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    targetRate?: number,
    targetCurrencyCode?: string
  ): Promise<PageResponse<Product> | Product[]> => {
    let url = `/products?page=${page}&size=${size}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (parentCategoryId) url += `&parentCategoryId=${parentCategoryId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (lastId) url += `&lastId=${lastId}`;
    if (brandId) url += `&brandId=${brandId}`;
    if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
    if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (targetRate) url += `&targetRate=${targetRate}`;
    if (targetCurrencyCode) url += `&targetCurrencyCode=${targetCurrencyCode}`;
    return api.get(url);
  },

  /**
   * Obtiene el rango de precios (min y max) dinámico
   */
  getPriceRange: async () => {
    return api.get("/products/price-range");
  },

  /**
   * Obtiene un producto por ID
   */
  getProductById: async (id: string): Promise<Product> => {
    return api.get(`/products/${id}`);
  },

  /**
   * Obtiene un producto por Slug
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    return api.get(`/products/slug/${slug}`);
  },

  /**
   * Crea un nuevo producto (Admin)
   */
  createProduct: async (product: Partial<Product>): Promise<Product> => {
    return api.post("/products", product);
  },

  /**
   * Actualiza un producto existente (Admin)
   */
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return api.put(`/products/${id}`, product);
  },

  /**
   * Elimina un producto (Admin)
   */
  deleteProduct: async (id: string): Promise<void> => {
    return api.delete(`/products/${id}`);
  }
};
