import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryService, type Category } from "../../services/categoryService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await categoryService.getAllCategories();
        if (isMounted) {
          const mainCategories = data
            .filter(cat => cat.isActive && cat.logoUrl)
            .slice(0, 5);
          setCategories(mainCategories);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
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
    );
  }

  if (categories.length === 0 || error) return null;

  const renderCategory = (category: Category) => (
    <Link
      to={`/category/${category.slug}`}
      className="flex flex-col items-center group transition-transform duration-300 hover:scale-105"
    >
      {/* Contenedor con efecto de Salida (Pop-out) - Aún más pequeño en móvil */}
      <div className="relative w-20 h-20 md:w-40 md:h-40 flex items-center justify-center mt-2">
        {/* Círculo de Fondo (El anillo) */}
        <div className="absolute inset-0 rounded-full border-[8px] md:border-[24px] border-[#EB6283] group-hover:border-[#E7446B] transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:shadow-sm opacity-90" />

        {/* Imagen que sobresale */}
        <img
          src={category.logoUrl}
          alt={category.name}
          className="relative z-10 w-[110%] h-[110%] object-contain transform transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Nombre de la Categoría */}
      <h4 className="mt-4 md:mt-8 text-p-xs md:text-h4-b font-bold md:font-semibold text-[#1A1A1A] group-hover:text-[#E7446B] transition-colors text-center w-full max-w-[120px] md:max-w-none leading-tight">
        {category.name}
      </h4>
    </Link>
  );

  return (
    <section className="w-full py-4 md:py-16 animate-fade-in bg-[#FEF0F3] md:bg-transparent">
      {/* Añadido bg rosa suave en móvil de acuerdo a la imagen */}
      <div className="w-full max-w-[95%] md:max-w-[90%] mx-auto">
        {/* Título restaurado en móvil */}
        <h2 className="text-center text-h2-s md:text-h2-b text-[#1A1A1A] mb-4 md:mb-16 font-bold tracking-tight">
          Nuestras Categorías
        </h2>

        {/* VISTA MÓVIL (Carrusel con flechas) */}
        <div className="md:hidden relative px-8 py-2">
          <Swiper
            modules={[Navigation]}
            spaceBetween={0}
            slidesPerView={3}
            centeredSlides={true}
            loop={true}
            navigation={{
              prevEl: '.cat-prev',
              nextEl: '.cat-next',
            }}
            className="px-2 pb-4 overflow-hidden"
          >
            {[...categories, ...categories, ...categories].map((category, idx) => (
              <SwiperSlide key={`${category.id}-${idx}`} className="flex justify-center">
                {renderCategory(category)}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Arrows centradas en el círculo de 96px (w-24) -> top ~ 48px + margen */}
          <button className="cat-prev absolute left-0 top-[50px] z-10 w-8 h-8 bg-[#E7446B] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform hover:bg-[#EA4C73]">
            <ChevronLeftIcon className="w-4 h-4 ml-[-1px]" />
          </button>
          <button className="cat-next absolute right-0 top-[50px] z-10 w-8 h-8 bg-[#E7446B] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform hover:bg-[#EA4C73]">
            <ChevronRightIcon className="w-4 h-4 ml-[1px]" />
          </button>
        </div>

        {/* VISTA DESKTOP (Grid) */}
        <div className="hidden md:flex flex-wrap justify-center gap-16 lg:gap-32">
          {categories.map((category) => (
            <div key={category.id}>
              {renderCategory(category)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
