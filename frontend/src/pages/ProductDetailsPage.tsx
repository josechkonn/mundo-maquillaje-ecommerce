import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService, type Product, type ProductVariation } from "../services/productService";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import RelatedProducts from "../components/product/RelatedProducts";

import Skeleton from 'react-loading-skeleton';

const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [hoveredVariation, setHoveredVariation] = useState<ProductVariation | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await productService.getProductBySlug(slug);
        setProduct(data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const handleVariationChange = (variation: ProductVariation) => {
    setSelectedVariation(variation);
  };

  // Pre-seleccionar la primera variación tan pronto como el producto cargue
  useEffect(() => {
    if (product && product.variations?.length > 0 && !selectedVariation) {
      setSelectedVariation(product.variations[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="w-[90%] mx-auto py-8 pb-20">
        <div className="mb-6">
          <Skeleton width={300} height={20} borderRadius={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <Skeleton height={500} borderRadius={24} />
            <div className="flex gap-4 mt-6">
              <Skeleton width={80} height={80} borderRadius={12} />
              <Skeleton width={80} height={80} borderRadius={12} />
              <Skeleton width={80} height={80} borderRadius={12} />
              <Skeleton width={80} height={80} borderRadius={12} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton width={150} height={24} borderRadius={4} />
            <Skeleton width="80%" height={40} borderRadius={8} />
            <Skeleton width={120} height={32} borderRadius={6} />
            <div className="mt-4">
              <Skeleton count={3} height={16} width="100%" className="mb-2" />
              <Skeleton height={16} width="60%" />
            </div>
            <div className="mt-6">
              <Skeleton width={100} height={20} className="mb-4" />
              <div className="flex gap-4">
                <Skeleton width={40} height={40} circle />
                <Skeleton width={40} height={40} circle />
                <Skeleton width={40} height={40} circle />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <Skeleton width={120} height={50} borderRadius={24} />
              <Skeleton width={200} height={50} borderRadius={24} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const breadcrumbItems = [
    { label: product.category?.name || "Categoría", path: `/productos/categoria/${product.category?.id}` },
    { label: product.name }
  ];

  // Imágenes de la variante seleccionada
  const displayImages = selectedVariation?.images ?? [];

  // Imagen de preview al hacer hover sobre una variante (solo la principal de esa variante)
  const previewImageUrl = hoveredVariation?.images?.find(img => img.isMain)?.urlImage
    || hoveredVariation?.images?.[0]?.urlImage
    || null;

  return (
    <div className="animate-fade-in pb-20">
      <div className="w-[90%] mx-auto py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Columna Izquierda: Galería */}
          <ProductGallery 
            key={selectedVariation?.id ?? "no-variation"}
            images={displayImages}
            previewImageUrl={previewImageUrl}
          />

          {/* Columna Derecha: Información y Compra */}
          <ProductInfo 
            product={product} 
            onVariationChange={handleVariationChange}
            onHoverVariation={setHoveredVariation}
          />
        </div>

        {/* Sección de Productos Relacionados */}
        <div className="mt-20">
          <RelatedProducts 
            categoryId={product.category?.id} 
            currentProductId={product.id} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
