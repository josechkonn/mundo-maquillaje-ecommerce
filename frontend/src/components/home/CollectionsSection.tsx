import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collectionService, type ProductCollection } from "../../services/collectionService";
import { Swiper, SwiperSlide } from "swiper/react";
import Skeleton from 'react-loading-skeleton';
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const CollectionsSection = () => {
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVisible || collections.length > 0) return;

    const fetchCollections = async () => {
      setLoading(true);
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
  }, [isVisible, collections.length]);

  // Renderizador de la Tarjeta de Colección
  const renderCollectionCard = (col: ProductCollection) => {
    const displayImage = col.imageUrl
      || col.product?.variations?.[0]?.images?.[0]?.urlImage
      || "/placeholder-product.png";

    return (
      <div
        className="group relative flex flex-col bg-brand-200 rounded-[24px] overflow-hidden transition-all duration-300 h-full border-4 border-white/5"
      >
        <div className="p-2 pb-[16px] flex-shrink-0">
          <div className="relative aspect-[1.4/1] overflow-hidden rounded-[18px]">
            <img
              src={displayImage}
              alt={col.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center pb-[8px] text-white text-center">
          <h3 className="text-p-s md:text-p-b font-bold mb-3 px-4 leading-tight tracking-tight">
            {col.title}
          </h3>
          <p className="text-p-xs md:text-p-sm font-normal mb-8 opacity-95 leading-relaxed line-clamp-4 px-6">
            {col.description}
          </p>
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
    <div ref={sectionRef} className="w-full">
      {loading && collections.length === 0 ? (
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
      ) : collections.length > 0 ? (
        <section className="w-full pt-4 pb-12 md:py-16 bg-[#FEF0F3] overflow-hidden animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="px-4 text-center mb-6 md:mb-20">
              <h2 className="text-h3-s md:text-h2-b font-bold text-[#222222] tracking-tight hover:text-[#E6426E] cursor-pointer transition-colors duration-300 hover:underline hover:decoration-[#E6426E] hover:decoration-2 hover:underline-offset-[6px]">
                Conoce Nuestras Colecciones
              </h2>
            </div>

            <div className="md:hidden px-0">
              <Swiper
                modules={[]}
                spaceBetween={-30}
                slidesPerView={1.25}
                centeredSlides={true}
                loop={true}
                className="!overflow-visible carousel-collections"
              >
                {[...collections, ...collections, ...collections].map((col, index) => (
                  <SwiperSlide key={`${col.id}-${index}`} className="h-auto px-4 swiper-slide-custom">
                    {renderCollectionCard(col)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-10 px-8">
              {collections.map((col) => (
                <div key={col.id} className="h-full">
                  {renderCollectionCard(col)}
                </div>
              ))}
            </div>
          </div>

          <style>{`
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
      ) : (
        <div className="h-96 md:h-[500px]" />
      )}
    </div>
  );
};

export default CollectionsSection;
