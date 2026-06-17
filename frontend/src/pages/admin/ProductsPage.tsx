import { useState, useEffect, useCallback, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { productService, type Product, type Currency } from "../../services/productService";
import { brandService, type Brand } from "../../services/brandService";
import { categoryService, type Category } from "../../services/categoryService";
import { currencyService } from "../../services/currencyService";
import { convertPriceNumber } from "../../lib/formatters";
import toast from "react-hot-toast";
import ProductForm from "./products/ProductForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type ColumnDef } from "../../components/ui/DataTable";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | "bulk" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDesc, setSortDesc] = useState(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAdminProducts(0, 1000);
      setProducts(Array.isArray(data) ? data : (data as any).content || []);
    } catch {
      toast.error("No se pudieron cargar los productos.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsData, categoriesData, currenciesData] = await Promise.all([
          brandService.getAllBrands(),
          categoryService.getAllCategories(),
          currencyService.getAllCurrencies(),
        ]);
        setBrands(brandsData);
        setCategories(categoriesData);
        setCurrencies(currenciesData.filter(c => c.isActive !== false));
      } catch {
        toast.error("Error al cargar datos auxiliares.");
      }
    };
    loadData();
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
      if (brandFilter && p.brand?.id !== brandFilter) return false;
      if (categoryFilter && p.category?.id !== categoryFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, statusFilter, brandFilter, categoryFilter, search]);

  const getTotalStock = (product: Product): number => {
    return product.variations?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  };

  const getStockColor = (stock: number): string => {
    if (stock === 0) return "bg-danger-500";
    if (stock <= 10) return "bg-amber-500";
    return "bg-success-500";
  };

  const sortedProducts = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const getSortValue = (p: Product) => {
        if (!p.variations || p.variations.length === 0) return 0;
        const minPrice = Math.min(...p.variations.map(v => v.price || 0));
        switch (sortBy) {
          case "priceUSD": {
            const usd = currencies.find(c => c.code === "USD");
            return convertPriceNumber(minPrice, p.currency, usd, currencies);
          }
          case "priceCOP": {
            const cop = currencies.find(c => c.code === "COP");
            return convertPriceNumber(minPrice, p.currency, cop, currencies);
          }
          case "priceVES": {
            const ves = currencies.find(c => c.code === "VES" || c.code === "VEF" || c.code === "BS");
            return ves ? convertPriceNumber(minPrice, p.currency, ves, currencies) : 0;
          }
          case "stock":
            return getTotalStock(p);
          default:
            return 0;
        }
      };
      const valA = getSortValue(a);
      const valB = getSortValue(b);
      return sortDesc ? valB - valA : valA - valB;
    });
  }, [filtered, sortBy, sortDesc, currencies]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, brandFilter, categoryFilter]);

  const activeCount = products.filter(p => p.isActive).length;

  const getMainImage = (product: Product): string | undefined => {
    for (const v of product.variations || []) {
      const mainImg = v.images?.find(img => img.isMain) || v.images?.[0];
      if (mainImg) return mainImg.urlImage;
    }
    return undefined;
  };

  const columns: ColumnDef<Product>[] = [
    {
      key: "image",
      header: "",
      className: "w-20",
      render: (p) => {
        const img = getMainImage(p);
        return (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-100 flex-shrink-0">
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs font-bold">
                {p.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Producto",
      className: "min-w-[200px]",
      render: (p) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-base truncate">{p.name}</p>
          <p className="text-p-xs text-text-muted truncate">{p.slug}</p>
        </div>
      ),
    },
    {
      key: "brand",
      header: "Marca",
      className: "w-32",
      render: (p) => (
        <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold truncate max-w-[120px]">
          {p.brand?.name || "—"}
        </span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      className: "w-36",
      render: (p) => (
        <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-text-base text-xs font-semibold truncate max-w-[140px]">
          {p.category?.name || "—"}
        </span>
      ),
    },
    {
      key: "priceUSD",
      header: "USD",
      className: "w-32",
      sortable: true,
      render: (p) => {
        if (!p.variations || p.variations.length === 0) return <span className="text-text-muted">—</span>;
        const minPrice = Math.min(...p.variations.map(v => v.price || 0));
        const usdCurrency = currencies.find(c => c.code === "USD");
        const converted = convertPriceNumber(minPrice, p.currency, usdCurrency, currencies);
        const decimals = usdCurrency?.decimalPlaces ?? 2;
        return (
          <span className="text-sm font-bold text-text-base">
            {usdCurrency?.symbolPosition === "LEFT" ? usdCurrency.symbol : ""}
            {converted.toFixed(decimals)}
            {usdCurrency?.symbolPosition === "RIGHT" ? ` ${usdCurrency.symbol}` : ""}
          </span>
        );
      },
    },
    {
      key: "priceCOP",
      header: "COP",
      className: "w-36",
      sortable: true,
      render: (p) => {
        if (!p.variations || p.variations.length === 0) return <span className="text-text-muted">—</span>;
        const minPrice = Math.min(...p.variations.map(v => v.price || 0));
        const copCurrency = currencies.find(c => c.code === "COP");
        const converted = convertPriceNumber(minPrice, p.currency, copCurrency, currencies);
        const decimals = copCurrency?.decimalPlaces ?? 0;
        return (
          <span className="text-sm font-bold text-text-base">
            {copCurrency?.symbolPosition === "LEFT" ? copCurrency.symbol : ""}
            {converted.toFixed(decimals)}
            {copCurrency?.symbolPosition === "RIGHT" ? ` ${copCurrency.symbol}` : ""}
          </span>
        );
      },
    },
    {
      key: "priceVES",
      header: "VES",
      className: "w-36",
      sortable: true,
      render: (p) => {
        if (!p.variations || p.variations.length === 0) return <span className="text-text-muted">—</span>;
        const minPrice = Math.min(...p.variations.map(v => v.price || 0));
        const vesCurrency = currencies.find(c => c.code === "VES" || c.code === "VEF" || c.code === "BS");
        if (!vesCurrency) return <span className="text-text-muted">—</span>;
        const converted = convertPriceNumber(minPrice, p.currency, vesCurrency, currencies);
        const decimals = vesCurrency.decimalPlaces ?? 2;
        return (
          <span className="text-sm font-bold text-text-base">
            {vesCurrency.symbolPosition === "LEFT" ? vesCurrency.symbol : ""}
            {converted.toFixed(decimals)}
            {vesCurrency.symbolPosition === "RIGHT" ? ` ${vesCurrency.symbol}` : ""}
          </span>
        );
      },
    },
    {
      key: "stock",
      header: "Stk",
      className: "w-24",
      sortable: true,
      render: (p) => {
        const total = getTotalStock(p);
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${getStockColor(total)}`} />
            <span className="text-sm font-semibold text-text-base">{total}</span>
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Estado",
      className: "text-center w-20",
      render: (p) => (
        <button
          onClick={() => handleToggleActive(p)}
          className={`relative w-10 h-5 rounded-full transition-colors ${p.isActive ? "bg-success-500" : "bg-neutral-300"}`}
          title={p.isActive ? "Desactivar" : "Activar"}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${p.isActive ? "translate-x-5" : ""}`} />
        </button>
      ),
    },
  ];

  const handleToggleActive = async (product: Product) => {
    const wasActive = product.isActive;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    try {
      await productService.updateProduct(product.id, { ...product, isActive: !product.isActive });
    } catch {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: wasActive } : p));
      toast.error("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Producto eliminado correctamente.");
    } catch {
      toast.error("No se pudo eliminar el producto.");
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try { await productService.deleteProduct(id); successCount++; } catch { }
    }
    setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    toast.success(`${successCount} productos eliminados.`);
    setDeleting(false);
    setConfirmDelete(null);
  };

  const handleBulkToggle = async (active: boolean) => {
    for (const id of selectedIds) {
      const product = products.find(p => p.id === id);
      if (product) {
        try {
          await productService.updateProduct(id, { ...product, isActive: active });
          setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: active } : p));
        } catch { }
      }
    }
    setSelectedIds(new Set());
  };

  const handleSaveForm = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct.id, data);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await productService.createProduct(data);
        setProducts(prev => [...prev, created]);
      }
      setShowForm(false);
      setEditingProduct(null);
      toast.success(editingProduct ? "Producto actualizado correctamente." : "Producto creado correctamente.");
    } catch {
      toast.error("Error al guardar el producto.");
      throw new Error("Error al guardar");
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-8 animate-fade-in">
        <ProductForm
          product={editingProduct}
          onSave={handleSaveForm}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete === "bulk") handleBulkDelete();
          else if (confirmDelete) handleDelete(confirmDelete);
        }}
        title={confirmDelete === "bulk" ? "Eliminar productos" : "Eliminar producto"}
        message={
          confirmDelete === "bulk"
            ? `¿Estás seguro de eliminar ${selectedIds.size} productos? Esta acción no se puede deshacer.`
            : "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        }
        loading={deleting}
      />

      <DataTable
        title="Productos"
        titleInfo={`${sortedProducts.length} productos · ${activeCount} activos`}
        columns={columns}
        data={paginatedProducts}
        isLoading={loading}
        totalItems={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sortBy={sortBy}
        sortDesc={sortDesc}
        onSort={(key, desc) => { setSortBy(key); setSortDesc(desc); }}
        onSearch={setSearch}
        searchPlaceholder="Buscar productos..."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getId={(p) => p.id}
        onEdit={(p) => { setEditingProduct(p as Product); setShowForm(true); }}
        onDelete={(p) => setConfirmDelete(p.id)}
        onTrashClick={() => setConfirmDelete("bulk")}
        trashButtonTitle="Eliminar productos"
        filters={[
          {
            key: "status",
            label: "Estado",
            options: [
              { label: "Activos", value: "active" },
              { label: "Inactivos", value: "inactive" },
            ],
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as "" | "active" | "inactive"),
          },
          {
            key: "brand",
            label: "Marca",
            options: brands.filter(b => b.isActive).map(b => ({ label: b.name, value: b.id })),
            value: brandFilter,
            onChange: (v) => setBrandFilter(v),
          },
          {
            key: "category",
            label: "Categoría",
            options: categories.filter(c => c.isActive).map(c => ({ label: c.name, value: c.id })),
            value: categoryFilter,
            onChange: (v) => setCategoryFilter(v),
          },
        ]}
        renderHeaderActions={(
          <div className="w-full flex justify-between sm:w-auto sm:justify-start sm:gap-3">
            <button
              onClick={() => { setEditingProduct(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500 shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              Crear
            </button>
          </div>
        )}
        headerExtra={selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in mt-6">
            <span className="text-sm font-medium text-text-base">{selectedIds.size} seleccionados</span>
            <div className="w-px h-5 bg-brand-200" />
            <button onClick={() => handleBulkToggle(true)} className="text-sm font-medium text-brand-500 hover:text-brand-600">Activar</button>
            <button onClick={() => handleBulkToggle(false)} className="text-sm font-medium text-text-muted hover:text-text-base">Desactivar</button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
          </div>
        )}
        renderEmpty={(
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <p className="text-text-muted font-medium text-lg mb-2">No hay productos</p>
            <p className="text-text-muted text-sm mb-6">Crea tu primer producto para empezar.</p>
            <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 bg-brand-400 text-white hover:bg-brand-500">
              <PlusIcon className="w-5 h-5" />
              Crear producto
            </button>
          </div>
        )}
      />
    </>
  );
};

export default ProductsPage;
