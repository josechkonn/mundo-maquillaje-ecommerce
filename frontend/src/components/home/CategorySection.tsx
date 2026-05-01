import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryService, type Category } from "../../services/categoryService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface CategorySectionProps {
  parentId?: string;
  title?: string;
}

const CategorySection = ({ parentId, title = "Nuestras Categorías" }: CategorySectionProps) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    // Si ya cargamos o no es visible (en Home), no hacemos nada
    if (!parentId && !isVisible) return;
    if (allCategories.length > 0) return;

    let isMounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      setError(false);
      try {
        // Cargamos todas las categorías activas para poder calcular la jerarquía
        const data = await categoryService.getAllCategories(undefined, true, false);

        if (isMounted) {
          setAllCategories(data);
          setHasFetched(true);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        if (isMounted) {
          setError(true);
          setHasFetched(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, [parentId, isVisible, allCategories.length]);

  // Filtrar las categorías que vamos a mostrar (las que son hijas del parentId actual)
  const displayCategories = parentId
    ? allCategories.filter(c => c.parent?.id === parentId)
    : allCategories.filter(c => !c.parent).slice(0, 8);

  if (error) return null;
  if (hasFetched && displayCategories.length === 0) return null;

  const renderCategory = (category: Category) => {
    // Lógica simplificada y directa:
    // 1. Si la categoría tiene padre (es subcategoría), va DIRECTO a productos.
    // 2. Si no tiene padre (es principal), va a la página de banners/carruseles.
    const targetPath = category.parent
      ? `/productos?category=${category.id}`
      : categoryService.getCategoryPath(category);

    return (
      <Link
        to={targetPath}
        key={category.id}
        className="flex flex-col items-center group transition-transform duration-300 hover:scale-105"
      >
        <div className="relative w-20 h-20 md:w-40 md:h-40 flex items-center justify-center mt-2">
          <div className="absolute inset-0 rounded-full border-[8px] md:border-[24px] border-[#EB6283] group-hover:border-[#E7446B] transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:shadow-sm opacity-90" />
          <img
            src={category.logoUrl || "/placeholder-category.png"}
            alt={category.name}
            className="relative z-10 w-[110%] h-[110%] object-contain transform transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <h4 className="mt-4 md:mt-8 text-p-xs md:text-h4-b font-bold md:font-semibold text-[#222222] group-hover:text-[#E7446B] transition-colors text-center w-full max-w-[120px] md:max-w-none leading-tight">
          {category.name}
        </h4>
      </Link>
    );
  };

  return (
    <div ref={sectionRef} className="w-full">
      {loading && allCategories.length === 0 ? (
        <div className="w-full max-w-[90%] mx-auto py-12 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 mx-auto mb-10 rounded"></div>
          <div className="flex justify-around">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-20 bg-gray-200 mt-4 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <section className="w-full py-8 md:py-16 animate-fade-in bg-neutral-100 overflow-hidden">
          <div className="w-full max-w-[95%] md:max-w-[95%] mx-auto relative">
            <h2 className="text-center text-h2-s md:text-h2-b text-[#222222] mb-8 md:mb-20 font-bold tracking-tight">
              {title}
            </h2>
            <div className="relative px-10 ">
              <Swiper
                modules={[Navigation]}
                spaceBetween={15}
                slidesPerView={3}
                loop={displayCategories.length > 6}
                centerInsufficientSlides={true}
                navigation={{
                  prevEl: '.cat-nav-prev',
                  nextEl: '.cat-nav-next',
                }}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 30 },
                  1024: { slidesPerView: 5, spaceBetween: 40 },
                  1440: { slidesPerView: 6, spaceBetween: 50 }
                }}
                className="!px-2"
              >
                {displayCategories.map((category) => (
                  <SwiperSlide key={category.id} className="flex justify-center">
                    {renderCategory(category)}
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className="cat-nav-prev absolute left-1 md:left-6 top-[45%] -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 bg-[#EA4C73] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-[#d43d63] hover:scale-110 active:scale-95">
                <ChevronLeftIcon className="w-5 h-5 stroke-[3px]" />
              </button>
              <button className="cat-nav-next absolute right-1 md:right-6 top-[45%] -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 bg-[#EA4C73] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-[#d43d63] hover:scale-110 active:scale-95">
                <ChevronRightIcon className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CategorySection;
