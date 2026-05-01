import { useEffect, useState } from "react";
import { productService, type Product } from "../../services/productService";
import ProductCarousel from "../ui/ProductCarousel";

import Skeleton from 'react-loading-skeleton';

const NewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNewProducts = async () => {
      setLoading(true);
      try {
        // Obtenemos los primeros 8 productos como "Nuevos"
        const response = await productService.getAllProducts(0, 8);
        if (response && Array.isArray(response.content)) {
          setProducts(response.content);
        }
      } catch (err) {
        console.error("Error al cargar nuevos productos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  if (loading && products.length === 0) {
    return (
      <section className="w-full py-4 md:py-16 bg-surface">
        <div className="max-w-[95%] mx-auto  relative">
          <div className="flex justify-center mb-4 md:mb-16">
            <Skeleton height={40} width={300} borderRadius={8} />
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

  if (products.length === 0 || error) return null;

  return (
    <section className="w-full py-4 md:py-16 bg-surface">
      <div className="max-w-[95%] mx-auto relative">
        {/* Título de la sección */}
        <h2 className="text-center text-h2-s md:text-h2-b font-bold mb-4 md:mb-16 text-text-base">
          Nuestros Nuevos Productos
        </h2>

        {/* Carrusel Unificado */}
        <ProductCarousel
          products={products}
          id="new-products"
          autoplayDelay={4000}
        />
      </div>
    </section>
  );
};

export default NewProducts;
