import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { brandService, type Brand } from "../../services/brandService";

// Assets
import fondo from "../../assets/imgs/fondo.jpg";
import img1 from "../../assets/imgs/1.png"; // Brocha?
import img2 from "../../assets/imgs/2.png"; // Pintalabios?
import img3 from "../../assets/imgs/3.png"; // Triangulo
import img4 from "../../assets/imgs/4.png"; // Paleta
import img5 from "../../assets/imgs/5.png"; // Triangulo

// Swiper styles
import "swiper/css";

const BrandsCarousel = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandService.getAllBrands();
        setBrands(data.filter(b => b.isActive));
      } catch (error) {
        console.error("Error al cargar marcas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading && brands.length === 0) return null;

  return (
    <section className="w-full flex flex-col items-center bg-neutral-100">
      {/* Barra de Título con fondo neutral-100 y h2 */}
      <div className="w-full py-8 md:py-12 bg-neutral-100">
        <h2 className="text-h2-s md:text-h2-b font-bold text-center text-[#2D2D2D] tracking-tight">
          Nuestras Marcas
        </h2>
      </div>

      {/* Contenedor del Carrusel - ALTURA REDUCIDA EN MÓVIL, ORIGINAL EN DESKTOP */}
      <div className="relative w-full h-[200px] md:h-[450px] flex items-center overflow-hidden cursor-grab active:cursor-grabbing bg-neutral-100">
        {/* Fondo Principal */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${fondo})`, backgroundPosition: 'center' }}
        />

        {/* Elementos Decorativos - PEQUEÑOS EN MÓVIL, GRANDES EN PC */}

        {/* Esfera Blanca y Anillo Dorado (Top Left) */}
        <div className="absolute top-[-30px] md:top-[-150px] left-[5%] md:left-[15%] w-[80px] md:w-[350px] z-10 animate-float-slow">
          <img src={img3} alt="Esfera y Anillo" className="w-full h-auto drop-shadow-xl" />
        </div>

        {/* Paleta de Maquillaje (Bottom Left) */}
        <div className="absolute bottom-[-40px] md:bottom-[-160px] left-[-20px] md:left-[1%] w-[100px] md:w-[420px] z-20 animate-float">
          <img
            src={img4}
            alt="Paleta"
            className="w-full h-auto transform rotate-[-10deg] drop-shadow-2xl"
          />
        </div>

        {/* Decoración (Bottom Center) */}
        <div className="absolute bottom-[2%] left-[30%] md:left-[36%] w-[40px] md:w-[160px] z-10 animate-pulse-soft">
          <img src={img1} alt="Decoración" className="w-full h-auto drop-shadow-md" />
        </div>

        {/* Pintalabios (Bottom Center-Right) */}
        <div className="absolute bottom-[-30px] md:bottom-[-160px] left-[50%] md:left-[56%] w-[80px] md:w-[400px] z-20 animate-float-delayed">
          <img
            src={img2}
            alt="Pintalabios"
            className="w-full h-auto transform rotate-[4deg] drop-shadow-xl"
          />
        </div>

        {/* Brocha (Far Right) */}
        <div className="absolute top-[10%] md:top-[32%] right-[-40px] md:right-[-260px] w-[120px] md:w-[450px] z-20 animate-tilt">
          <img
            src={img5}
            alt="Brocha"
            className="w-full h-auto transform rotate-0 drop-shadow-2xl"
          />
        </div>

        {/* Decoración superior (Triángulo/Forma) */}
        <div className="absolute top-[10%] md:top-[12%] right-[16%] w-[30px] md:w-[130px] z-10 transition-transform duration-1000 animate-float-slow">
          <img
            src={img1}
            alt="Decoración superior"
            className="w-full h-auto transform rotate-[155deg] opacity-80"
          />
        </div>

        {/* Carrusel de Marcas (Frontal) */}
        <div className="relative w-full z-30 px-2 md:px-0">
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={10}
            slidesPerView={2.2}
            loop={true}
            freeMode={true}
            centeredSlides={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            speed={800}
            breakpoints={{
              640: { slidesPerView: 2.2, spaceBetween: 40, centeredSlides: false },
              1024: { slidesPerView: 3.2, spaceBetween: 60, centeredSlides: false },
              1280: { slidesPerView: 4.2, spaceBetween: 80, centeredSlides: false },
            }}
            className="w-full brands-swiper"
          >
            {[...brands, ...brands, ...brands].map((brand, index) => (
              <SwiperSlide key={`${brand.id}-${index}`} className="flex items-center justify-center h-full">
                <div className="flex items-center justify-center w-full h-full px-1 md:px-6 hover:grayscale-0 transition-all duration-300">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full max-h-[100px] md:max-h-[140px] xl:max-h-[160px] object-contain filter brightness-0 invert opacity-[0.95] transition-all duration-300 hover:scale-110"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(3deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-tilt {
          animation: tilt 5s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default BrandsCarousel;
