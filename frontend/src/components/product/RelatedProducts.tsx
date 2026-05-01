import { useEffect, useState } from "react";
import { productService, type Product } from "../../services/productService";
import ProductCarousel from "../ui/ProductCarousel";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

import Skeleton from 'react-loading-skeleton';

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await productService.getAllProducts(0, 8);
        const allProducts = Array.isArray(response) ? response : response.content;

        // Filtrar el producto actual y (idealmente) por categoria si el API lo soportara
        const filtered = allProducts
          .filter(p => p.category?.id === categoryId && p.id !== currentProductId);

        // Si no hay suficientes de la misma categoría, simplemente mostramos otros productos
        if (filtered.length < 5) {
          const others = allProducts
            .filter(p => p.id !== currentProductId && p.category?.id !== categoryId)
            .slice(0, 10);
          setProducts([...filtered, ...others]);
        } else {
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <section className="py-4 md:py-16 border-t border-gray-100 mt-10 md:mt-20">
        <div className="max-w-[95%] mx-auto relative px-4 overflow-hidden">
          <div className="flex justify-center mb-8 md:mb-12">
            <Skeleton height={32} width={250} borderRadius={8} />
          </div>
          <div className="flex gap-4 overflow-hidden justify-center md:justify-start">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[160px] w-[160px] md:min-w-[280px] md:w-[280px] h-[400px]">
                <Skeleton height={400} borderRadius={24} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="pt-4 md:pt-8 border-t border-gray-100 ">
      <div className="max-w-[95%] mx-auto relative px-4">
        <h3 className="text-h3-s md:text-h3-b font-bold mb-8 md:mb-12 text-center text-neutral-800">
          También te puede interesar
        </h3>

        {/* Carrusel Unificado */}
        <ProductCarousel
          products={products}
          id="related-products"
          autoplayDelay={3500}
        />
      </div>
    </section>
  );
};

export default RelatedProducts;
