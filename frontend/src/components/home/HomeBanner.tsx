import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { bannerService, type Banner } from "../../services/bannerService";

// Import Swiper styles
import "swiper/css";
import "swiper/css/bundle";

const HomeBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await bannerService.getActiveBanners();
        setBanners(data);
      } catch (error) {
        console.error("Error al cargar banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] bg-brand-50 animate-pulse flex items-center justify-center">
        <div className="text-brand-300 font-medium">Cargando inspiración...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[60vh] bg-gradient-to-r from-brand-100 to-brand-50 flex items-center justify-center overflow-hidden">
        <div className="text-center px-4 animate-fade-in">
          <h1 className="text-brand-700 mb-2">Mundo Maquillaje</h1>
          <p className="text-text-muted">Resalta tu belleza con los mejores productos</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full h-[30vh] md:h-[60vh] relative group">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-full mySwiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="w-full h-full relative cursor-pointer overflow-hidden"
              onClick={() => banner.linkUrl && (window.location.href = banner.linkUrl)}
            >
              <picture className="w-full h-full">
                {banner.mobileImageUrl && (
                  <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />
                )}
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner promocional"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Estilos específicos para el Swiper del Banner (Protegidos con .mySwiper) */}
      <style>{`
        .mySwiper .swiper-button-next, 
        .mySwiper .swiper-button-prev {
          color: white !important;
          background: rgba(225, 21, 70, 0.4);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s;
        }
        .mySwiper .swiper-button-next::after, 
        .mySwiper .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .mySwiper:hover .swiper-button-next, 
        .mySwiper:hover .swiper-button-prev {
          opacity: 1;
        }
        .mySwiper .swiper-pagination-bullet-active {
          background: #E11546 !important;
          width: 24px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </section>
  );
};

export default HomeBanner;
