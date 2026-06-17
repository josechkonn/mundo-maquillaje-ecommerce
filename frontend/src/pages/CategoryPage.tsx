import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { categoryService, type Category } from "../services/categoryService";
import { productService, type Product } from "../services/productService";
import CategoryBanner from "../components/category/CategoryBanner";
import CategorySection from "../components/home/CategorySection";
import ProductCarousel from "../components/ui/ProductCarousel";

interface ProductSection {
  title: string;
  products: Product[];
}

const CategoryPage = () => {
  const params = useParams();
  const splat = params["*"];
  const [category, setCategory] = useState<Category | null>(null);
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setProductsLoading(true);
      setSections([]); // Limpiar secciones anteriores para evitar datos residuales

      const parts = splat ? splat.split("/").filter(p => p) : [];
      const targetSlug = parts[parts.length - 1];

      if (!targetSlug) {
        setLoading(false);
        return;
      }

      try {
        // 1. Obtener la categoría directamente por su slug (Lógica en BD)
        const found = await categoryService.getCategoryBySlug(targetSlug);

        if (found) {
          setCategory(found);
          setLoading(false);

          // 2. Obtener solo las subcategorías de esta categoría (Lógica en BD)
          const subcategories = await categoryService.getAllCategories(found.id, true);

          // 3. Cargar productos por subcategoría (Lógica en BD)
          const sectionPromises = subcategories.slice(0, 4).map(async (sub) => {
            try {
              const res = await productService.getAllProducts(0, 12, sub.id);
              const products = Array.isArray(res) ? res : res.content;
              if (products && products.length > 0) {
                return { title: sub.name, products };
              }
              return null;
            } catch { return null; }
          });

          const results = await Promise.all(sectionPromises);
          const activeSections = results.filter((s): s is ProductSection => s !== null);

          let finalSections = activeSections.slice(0, 2);

          // 4. Fallback: Si no hay productos en subcategorías, cargar productos generales de la categoría madre
          if (finalSections.length === 0) {
            const mainRes = await productService.getAllProducts(0, 15, found.id);
            const mainProducts = Array.isArray(mainRes) ? mainRes : mainRes.content;
            if (mainProducts.length > 0) {
              finalSections.push({
                title: `Productos de ${found.name}`,
                products: mainProducts
              });
            }
          }

          setSections(finalSections);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading category:", error);
        setLoading(false);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchCategoryData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [splat]);

  // --- RENDERS DE CARGA (SKELETONS) ---

  const renderSkeletons = () => (
    <div className="w-full space-y-24">
      {[1, 2].map((i) => (
        <div key={i} className="max-w-[95%] mx-auto px-4">
          <div className="flex justify-center mb-12">
            <Skeleton width={300} height={40} borderRadius={8} />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="min-w-[280px] space-y-4">
                <Skeleton height={350} borderRadius={24} />
                <Skeleton width="80%" height={20} />
                <Skeleton width="40%" height={20} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white">
        <Skeleton height="50vh" />
        <div className="py-12 max-w-[90%] mx-auto flex justify-center gap-10">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} circle width={120} height={120} />)}
        </div>
        {renderSkeletons()}
      </div>
    );
  }

  if (!category) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-neutral-100 animate-fade-in">
      {/* Banner de la Categoría */}
      <CategoryBanner name={category.name} bannerUrl={category.bannerUrl} />

      {/* Breadcrumb */}
      <div className="bg-neutral-100 border-b border-neutral-200">
        <div className="max-w-[95%] mx-auto px-4 py-3 flex items-center gap-1.5 text-[13px] flex-wrap">
          <Link to="/" className="text-brand-400 hover:text-brand-500 transition-colors font-medium">Inicio</Link>

          {/* Padres Dinámicos */}
          {(() => {
            const parents: Category[] = [];
            let current = category.parent;
            while (current) {
              parents.unshift(current);
              current = current.parent;
            }
            return parents.map(parent => (
              <div key={parent.id} className="flex items-center gap-1.5">
                <span className="text-neutral-400">/</span>
                <Link
                  to={`/productos?category=${parent.id}`}
                  className="text-brand-400 hover:text-brand-500 transition-colors font-medium"
                >
                  {parent.name}
                </Link>
              </div>
            ));
          })()}

          <span className="text-neutral-400">/</span>
          <span className="text-text-base font-semibold">{category.name}</span>
        </div>
      </div>

      {/* Subcategorías (Burbujas) */}
      <CategorySection parentId={category.id} title="Sub Categorías" />

      {/* Sub-banner opcional */}
      {category.subBannerUrl && (
        <section className="w-full overflow-hidden ">
          <img
            src={category.subBannerUrl}
            alt="Promoción"
            className="w-full h-auto object-cover"
          />
        </section>
      )}

      {/* Secciones de Productos con Lazy Loading UI */}
      <div className="w-full py-4 md:py-16 space-y-16 md:space-y-24 bg-neutral-50 overflow-hidden">
        {productsLoading ? (
          renderSkeletons()
        ) : sections.length > 0 ? (
          sections.map((section, idx) => (
            <section key={`${section.title}-${idx}`} className="w-full">
              <div className="max-w-[95%] mx-auto relative px-4">
                <h2 className="text-center text-h2-s md:text-h2-b font-bold mb-4 md:mb-16 text-text-base tracking-tight">
                  {section.title}
                </h2>
                <ProductCarousel
                  products={section.products}
                  id={`cat-section-${idx}`}
                  autoplayDelay={5000 + (idx * 1000)}
                />
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20 text-neutral-400 font-medium">
            Próximamente tendremos productos disponibles en esta sección.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
