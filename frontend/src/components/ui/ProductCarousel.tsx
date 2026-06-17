import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { type Product } from "../../services/productService";
import ProductCard from "./ProductCard";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductCarouselProps {
  products: Product[];
  id: string; // ID único para el contenedor de paginación
  autoplayDelay?: number;
  onLoadMore?: () => void;
}

const ProductCarousel = ({
  products,
  id,
  autoplayDelay = 4000
}: ProductCarouselProps) => {
  if (!products || products.length === 0) return null;

  // Clases únicas para navegación y paginación
  const paginationClass = `${id}-pagination`;
  const prevClass = `prev-${id}`;
  const nextClass = `next-${id}`;

  return (
    <div className="relative group/carousel w-full">
      {/* Contenedor del Slider */}
      <div className="relative  md:px-14">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={12}
          slidesPerView={2}
          slidesPerGroup={2}
          loop={products.length >= 10}
          autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
          navigation={{
            prevEl: `.${prevClass}`,
            nextEl: `.${nextClass}`,
          }}
          pagination={{
            el: `.${paginationClass}`,
            clickable: true,
            dynamicBullets: false,
          }}
          breakpoints={{
            640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 40 },
            1536: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 50 },
          }}
          className="pb-4 overflow-visible"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="!h-auto flex px-2 md:px-0">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Paginación Externa Centrada - Más espacio vertical para evitar recortes */}
        <div className="w-full flex justify-center mt-6 py-6 overflow-visible">
          <div className={`${paginationClass} swiper-pagination !static !flex !justify-center !items-center !overflow-visible`}></div>
        </div>

        {/* Botones de Navegación (Círculos Rosas - Solo Desktop) */}
        <button
          className={`${prevClass} absolute left-0 top-1/2 -translate-y-20 z-10 w-11 h-11 bg-brand-400 hover:bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hidden lg:flex`}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          className={`${nextClass} absolute right-0 top-1/2 -translate-y-20 z-10 w-11 h-11 bg-brand-400 hover:bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hidden lg:flex`}
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        /* Ocultar flechas en móvil redundancia */
        @media (max-width: 1024px) {
          .${prevClass}, .${nextClass} {
            display: none !important;
          }
        }
        /* Fix: centrar dots de paginación */
        .${paginationClass} .swiper-pagination-bullet {
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          border: 4px solid #a0a0a0 !important;
          background: transparent !important;
          opacity: 1 !important;
          margin: 0 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        .${paginationClass} .swiper-pagination-bullet::after {
          content: '' !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: #a0a0a0 !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          transition: background 0.2s !important;
        }
        .${paginationClass} .swiper-pagination-bullet.swiper-pagination-bullet-active {
          border-color: #E7446B !important;
          background: transparent !important;
        }
        .${paginationClass} .swiper-pagination-bullet.swiper-pagination-bullet-active::after {
          background: #E7446B !important;
          width: 12px !important;
          height: 12px !important;
        }
        .${paginationClass} .swiper-pagination-bullet:hover {
          border-color: #E7446B !important;
        }
        .${paginationClass} .swiper-pagination-bullet:hover::after {
          background: #E7446B !important;
        }
      `}</style>
    </div>
  );
};

export default ProductCarousel;
