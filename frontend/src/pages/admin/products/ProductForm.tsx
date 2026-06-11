import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeftIcon, PlusIcon, XMarkIcon, PhotoIcon, TrashIcon, PencilIcon, CurrencyDollarIcon, ChatBubbleLeftIcon, DocumentTextIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { Product, ProductVariation, ProductImage, Currency } from "../../../services/productService";
import { brandService, type Brand } from "../../../services/brandService";
import { categoryService, type Category } from "../../../services/categoryService";
import { currencyService } from "../../../services/currencyService";
import { convertPriceNumber } from "../../../lib/formatters";
import ImagePickerModal from "../../../components/admin/modals/ImagePickerModal";
import Modal from "../../../components/ui/Modal";
import Stepper from "../../../components/ui/Stepper";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

const ATTRIBUTE_TYPES = ["Color", "Talla", "Volumen", "Peso", "Tipo", "Otro"];

const STEPS = [
  { label: "Información básica" },
  { label: "Precios y variantes" },
  { label: "Revisar y guardar" },
];

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const isEditing = !!product;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [brandId, setBrandId] = useState(product?.brand?.id || "");
  const [categoryId, setCategoryId] = useState(product?.category?.id || "");
  const [currencyId, setCurrencyId] = useState(product?.currency?.id || "");
  const [description, setDescription] = useState(product?.description || "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [variations, setVariations] = useState<ProductVariation[]>(product?.variations || []);

  const [selectedVariationIds, setSelectedVariationIds] = useState<Set<string>>(new Set());
  const [bulkEditType, setBulkEditType] = useState<"price" | "stock" | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState("");

  const [imagePickerVariationIndex, setImagePickerVariationIndex] = useState<number | null>(null);
  const [imagePickerImageIndex, setImagePickerImageIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [priceByCurrency, setPriceByCurrency] = useState<Record<string, number>>({});
  const [variationPrices, setVariationPrices] = useState<Record<string, Record<string, number>>>({});
  const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
  const [basePriceDraft, setBasePriceDraft] = useState<string | null>(null);
  const [varPriceDraft, setVarPriceDraft] = useState<Record<string, string | null>>({});
  const [useDefaultTitleMap, setUseDefaultTitleMap] = useState<Record<string, boolean>>({});
  const [useDefaultDescMap, setUseDefaultDescMap] = useState<Record<string, boolean>>({});
  const slugManuallyEdited = useRef(false);

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
        toast.error("Error al cargar datos del formulario.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isEditing && variations.length === 0 && currencies.length > 0 && !dirty) {
      const baseCode = currencies.find(c => c.id === currencyId)?.code ?? currencies[0]?.code ?? "";
      const newVariation: ProductVariation = {
        id: crypto.randomUUID(),
        name: "",
        sku: "",
        price: 0,
        stock: 0,
        description: "",
        alertQuantity: 5,
        isActive: true,
        attributeName: "",
        attributeValue: "",
        hexColor: "",
        images: [],
      };
      setVariations([newVariation]);
      const prices: Record<string, number> = {};
      currencies.forEach(c => { prices[c.code] = 0; });
      setVariationPrices({ [newVariation.id]: prices });
    }
  }, [isEditing, currencies]);

  useEffect(() => {
    if (currencies.length > 0) {
      if (product?.variations && product.variations.length > 0) {
        const basePrice = Math.min(...product.variations.map(v => v.price || 0));
        const prices: Record<string, number> = {};
        currencies.forEach(c => {
          prices[c.code] = convertPriceNumber(basePrice, product.currency, c, currencies);
        });
        setPriceByCurrency(prices);

        const varPrices: Record<string, Record<string, number>> = {};
        product.variations.forEach(v => {
          const p: Record<string, number> = {};
          currencies.forEach(c => {
            p[c.code] = convertPriceNumber(v.price || 0, product.currency, c, currencies);
          });
          varPrices[v.id] = p;
        });
        setVariationPrices(varPrices);
      } else {
        const prices: Record<string, number> = {};
        currencies.forEach(c => { prices[c.code] = 0; });
        setPriceByCurrency(prices);
      }
    }
  }, [product, currencies]);

  useEffect(() => {
    if (!isEditing && name && !slugManuallyEdited.current) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [name, isEditing]);

  const markDirty = useCallback(() => { if (!dirty) setDirty(true); }, [dirty]);

  const baseCurrency = currencies.find(c => c.id === currencyId);

  const addEmptyVariation = () => {
    const baseCode = baseCurrency?.code ?? "";
    const basePrice = priceByCurrency[baseCode] ?? 0;
    const newVariation: ProductVariation = {
      id: crypto.randomUUID(),
      name: "",
      sku: "",
      price: basePrice,
      stock: 0,
      description: "",
      alertQuantity: 5,
      isActive: true,
      attributeName: "",
      attributeValue: "",
      hexColor: "",
      images: [],
    };
    setVariations(prev => [...prev, newVariation]);
    const prices: Record<string, number> = {};
    currencies.forEach(c => {
      prices[c.code] = convertPriceNumber(basePrice, baseCurrency!, c, currencies);
    });
    setVariationPrices(prev => ({ ...prev, [newVariation.id]: prices }));
    setEditingVariationIndex(variations.length);
    markDirty();
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: unknown) => {
    if (field === "price") {
      const v = variations[index];
      setVariationPrices(prev => {
        const current = prev[v.id] || {};
        const baseCode = baseCurrency?.code ?? "";
        const updated = { ...current, [baseCode]: value as number };
        const next: Record<string, number> = {};
        currencies.forEach(c => {
          next[c.code] = convertPriceNumber(updated[baseCode] ?? 0, baseCurrency!, c, currencies);
        });
        return { ...prev, [v.id]: next };
      });
    }
    setVariations(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    markDirty();
  };

  const updateVariationField = (field: keyof ProductVariation, value: unknown) => {
    if (editingVariationIndex === null) return;
    updateVariation(editingVariationIndex, field, value);
  };

  const removeVariation = (index: number) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
    setSelectedVariationIds(prev => { const n = new Set(prev); n.delete(variations[index].id); return n; });
    markDirty();
  };

  const getMainImage = (variation: ProductVariation): ProductImage | undefined => {
    return variation.images.find(img => img.isMain) || variation.images[0];
  };

  const handleSave = async () => {
    if (!brandId || !categoryId || !currencyId) {
      toast.error("Selecciona marca, categoría y moneda.");
      return;
    }
    if (variations.length === 0) {
      toast.error("Agrega al menos una variante.");
      return;
    }

    const selectedBrand = brands.find(b => b.id === brandId);
    const selectedCategory = categories.find(c => c.id === categoryId);
    const selectedCurrency = currencies.find(c => c.id === currencyId);
    if (!selectedBrand || !selectedCategory || !selectedCurrency) {
      toast.error("Error en los datos seleccionados.");
      return;
    }

    const productData: Partial<Product> = {
      name,
      slug,
      description,
      isActive,
      category: { id: selectedCategory.id, name: selectedCategory.name },
      brand: { id: selectedBrand.id, name: selectedBrand.name },
      currency: selectedCurrency,
      variations: variations.map(v => {
        const { id, images, ...rest } = v;
        return {
          ...(isEditing ? { id } : {}),
          ...rest,
          ...(images.length > 0 ? { images: images.map(({ id: imgId, ...imgRest }) => isEditing ? { id: imgId, ...imgRest } : imgRest) } : {}),
          price: variationPrices[v.id]?.[selectedCurrency.code] ?? v.price,
        };
      }),
    };

    setSaving(true);
    try {
      await onSave(productData);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkEdit = async () => {
    if (!bulkEditValue || selectedVariationIds.size === 0) return;
    const value = parseFloat(bulkEditValue);
    if (isNaN(value)) return;

    if (bulkEditType === "price") {
      setVariationPrices(prev => {
        const next = { ...prev };
        variations.forEach(v => {
          if (!selectedVariationIds.has(v.id)) return;
          const updated: Record<string, number> = {};
          currencies.forEach(c => {
            updated[c.code] = convertPriceNumber(value, baseCurrency!, c, currencies);
          });
          next[v.id] = updated;
        });
        return next;
      });
      setVariations(prev => prev.map(v => {
        if (!selectedVariationIds.has(v.id)) return v;
        return { ...v, price: value };
      }));
    } else {
      setVariations(prev => prev.map(v => {
        if (!selectedVariationIds.has(v.id)) return v;
        return { ...v, stock: value };
      }));
    }
    setBulkEditType(null);
    setBulkEditValue("");
    markDirty();
  };

  const canGoNext = () => {
    if (step === 0) {
      if (!name.trim()) { toast.error("El nombre es obligatorio."); return false; }
      if (!slug.trim()) { toast.error("El slug es obligatorio."); return false; }
      if (!brandId) { toast.error("Selecciona una marca."); return false; }
      if (!categoryId) { toast.error("Selecciona una categoría."); return false; }
      return true;
    }
    if (step === 1) {
      if (variations.length === 0) { toast.error("Agrega al menos una variante."); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleCancel = () => {
    if (dirty) {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text-base">¿Salir sin guardar?</p>
          <div className="flex gap-2">
            <button onClick={() => { toast.dismiss(t.id); onCancel(); }} className="px-4 py-1.5 rounded-lg bg-danger-500 text-white text-sm font-bold hover:bg-danger-600">Salir</button>
            <button onClick={() => toast.dismiss(t.id)} className="px-4 py-1.5 rounded-lg bg-neutral-100 text-text-base text-sm font-medium hover:bg-neutral-200">Seguir editando</button>
          </div>
        </div>
      ), { duration: 8000 });
    } else {
      onCancel();
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-neutral-400 text-sm text-text-base placeholder-neutral-500 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all bg-white";
  const labelClass = "text-sm font-semibold text-text-base";
  const cardClass = "bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-5";

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors text-text-muted hover:text-text-base">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-h4-s md:text-h4-b font-bold text-text-base">
              {isEditing ? "Editar: " + product.name : "Nuevo Producto"}
            </h2>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {isEditing ? (
        <>
          <div className="space-y-6">
            <div className={cardClass}>
              <h3 className="text-p-b font-bold text-text-base">Información Básica</h3>
              <div>
                <label className={labelClass}>Nombre</label>
                <input value={name} onChange={e => { setName(e.target.value); markDirty(); }} placeholder="Ej: Labial Mate L'Oréal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input value={slug} onChange={e => { setSlug(e.target.value); slugManuallyEdited.current = true; markDirty(); }} placeholder="url-amigable-del-producto" className={`${inputClass} text-text-muted`} />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={description} onChange={e => { setDescription(e.target.value); markDirty(); }} rows={3} placeholder="Describe el producto..." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Marca</label>
                <select value={brandId} onChange={e => { setBrandId(e.target.value); markDirty(); }} className={inputClass}>
                  <option value="">Seleccionar marca...</option>
                  {brands.filter(b => b.isActive).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Categoría</label>
                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); markDirty(); }} className={inputClass}>
                  <option value="">Seleccionar categoría...</option>
                  {categories.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className={labelClass}>Estado</label>
                  <p className="text-p-xs text-text-muted">{isActive ? "Visible en la tienda" : "Oculto"}</p>
                </div>
                <button
                  onClick={() => { setIsActive(!isActive); markDirty(); }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-success-500" : "bg-neutral-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </div>
            <div className={cardClass}>
              <h3 className="text-p-b font-bold text-text-base">Moneda y Precios</h3>
              <p className="text-p-xs text-text-muted mb-3">Selecciona la moneda base. Las demás se calculan automáticamente.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {currencies.map(currency => (
                  <label key={currency.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="baseCurrency"
                      value={currency.id}
                      checked={currencyId === currency.id}
                      onChange={() => { setCurrencyId(currency.id); setBasePriceDraft(null); markDirty(); }}
                      className="sr-only"
                    />
                    <span className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                      currencyId === currency.id
                        ? "bg-brand-400 text-white border-brand-400"
                        : "bg-white text-text-muted border-neutral-200 hover:border-brand-300"
                    }`}>
                      {currency.code}
                    </span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currencies.map(currency => {
                  const isBase = currency.id === currencyId;
                  const storedPrice = priceByCurrency[currency.code] ?? 0;
                  const decimals = currency.decimalPlaces ?? 2;
                  return (
                    <div key={currency.id}>
                      <label className="text-p-xs font-bold text-text-muted mb-1 flex items-center gap-1.5">
                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                        {currency.code}
                        {isBase && <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[9px] font-bold">BASE</span>}
                      </label>
                      {isBase ? (
                        <div className="flex items-center rounded-xl border-2 border-brand-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                          {currency.symbolPosition === "LEFT" && (
                            <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">{currency.symbol}</span>
                          )}
                          <input type="text" inputMode="decimal" value={basePriceDraft ?? (storedPrice ? storedPrice.toFixed(decimals) : "")}
                            onFocus={() => { if (basePriceDraft === null) setBasePriceDraft(storedPrice > 0 ? storedPrice.toFixed(decimals) : ""); }}
                            onChange={e => {
                              const raw = e.target.value.replace(/[^\d.]/g, "");
                              setBasePriceDraft(raw);
                              const enteredValue = parseFloat(raw) || 0;
                              const newPrices: Record<string, number> = { ...priceByCurrency, [currency.code]: enteredValue };
                              currencies.forEach(c => { if (c.id !== currency.id) newPrices[c.code] = convertPriceNumber(enteredValue, currency, c, currencies); });
                              setPriceByCurrency(newPrices);
                              const baseValue = convertPriceNumber(enteredValue, currency, baseCurrency, currencies);
                              setVariations(prev => prev.map(v => ({ ...v, price: baseValue })));
                              const updatedVarPrices: Record<string, Record<string, number>> = {};
                              variations.forEach(v => {
                                const prices: Record<string, number> = {};
                                currencies.forEach(c => { prices[c.code] = convertPriceNumber(baseValue, baseCurrency!, c, currencies); });
                                updatedVarPrices[v.id] = prices;
                              });
                              setVariationPrices(prev => ({ ...prev, ...updatedVarPrices }));
                              markDirty();
                            }}
                            onBlur={() => setBasePriceDraft(null)}
                            placeholder="0.00"
                            className="flex-1 py-3 px-3 text-sm font-bold text-text-base outline-none bg-transparent min-w-0"
                          />
                          {currency.symbolPosition === "RIGHT" && (
                            <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">{currency.symbol}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                          {currency.symbolPosition === "LEFT" && (
                            <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-400 bg-neutral-100 border-r border-neutral-200">{currency.symbol}</span>
                          )}
                          <input type="text" readOnly value={storedPrice.toFixed(decimals)} className="flex-1 py-3 px-3 text-sm font-medium text-text-muted bg-transparent cursor-not-allowed min-w-0" />
                          {currency.symbolPosition === "RIGHT" && (
                            <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-400 bg-neutral-100 border-l border-neutral-200">{currency.symbol}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h3 className="text-p-b font-bold text-text-base">Variantes</h3>
                {variations.length > 0 && <span className="text-p-xs text-text-muted">{variations.length} variantes</span>}
              </div>
              <button onClick={addEmptyVariation} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Agregar variante
              </button>
              {variations.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                    <table className="text-left text-sm" style={{ tableLayout: "fixed", minWidth: "1400px", width: "100%" }}>
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="py-3 px-4" style={{ width: "48px" }}><input type="checkbox" checked={variations.length > 0 && variations.every(v => selectedVariationIds.has(v.id))} onChange={e => { if (e.target.checked) setSelectedVariationIds(new Set(variations.map(v => v.id))); else setSelectedVariationIds(new Set()); }} className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200" /></th>
                          <th className="py-3 px-4" style={{ width: "80px" }}>Img</th>
                          <th className="py-3 px-4" style={{ width: "240px" }}>Variante</th>
                          <th className="py-3 px-4" style={{ width: "200px" }}>SKU</th>
                          <th className="py-3 px-4" style={{ width: "144px" }}>Stk</th>
                          {currencies.map(currency => (
                            <th key={currency.id} className="py-3 px-4" style={{ minWidth: "200px" }}>
                              <span className="flex items-center gap-1.5 text-text-base">{currency.code}{currency.id === currencyId && <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[10px] font-bold">BASE</span>}</span>
                            </th>
                          ))}
                          <th className="py-3 px-4" style={{ width: "128px" }}>Alr</th>
                          <th className="py-3 px-4" style={{ width: "96px" }}>Act</th>
                          <th className="py-3 px-4" style={{ width: "56px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variations.map((variation, idx) => {
                          const mainImg = getMainImage(variation);
                          return (
                            <tr key={variation.id} className={`border-t border-neutral-100 hover:bg-neutral-100/50 transition-colors ${idx % 2 === 1 ? "bg-neutral-50" : ""}`}>
                              <td className="py-3 px-4" style={{ width: "48px" }}>
                                <input type="checkbox" checked={selectedVariationIds.has(variation.id)} onChange={e => { setSelectedVariationIds(prev => { const n = new Set(prev); if (e.target.checked) n.add(variation.id); else n.delete(variation.id); return n; }); }} className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200" />
                              </td>
                              <td className="py-3 px-4" style={{ width: "80px" }}>
                                {mainImg ? (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-100 group">
                                    <img src={mainImg.urlImage} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => { setImagePickerVariationIndex(idx); setImagePickerImageIndex(null); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><PencilIcon className="w-3 h-3" /></button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setImagePickerVariationIndex(idx); setImagePickerImageIndex(null); }} className="w-10 h-10 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-text-muted hover:border-brand-400 hover:text-brand-500 transition-colors"><PhotoIcon className="w-4 h-4" /></button>
                                )}
                              </td>
                              <td className="py-3 px-4" style={{ width: "240px" }}>
                                <div className="min-w-0">
                                  <button onClick={() => setEditingVariationIndex(idx)} className="flex items-center gap-2 hover:text-brand-500 transition-colors"><PencilIcon className="w-3 h-3 text-text-muted" /><span className="font-semibold text-text-base truncate">{variation.name || "Sin título"}</span></button>
                                  {variation.hexColor && <span className="inline-block w-3 h-3 rounded-full border border-neutral-200 ml-5 mt-1" style={{ backgroundColor: variation.hexColor }} />}
                                </div>
                              </td>
                              <td className="py-3 px-4" style={{ width: "200px" }}><input value={variation.sku} onChange={e => updateVariation(idx, "sku", e.target.value)} placeholder="SKU" className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                              <td className="py-3 px-4" style={{ width: "144px" }}><input type="number" min={0} value={variation.stock} onChange={e => updateVariation(idx, "stock", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                              {currencies.map(currency => {
                                const isBase = currency.id === currencyId;
                                const varPrices = variationPrices[variation.id] || {};
                                const displayedPrice = varPrices[currency.code] ?? convertPriceNumber(variation.price, baseCurrency, currency, currencies);
                                const decimals = currency.decimalPlaces ?? 2;
                                return (
                                  <td key={currency.id} className="py-3 px-4" style={{ minWidth: "200px" }}>
                                    {isBase ? (
                                      <div className="flex items-center rounded-lg border border-brand-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                                        {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">{currency.symbol}</span>}
                                        <input type="text" inputMode="decimal" value={varPriceDraft[variation.id] ?? (displayedPrice ? displayedPrice.toFixed(decimals) : "")}
                                          onFocus={() => { if (varPriceDraft[variation.id] === undefined) setVarPriceDraft(prev => ({ ...prev, [variation.id]: displayedPrice > 0 ? displayedPrice.toFixed(decimals) : "" })); }}
                                          onChange={e => { const raw = e.target.value.replace(/[^\d.]/g, ""); setVarPriceDraft(prev => ({ ...prev, [variation.id]: raw })); const enteredValue = parseFloat(raw) || 0; updateVariation(idx, "price", enteredValue); }}
                                          onBlur={() => { setVarPriceDraft(prev => { const next = { ...prev }; delete next[variation.id]; return next; }); }}
                                          placeholder="0.00" className="flex-1 py-1.5 px-1.5 text-xs font-semibold text-text-base outline-none bg-transparent min-w-0" />
                                        {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">{currency.symbol}</span>}
                                      </div>
                                    ) : (
                                      <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
                                        {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 border-r border-neutral-200">{currency.symbol}</span>}
                                        <span className="flex-1 py-1.5 px-1.5 text-xs font-medium text-text-muted min-w-0">{displayedPrice.toFixed(decimals)}</span>
                                        {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 border-l border-neutral-200">{currency.symbol}</span>}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-3 px-4" style={{ width: "128px" }}><input type="number" min={0} value={variation.alertQuantity ?? 5} onChange={e => updateVariation(idx, "alertQuantity", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                              <td className="py-3 px-4" style={{ width: "96px" }}>
                                <button onClick={() => updateVariation(idx, "isActive", !variation.isActive)} className={`relative w-9 h-5 rounded-full transition-colors ${variation.isActive ? "bg-success-500" : "bg-neutral-300"}`}>
                                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${variation.isActive ? "translate-x-4" : ""}`} />
                                </button>
                              </td>
                              <td className="py-3 px-4" style={{ width: "56px" }}>
                                <button onClick={() => removeVariation(idx)} className="p-1 rounded-lg hover:bg-danger-50 text-text-muted hover:text-danger-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {selectedVariationIds.size > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in">
                      <span className="text-sm font-medium text-text-base">{selectedVariationIds.size} seleccionadas</span>
                      <div className="w-px h-5 bg-brand-200" />
                      {bulkEditType === null ? (
                        <>
                          <button onClick={() => setBulkEditType("price")} className="text-sm font-medium text-brand-500 hover:text-brand-600">Editar Precios</button>
                          <button onClick={() => setBulkEditType("stock")} className="text-sm font-medium text-text-muted hover:text-text-base">Editar Stock</button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted">{bulkEditType === "price" ? "Precio" : "Stock"}:</span>
                          <input type="number" value={bulkEditValue} onChange={e => setBulkEditValue(e.target.value)} placeholder={bulkEditType === "price" ? "0.00" : "0"} className="w-28 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" autoFocus />
                          <button onClick={handleBulkEdit} className="px-3 py-1.5 rounded-lg bg-brand-400 text-white text-xs font-bold hover:bg-brand-500 transition-colors">Aplicar</button>
                          <button onClick={() => { setBulkEditType(null); setBulkEditValue(""); }} className="text-xs text-text-muted hover:text-text-base">Cancelar</button>
                        </div>
                      )}
                      <button onClick={() => { setSelectedVariationIds(new Set()); setBulkEditType(null); }} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            <button onClick={handleCancel} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">Cancelar</button>
            <Button onClick={handleSave} isLoading={saving} fullWidth={false}>{isEditing ? "Guardar cambios" : "Crear producto"}</Button>
          </div>
        </>
      ) : (
        <>
          {/* Stepper */}
          <Stepper steps={STEPS} currentStep={step} />

          {/* Step 1: Información Básica */}
          {step === 0 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className={cardClass}>
                <h3 className="text-p-b font-bold text-text-base">Información Básica</h3>
                <div><label className={labelClass}>Nombre</label><input value={name} onChange={e => { setName(e.target.value); markDirty(); }} placeholder="Ej: Labial Mate L'Oréal" className={inputClass} /></div>
                <div><label className={labelClass}>Slug</label><input value={slug} onChange={e => { setSlug(e.target.value); slugManuallyEdited.current = true; markDirty(); }} placeholder="url-amigable-del-producto" className={`${inputClass} text-text-muted`} /></div>
                <div><label className={labelClass}>Descripción</label><textarea value={description} onChange={e => { setDescription(e.target.value); markDirty(); }} rows={3} placeholder="Describe el producto..." className={`${inputClass} resize-none`} /></div>
                <div>
                  <label className={labelClass}>Marca</label>
                  <select value={brandId} onChange={e => { setBrandId(e.target.value); markDirty(); }} className={inputClass}>
                    <option value="">Seleccionar marca...</option>
                    {brands.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select value={categoryId} onChange={e => { setCategoryId(e.target.value); markDirty(); }} className={inputClass}>
                    <option value="">Seleccionar categoría...</option>
                    {categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className={labelClass}>Estado</label>
                    <p className="text-p-xs text-text-muted">{isActive ? "Visible en la tienda" : "Oculto"}</p>
                  </div>
                  <button onClick={() => { setIsActive(!isActive); markDirty(); }} className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-success-500" : "bg-neutral-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Precios y Variantes */}
          {step === 1 && (
            <div className="space-y-6">
              <div className={cardClass}>
                <h3 className="text-p-b font-bold text-text-base">Moneda y Precios</h3>
                <p className="text-p-xs text-text-muted mb-3">Selecciona la moneda base. Las demás se calculan automáticamente.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currencies.map(currency => (
                    <label key={currency.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="baseCurrency" value={currency.id} checked={currencyId === currency.id}
                        onChange={() => { setCurrencyId(currency.id); setBasePriceDraft(null); markDirty(); }} className="sr-only" />
                      <span className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${currencyId === currency.id ? "bg-brand-400 text-white border-brand-400" : "bg-white text-text-muted border-neutral-200 hover:border-brand-300"}`}>{currency.code}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currencies.map(currency => {
                    const isBase = currency.id === currencyId;
                    const storedPrice = priceByCurrency[currency.code] ?? 0;
                    const decimals = currency.decimalPlaces ?? 2;
                    return (
                      <div key={currency.id}>
                        <label className="text-p-xs font-bold text-text-muted mb-1 flex items-center gap-1.5">
                          <CurrencyDollarIcon className="w-3.5 h-3.5" />{currency.code}
                          {isBase && <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[9px] font-bold">BASE</span>}
                        </label>
                        {isBase ? (
                          <div className="flex items-center rounded-xl border-2 border-brand-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                            {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">{currency.symbol}</span>}
                            <input type="text" inputMode="decimal" value={basePriceDraft ?? (storedPrice ? storedPrice.toFixed(decimals) : "")}
                              onFocus={() => { if (basePriceDraft === null) setBasePriceDraft(storedPrice > 0 ? storedPrice.toFixed(decimals) : ""); }}
                              onChange={e => {
                                const raw = e.target.value.replace(/[^\d.]/g, ""); setBasePriceDraft(raw);
                                const enteredValue = parseFloat(raw) || 0;
                                const newPrices: Record<string, number> = { ...priceByCurrency, [currency.code]: enteredValue };
                                currencies.forEach(c => { if (c.id !== currency.id) newPrices[c.code] = convertPriceNumber(enteredValue, currency, c, currencies); });
                                setPriceByCurrency(newPrices);
                                const baseValue = convertPriceNumber(enteredValue, currency, baseCurrency, currencies);
                                setVariations(prev => prev.map(v => ({ ...v, price: baseValue })));
                                const updatedVarPrices: Record<string, Record<string, number>> = {};
                                variations.forEach(v => { const prices: Record<string, number> = {}; currencies.forEach(c => { prices[c.code] = convertPriceNumber(baseValue, baseCurrency!, c, currencies); }); updatedVarPrices[v.id] = prices; });
                                setVariationPrices(prev => ({ ...prev, ...updatedVarPrices }));
                                markDirty();
                              }}
                              onBlur={() => setBasePriceDraft(null)} placeholder="0.00" className="flex-1 py-3 px-3 text-sm font-bold text-text-base outline-none bg-transparent min-w-0" />
                            {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">{currency.symbol}</span>}
                          </div>
                        ) : (
                          <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                            {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-400 bg-neutral-100 border-r border-neutral-200">{currency.symbol}</span>}
                            <input type="text" readOnly value={storedPrice.toFixed(decimals)} className="flex-1 py-3 px-3 text-sm font-medium text-text-muted bg-transparent cursor-not-allowed min-w-0" />
                            {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-3 py-3 text-sm font-bold text-neutral-400 bg-neutral-100 border-l border-neutral-200">{currency.symbol}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={cardClass}>
                <div className="flex items-center justify-between">
                  <h3 className="text-p-b font-bold text-text-base">Variantes</h3>
                  {variations.length > 0 && <span className="text-p-xs text-text-muted">{variations.length} variantes</span>}
                </div>
                <button onClick={addEmptyVariation} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors"><PlusIcon className="w-4 h-4" /> Agregar variante</button>
                {variations.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                      <table className="text-left text-sm" style={{ tableLayout: "fixed", minWidth: "1400px", width: "100%" }}>
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="py-3 px-4" style={{ width: "48px" }}><input type="checkbox" checked={variations.length > 0 && variations.every(v => selectedVariationIds.has(v.id))} onChange={e => { if (e.target.checked) setSelectedVariationIds(new Set(variations.map(v => v.id))); else setSelectedVariationIds(new Set()); }} className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200" /></th>
                            <th className="py-3 px-4" style={{ width: "80px" }}>Img</th>
                            <th className="py-3 px-4" style={{ width: "240px" }}>Variante</th>
                            <th className="py-3 px-4" style={{ width: "200px" }}>SKU</th>
                            <th className="py-3 px-4" style={{ width: "144px" }}>Stk</th>
                            {currencies.map(currency => (
                              <th key={currency.id} className="py-3 px-4" style={{ minWidth: "200px" }}>
                                <span className="flex items-center gap-1.5 text-text-base">{currency.code}{currency.id === currencyId && <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[10px] font-bold">BASE</span>}</span>
                              </th>
                            ))}
                            <th className="py-3 px-4" style={{ width: "128px" }}>Alr</th>
                            <th className="py-3 px-4" style={{ width: "96px" }}>Act</th>
                            <th className="py-3 px-4" style={{ width: "56px" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {variations.map((variation, idx) => {
                            const mainImg = getMainImage(variation);
                            return (
                              <tr key={variation.id} className={`border-t border-neutral-100 hover:bg-neutral-100/50 transition-colors ${idx % 2 === 1 ? "bg-neutral-50" : ""}`}>
                                <td className="py-3 px-4" style={{ width: "48px" }}><input type="checkbox" checked={selectedVariationIds.has(variation.id)} onChange={e => { setSelectedVariationIds(prev => { const n = new Set(prev); if (e.target.checked) n.add(variation.id); else n.delete(variation.id); return n; }); }} className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200" /></td>
                                <td className="py-3 px-4" style={{ width: "80px" }}>
                                  {mainImg ? (
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-100 group">
                                      <img src={mainImg.urlImage} alt="" className="w-full h-full object-cover" />
                                      <button onClick={() => { setImagePickerVariationIndex(idx); setImagePickerImageIndex(null); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><PencilIcon className="w-3 h-3" /></button>
                                    </div>
                                  ) : (
                                    <button onClick={() => { setImagePickerVariationIndex(idx); setImagePickerImageIndex(null); }} className="w-10 h-10 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-text-muted hover:border-brand-400 hover:text-brand-500 transition-colors"><PhotoIcon className="w-4 h-4" /></button>
                                  )}
                                </td>
                                <td className="py-3 px-4" style={{ width: "240px" }}>
                                  <div className="min-w-0">
                                    <button onClick={() => setEditingVariationIndex(idx)} className="flex items-center gap-2 hover:text-brand-500 transition-colors"><PencilIcon className="w-3 h-3 text-text-muted" /><span className="font-semibold text-text-base truncate">{variation.name || "Sin título"}</span></button>
                                    {variation.hexColor && <span className="inline-block w-3 h-3 rounded-full border border-neutral-200 ml-5 mt-1" style={{ backgroundColor: variation.hexColor }} />}
                                  </div>
                                </td>
                                <td className="py-3 px-4" style={{ width: "200px" }}><input value={variation.sku} onChange={e => updateVariation(idx, "sku", e.target.value)} placeholder="SKU" className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                                <td className="py-3 px-4" style={{ width: "144px" }}><input type="number" min={0} value={variation.stock} onChange={e => updateVariation(idx, "stock", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                                {currencies.map(currency => {
                                  const isBase = currency.id === currencyId;
                                  const varPrices = variationPrices[variation.id] || {};
                                  const displayedPrice = varPrices[currency.code] ?? convertPriceNumber(variation.price, baseCurrency, currency, currencies);
                                  const decimals = currency.decimalPlaces ?? 2;
                                  return (
                                    <td key={currency.id} className="py-3 px-4" style={{ minWidth: "200px" }}>
                                      {isBase ? (
                                        <div className="flex items-center rounded-lg border border-brand-300 bg-white focus-within:ring-2 focus-within:ring-brand-200 overflow-hidden">
                                          {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200">{currency.symbol}</span>}
                                          <input type="text" inputMode="decimal" value={varPriceDraft[variation.id] ?? (displayedPrice ? displayedPrice.toFixed(decimals) : "")}
                                            onFocus={() => { if (varPriceDraft[variation.id] === undefined) setVarPriceDraft(prev => ({ ...prev, [variation.id]: displayedPrice > 0 ? displayedPrice.toFixed(decimals) : "" })); }}
                                            onChange={e => { const raw = e.target.value.replace(/[^\d.]/g, ""); setVarPriceDraft(prev => ({ ...prev, [variation.id]: raw })); const enteredValue = parseFloat(raw) || 0; updateVariation(idx, "price", enteredValue); }}
                                            onBlur={() => { setVarPriceDraft(prev => { const next = { ...prev }; delete next[variation.id]; return next; }); }} placeholder="0.00" className="flex-1 py-1.5 px-1.5 text-xs font-semibold text-text-base outline-none bg-transparent min-w-0" />
                                          {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-50 border-l border-neutral-200">{currency.symbol}</span>}
                                        </div>
                                      ) : (
                                        <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
                                          {currency.symbolPosition === "LEFT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 border-r border-neutral-200">{currency.symbol}</span>}
                                          <span className="flex-1 py-1.5 px-1.5 text-xs font-medium text-text-muted min-w-0">{displayedPrice.toFixed(decimals)}</span>
                                          {currency.symbolPosition === "RIGHT" && <span className="shrink-0 px-1.5 py-1.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 border-l border-neutral-200">{currency.symbol}</span>}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="py-3 px-4" style={{ width: "128px" }}><input type="number" min={0} value={variation.alertQuantity ?? 5} onChange={e => updateVariation(idx, "alertQuantity", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" /></td>
                                <td className="py-3 px-4" style={{ width: "96px" }}>
                                  <button onClick={() => updateVariation(idx, "isActive", !variation.isActive)} className={`relative w-9 h-5 rounded-full transition-colors ${variation.isActive ? "bg-success-500" : "bg-neutral-300"}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${variation.isActive ? "translate-x-4" : ""}`} />
                                  </button>
                                </td>
                                <td className="py-3 px-4" style={{ width: "56px" }}>
                                  <button onClick={() => removeVariation(idx)} className="p-1 rounded-lg hover:bg-danger-50 text-text-muted hover:text-danger-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {selectedVariationIds.size > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl border border-brand-100 animate-fade-in">
                        <span className="text-sm font-medium text-text-base">{selectedVariationIds.size} seleccionadas</span>
                        <div className="w-px h-5 bg-brand-200" />
                        {bulkEditType === null ? (
                          <>
                            <button onClick={() => setBulkEditType("price")} className="text-sm font-medium text-brand-500 hover:text-brand-600">Editar Precios</button>
                            <button onClick={() => setBulkEditType("stock")} className="text-sm font-medium text-text-muted hover:text-text-base">Editar Stock</button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted">{bulkEditType === "price" ? "Precio" : "Stock"}:</span>
                            <input type="number" value={bulkEditValue} onChange={e => setBulkEditValue(e.target.value)} placeholder={bulkEditType === "price" ? "0.00" : "0"} className="w-28 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-brand-200" autoFocus />
                            <button onClick={handleBulkEdit} className="px-3 py-1.5 rounded-lg bg-brand-400 text-white text-xs font-bold hover:bg-brand-500 transition-colors">Aplicar</button>
                            <button onClick={() => { setBulkEditType(null); setBulkEditValue(""); }} className="text-xs text-text-muted hover:text-text-base">Cancelar</button>
                          </div>
                        )}
                        <button onClick={() => { setSelectedVariationIds(new Set()); setBulkEditType(null); }} className="ml-auto text-sm text-text-muted hover:text-text-base">Limpiar</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Revisar y Guardar */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className={cardClass}>
                <h3 className="text-p-b font-bold text-text-base flex items-center gap-2"><CheckIcon className="w-5 h-5 text-success-500" /> Información del producto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-p-xs text-text-muted">Nombre</p><p className="text-sm font-semibold text-text-base">{name}</p></div>
                  <div><p className="text-p-xs text-text-muted">Slug</p><p className="text-sm font-semibold text-text-base">{slug}</p></div>
                  <div><p className="text-p-xs text-text-muted">Marca</p><p className="text-sm font-semibold text-text-base">{brands.find(b => b.id === brandId)?.name || "—"}</p></div>
                  <div><p className="text-p-xs text-text-muted">Categoría</p><p className="text-sm font-semibold text-text-base">{categories.find(c => c.id === categoryId)?.name || "—"}</p></div>
                  <div>
                    <p className="text-p-xs text-text-muted">Estado</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-p-xs font-bold ${isActive ? "bg-success-500/10 text-success-500" : "bg-neutral-100 text-text-muted"}`}>{isActive ? "Activo" : "Inactivo"}</span>
                  </div>
                </div>
              </div>
              <div className={cardClass}>
                <h3 className="text-p-b font-bold text-text-base flex items-center gap-2"><CurrencyDollarIcon className="w-5 h-5 text-brand-400" /> Precios</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currencies.map(currency => {
                    const storedPrice = priceByCurrency[currency.code] ?? 0;
                    const decimals = currency.decimalPlaces ?? 2;
                    return (
                      <div key={currency.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                        <p className="text-p-xs text-text-muted flex items-center gap-1">{currency.code}{currency.id === currencyId && <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-600 text-[9px] font-bold">BASE</span>}</p>
                        <p className="text-lg font-bold text-text-base mt-1">{currency.symbol}{storedPrice.toFixed(decimals)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={cardClass}>
                <h3 className="text-p-b font-bold text-text-base">Variantes ({variations.length})</h3>
                <div className="space-y-3">
                  {variations.map((v, idx) => {
                    const mainImg = getMainImage(v);
                    const baseVarPrice = variationPrices[v.id]?.[baseCurrency?.code ?? ""] ?? v.price;
                    const decimals = baseCurrency?.decimalPlaces ?? 2;
                    return (
                      <div key={v.id} className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                        {mainImg ? <img src={mainImg.urlImage} alt="" className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shrink-0" /> : <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-text-muted shrink-0"><PhotoIcon className="w-5 h-5" /></div>}
                        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div><p className="text-p-xs text-text-muted">Nombre</p><p className="text-sm font-semibold text-text-base truncate">{v.name || "Sin título"}</p></div>
                          <div><p className="text-p-xs text-text-muted">SKU</p><p className="text-sm font-medium text-text-base">{v.sku || "—"}</p></div>
                          <div><p className="text-p-xs text-text-muted">Stock</p><p className="text-sm font-medium text-text-base">{v.stock}</p></div>
                          <div><p className="text-p-xs text-text-muted">Precio base</p><p className="text-sm font-bold text-text-base">{baseCurrency?.symbol}{baseVarPrice.toFixed(decimals)}</p></div>
                        </div>
                        {v.attributeName && v.attributeValue && <div className="shrink-0 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-100 text-p-xs font-medium text-brand-600">{v.attributeName}: {v.attributeValue}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            <div>
              {step > 0 ? (
                <button onClick={handleBack} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">← Anterior</button>
              ) : (
                <button onClick={handleCancel} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-text-base font-medium text-sm hover:bg-neutral-50 transition-colors">Cancelar</button>
              )}
            </div>
            <div>
              {step < STEPS.length - 1 ? (
                <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-brand-400 text-white font-bold text-sm hover:bg-brand-500 transition-colors flex items-center gap-2">Siguiente →</button>
              ) : (
                <Button onClick={handleSave} isLoading={saving} fullWidth={false}>Crear producto</Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Variation Edit Modal */}
      {editingVariationIndex !== null && variations[editingVariationIndex] && (
        <Modal
          isOpen={editingVariationIndex !== null}
          onClose={() => setEditingVariationIndex(null)}
          title={`Editar variante: ${variations[editingVariationIndex].name || "Sin título"}`}
          maxWidth="2xl"
        >
          <div className="p-6 space-y-5">
            {(() => {
              const v = variations[editingVariationIndex];
              return (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-text-muted mb-1.5">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      Título
                    </label>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!useDefaultTitleMap[v.id]}
                        onChange={e => {
                          const checked = e.target.checked;
                          setUseDefaultTitleMap(prev => ({ ...prev, [v.id]: checked }));
                          if (checked) updateVariationField("name", name);
                        }}
                        className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200"
                      />
                      <span className="text-xs text-text-muted">Usar nombre del producto</span>
                    </label>
                    <input
                      value={useDefaultTitleMap[v.id] ? name : v.name}
                      onChange={e => {
                        setUseDefaultTitleMap(prev => ({ ...prev, [v.id]: false }));
                        updateVariationField("name", e.target.value);
                      }}
                      placeholder="Ej: Rojo Intenso - Edición Limitada"
                      disabled={!!useDefaultTitleMap[v.id]}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white disabled:bg-neutral-50 disabled:text-text-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-text-muted mb-1.5 block">Tipo de atributo</label>
                      <select
                        value={v.attributeName || "Otro"}
                        onChange={e => updateVariationField("attributeName", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                      >
                        {ATTRIBUTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-text-muted mb-1.5 block">Valor</label>
                      <input
                        value={v.attributeValue || ""}
                        onChange={e => updateVariationField("attributeValue", e.target.value)}
                        placeholder="Ej: Rojo, S, 50ml..."
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                      />
                    </div>
                  </div>

                  {v.attributeName === "Color" && (
                    <div>
                      <label className="text-sm font-bold text-text-muted mb-1.5 block">Color (hex)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={v.hexColor || "#cccccc"}
                          onChange={e => updateVariationField("hexColor", e.target.value)}
                          className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                        />
                        <input
                          value={v.hexColor || ""}
                          onChange={e => updateVariationField("hexColor", e.target.value)}
                          placeholder="#RRGGBB"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-text-muted mb-1.5">
                      <DocumentTextIcon className="w-4 h-4" />
                      Descripción
                    </label>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!useDefaultDescMap[v.id]}
                        onChange={e => {
                          const checked = e.target.checked;
                          setUseDefaultDescMap(prev => ({ ...prev, [v.id]: checked }));
                          if (checked) updateVariationField("description", description);
                        }}
                        className="rounded border-neutral-300 text-brand-400 focus:ring-brand-200"
                      />
                      <span className="text-xs text-text-muted">Usar descripción del producto</span>
                    </label>
                    <textarea
                      value={useDefaultDescMap[v.id] ? description : v.description || ""}
                      onChange={e => {
                        setUseDefaultDescMap(prev => ({ ...prev, [v.id]: false }));
                        updateVariationField("description", e.target.value);
                      }}
                      placeholder="Describe esta variante..."
                      rows={3}
                      disabled={!!useDefaultDescMap[v.id]}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-brand-200 bg-white resize-none disabled:bg-neutral-50 disabled:text-text-muted"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-text-muted mb-2 block">Imágenes</label>
                    <div className="flex flex-wrap gap-3">
                      {v.images.map((img, imgIdx) => (
                        <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                          <img src={img.urlImage} alt="" className="w-full h-full object-cover" />
                          {img.isMain && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-500 text-white text-[9px] font-bold">Principal</span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {!img.isMain && (
                              <button
                                onClick={() => {
                                  updateVariationField("images", v.images.map((vImg, vi) =>
                                    vi === imgIdx ? { ...vImg, isMain: true } : { ...vImg, isMain: false }
                                  ));
                                }}
                                className="w-6 h-6 rounded bg-white/80 flex items-center justify-center text-text-muted hover:text-brand-500"
                                title="Marcar como principal"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                updateVariationField("images", v.images.filter((_, i) => i !== imgIdx));
                              }}
                              className="w-6 h-6 rounded bg-white/80 flex items-center justify-center text-text-muted hover:text-danger-500"
                              title="Eliminar imagen"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => { setImagePickerVariationIndex(editingVariationIndex); setImagePickerImageIndex(null); }}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-text-muted hover:border-brand-400 hover:text-brand-500 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span className="text-[10px] mt-1">Agregar</span>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      {/* Image Picker Modal */}
      {imagePickerVariationIndex !== null && (
        <ImagePickerModal
          isOpen={imagePickerVariationIndex !== null}
          onClose={() => { setImagePickerVariationIndex(null); setImagePickerImageIndex(null); }}
          currentUrl={
            imagePickerImageIndex !== null
              ? variations[imagePickerVariationIndex]?.images[imagePickerImageIndex]?.urlImage || ""
              : ""
          }
          onSave={url => {
            const variation = variations[imagePickerVariationIndex];
            if (imagePickerImageIndex !== null) {
              const updatedImages = variation.images.map((img, i) =>
                i === imagePickerImageIndex ? { ...img, urlImage: url } : img
              );
              updateVariation(imagePickerVariationIndex, "images", updatedImages);
            } else {
              const newImage: ProductImage = {
                id: crypto.randomUUID(),
                urlImage: url,
                order: variation.images.length,
                altText: variation.name,
                isMain: variation.images.length === 0,
              };
              updateVariation(imagePickerVariationIndex, "images", [...variation.images, newImage]);
            }
            markDirty();
          }}
        />
      )}
    </div>
  );
};

export default ProductForm;
