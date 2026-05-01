import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collectionService, type ProductCollection } from "../../services/collectionService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import Skeleton from 'react-loading-skeleton';

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const CollectionsSection = () => {
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionService.getActiveCollections();
        if (Array.isArray(data)) {
          setCollections(data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading && collections.length === 0) {
    return (
      <div className="w-full py-16 px-4 bg-white">
        <div className="flex justify-center mb-12">
          <Skeleton height={40} width={250} borderRadius={8} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96">
              <Skeleton height="100%" borderRadius={24} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (collections.length === 0) return null;

  // Renderizador de la Tarjeta de Colección (Clon Visual exacto de la imagen)
  const renderCollectionCard = (col: ProductCollection) => {
    const displayImage = col.imageUrl
      || col.product?.variations?.[0]?.images?.[0]?.urlImage
      || "/placeholder-product.png";

    return (
      <div
        className="group relative flex flex-col bg-brand-200 rounded-[24px] overflow-hidden transition-all duration-300 h-full border-4 border-white/5"
      >
        {/* Marco de 8px (p-2) alrededor de la imagen */}
        <div className="p-2 pb-[16px] flex-shrink-0">
          <div className="relative aspect-[1.4/1] overflow-hidden rounded-[18px]">
            <img
              src={displayImage}
              alt={col.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Contenido Centrado */}
        <div className="flex-grow flex flex-col items-center justify-center pb-[8px] text-white text-center">
          {/* Título: p-s (14px) en móvil / p-b (16px) en PC */}
          <h3 className="text-p-s md:text-p-b font-bold mb-3 px-4 leading-tight tracking-tight">
            {col.title}
          </h3>

          {/* Descripción: p-xs (12px) en móvil / p-sm (14px) en PC */}
          <p className="text-p-xs md:text-p-sm font-normal mb-8 opacity-95 leading-relaxed line-clamp-4 px-6">
            {col.description}
          </p>

          {/* Botón Ver más (12px radius, no bold) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const slug = col.product?.slug || col.product?.id;
              if (slug) navigate(`/producto/${slug}`);
            }}
            className="bg-[#EA4C73] text-white px-10 py-3 rounded-[12px] text-[15px] font-normal shadow-md transition-all active:scale-95"
          >
            Ver más
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full pt-4 pb-12 md:py-16 bg-[#FEF0F3] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Título de la sección con tokens personalizados */}
        <div className="px-4 text-center mb-6 md:mb-20">
          <h2 className="text-h3-s md:text-h2-b font-bold text-[#1A1A1A] tracking-tight">
            Conoce Nuestras Colecciones
          </h2>
        </div>

        {/* VISTA MÓVIL (Carrusel puramente manual, centrado e infinito) */}
        <div className="md:hidden px-0">
          <Swiper
            modules={[]}
            spaceBetween={-30}
            slidesPerView={1.25}
            centeredSlides={true}
            loop={true}
            className="!overflow-visible carousel-collections"
          >
            {/* Triplicamos el contenido si hay pocos elementos para forzar un loop perfecto */}
            {[...collections, ...collections, ...collections].map((col, index) => (
              <SwiperSlide key={`${col.id}-${index}`} className="h-auto px-4 swiper-slide-custom">
                {renderCollectionCard(col)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* VISTA DESKTOP (Grid) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-10 px-8">
          {collections.map((col) => (
            <div key={col.id} className="h-full">
              {renderCollectionCard(col)}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Escalado simple para destacar la tarjeta central */
        .carousel-collections .swiper-slide-custom {
          transform: scale(0.9);
          transition: transform 0.4s ease;
        }
        .carousel-collections .swiper-slide-active {
          transform: scale(1.05);
          z-index: 10;
        }
      `}</style>
    </section>
  );
};

export default CollectionsSection;
