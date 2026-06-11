import { useEffect, useState } from "react";
import { productService, type Product } from "../../services/productService";
import ProductCarousel from "../ui/ProductCarousel";
import Skeleton from 'react-loading-skeleton';
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const NewProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (!isVisible || products.length > 0) return;

    const fetchNewProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getNewProducts(0, 10);
        const newProductsData = response.content;
        if (newProductsData && newProductsData.length > 0) {
          setProducts(newProductsData);
        }
      } catch (err) {
        console.error("Error al cargar nuevos productos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, [isVisible, products.length]);

  if (error) return null;

  return (
    <div ref={sectionRef} className="w-full">
      {loading && products.length === 0 ? (
        <section className="w-full py-4 md:py-16 bg-surface">
          <div className="max-w-[95%] mx-auto relative">
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
      ) : products.length > 0 ? (
        <section className="w-full py-4 md:py-16 bg-surface animate-fade-in">
          <div className="max-w-[95%] mx-auto relative">
            <h2 className="text-center text-h2-s md:text-h2-b font-bold mb-4 md:mb-16 text-text-base">
              Nuestros Nuevos Productos
            </h2>
            <ProductCarousel
              products={products}
              id="new-products"
              autoplayDelay={4000}
            />
          </div>
        </section>
      ) : (
        <div className="h-96 md:h-[500px]" />
      )}
    </div>
  );
};

export default NewProducts;
