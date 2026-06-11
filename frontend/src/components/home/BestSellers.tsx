import { useEffect, useState } from "react";
import { productService, type Product } from "../../services/productService";
import ProductCarousel from "../ui/ProductCarousel";
import Skeleton from 'react-loading-skeleton';
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState("Nuestros Productos Más Vendidos");
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (!isVisible || products.length > 0) return;

    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const response = await productService.getBestSellers(0, 10);
        const bestSellerProducts = response.content;
        if (bestSellerProducts && bestSellerProducts.length > 0) {
          setProducts(bestSellerProducts);
        } else {
          const allResponse = await productService.getAllProducts(0, 20);
          const allProducts = Array.isArray(allResponse) ? allResponse : allResponse.content;
          if (allProducts && allProducts.length > 0) {
            const shuffled = [...allProducts].sort(() => Math.random() - 0.5).slice(0, 10);
            setProducts(shuffled);
            setTitle("Explora Nuestros Productos");
          }
        }
      } catch (err) {
        console.error("Error al cargar más vendidos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [isVisible, products.length]);

  if (error) return null;

  return (
    <div ref={sectionRef} className="w-full">
      {loading && products.length === 0 ? (
        <section className="w-full py-4 md:py-16 bg-white overflow-hidden">
          <div className="max-w-[95%] mx-auto relative px-4">
            <div className="flex justify-center mb-16">
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
        <section className="w-full py-4 md:py-16 bg-neutral-100 overflow-hidden animate-fade-in">
          <div className="max-w-[95%] mx-auto relative px-4">
            <h2 className="text-center text-h2-s md:text-h2-b font-bold mb-4 md:mb-16 text-text-base">
              {title}
            </h2>
            <ProductCarousel
              products={products}
              id="best-sellers"
              autoplayDelay={5000}
            />
          </div>
        </section>
      ) : (
        <div className="h-96 md:h-[600px]" />
      )}
    </div>
  );
};

export default BestSellers;
