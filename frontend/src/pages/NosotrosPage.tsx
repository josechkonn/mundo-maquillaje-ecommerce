import { useEffect, useState } from "react";
import { configService, type StoreConfig } from "../services/configService";
import ondasBanner from "../assets/imgs/Ondas Banner 5.webp";

const NosotrosPage = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await configService.getConfig();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching store config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Fallbacks para datos vacíos o no configurados aún en la base de datos
  const address = config?.address || "Carrera 5 con calle 6, Esquina Rosada, San Juan de Colón, Estado Táchira";
  const phone = config?.phone || "0422-2772709";
  const hoursMonFri = config?.hoursMonFri || "Lunes a viernes de 8:30a.m a 6:00p.m";
  const hoursSat = config?.hoursSat || "Sábados de 8:30a.m a 5:30p.m";
  const mapEmbedCode = config?.googleMapsEmbed || `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.6888497495574!2d-72.2618991253457!3d8.031024304414777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666bc0f9be3b5d%3A0xe7264a938c7fde6!2sCarrera%205%20%26%20Calle%206%2C%20San%20Juan%20de%20Col%C3%B3n%205020%2C%20T%C3%A1chira!5e0!3m2!1sen!2sve!4v1716800000000!5m2!1sen!2sve" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

  // Pilares Dinámicos con fallback si la BD está vacía
  const showPillars = config?.showPillars !== false;
  const pillarsTitle = config?.pillarsTitle || "Nuestros Pilares";

  const defaultPillars = [
    {
      id: "default-1",
      title: "Calidad",
      content: "Solo marcas reconocidas y productos probados",
      imageUrl: "https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/calidad.webp",
      isActive: true,
      orderIndex: 1
    },
    {
      id: "default-2",
      title: "Variedad",
      content: "Miles de tonos y texturas para todos los gustos y necesidades",
      imageUrl: "https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/variedad.webp",
      isActive: true,
      orderIndex: 2
    },
    {
      id: "default-3",
      title: "Tendencia",
      content: "Las últimas novedades y estilos de moda",
      imageUrl: "https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/tendencia.webp",
      isActive: true,
      orderIndex: 3
    },
    {
      id: "default-4",
      title: "Atención",
      content: "Asesoría personalizada y servicio al cliente excepcional",
      imageUrl: "https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/atencion.webp",
      isActive: true,
      orderIndex: 4
    }
  ];

  const activePillars = config?.pillars && config.pillars.length > 0
    ? config.pillars.filter(p => p.isActive !== false)
    : defaultPillars;

  const getGridClass = (count: number) => {
    if (count >= 4) return "grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-5xl mx-auto text-center";
    if (count === 3) return "grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12 max-w-4xl mx-auto text-center";
    if (count === 2) return "grid grid-cols-2 gap-x-12 gap-y-12 max-w-2xl mx-auto text-center";
    return "flex flex-col items-center max-w-sm mx-auto text-center";
  };

  // Misión y Visión Dinámicas
  const showMissionVision = config?.showMissionVision !== false;
  const showMission = config?.showMission !== false;
  const showVision = config?.showVision !== false;

  const missionTitle = config?.missionTitle || "Nuestra Misión";
  const missionContent = config?.missionContent || "Nuestra misión es empoderar a cada persona para que se sienta hermosa y segura de sí misma, ofreciendo acceso a productos de belleza de alta calidad de forma fácil y accesible. Tu belleza es nuestra prioridad";

  const visionTitle = config?.visionTitle || "Nuestra Visión";
  const visionContent = config?.visionContent || "Nuestra visión es ser la tienda líder en productos de belleza, reconocida por nuestra calidad, variedad y servicio excepcional, inspirando a cada persona a expresar su autenticidad";

  // Renderizado del contenido de "Nuestra Esencia"
  const renderEssence = () => {
    if (config?.ourEssence) {
      return config.ourEssence.split("\n").map((paragraph, index) => (
        <p key={index} className="text-center text-neutral-900 max-w-3xl mx-auto mb-6 leading-relaxed text-[16px]">
          {paragraph}
        </p>
      ));
    }

    // Fallback por defecto si no hay nada en la BD
    return (
      <>
        <p className="text-center text-neutral-900 max-w-3xl mx-auto mb-6 leading-relaxed text-[16px]">
          Mundo maquillaje nació como una idea de emprendimiento que ayude a las personas a conseguir siempre lo que necesitan en un solo lugar.
        </p>
        <p className="text-center text-neutral-900 max-w-3xl mx-auto mb-6 leading-relaxed text-[16px]">
          Más que una tienda, somos una comunidad dedicada a ofrecerte los mejores productos de maquillaje, cuidado de la piel y el cabello, manicura y accesorios, seleccionados con amor para resaltar tu brillo natural
        </p>
      </>
    );
  };

  // Renderizado del mapa
  const renderMap = () => {
    const cleanEmbed = mapEmbedCode.trim();
    if (cleanEmbed.startsWith("<iframe")) {
      return (
        <div
          className="map-iframe-container w-full h-full"
          dangerouslySetInnerHTML={{ __html: cleanEmbed }}
        />
      );
    }
    // Si guardaron solo un enlace, lo renderizamos en un iframe clásico
    return (
      <iframe
        src={cleanEmbed}
        title="Ubicación de Mundo Maquillaje"
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFF2F4] to-[#FFEBEF] py-12 md:py-20 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      {/* ────────────────── SECCIÓN NUESTRA ESENCIA ────────────────── */}
      <section className="w-full max-w-4xl mx-auto mb-12 md:mb-16 z-10">
        <h2 className="text-center text-text-base mb-6 md:mb-10 font-bold tracking-tight">
          Nuestra Esencia
        </h2>
        <div className="px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            renderEssence()
          )}
        </div>
      </section>

      {/* ────────────────── SECCIÓN VISÍTANOS Y CONÓCENOS ────────────────── */}
      <section className="w-full max-w-5xl mx-auto mb-[290px] md:mb-[270px] relative z-10">
        <h3 className="text-center text-text-base mb-8 md:mb-12 font-bold tracking-tight">
          Visítanos y conócenos
        </h3>

        {/* Contenedor del Mapa con Borde Plano de 16px (bg-brand-100 p-4) - Radios: 20px fuera / 10px dentro en móvil, 30px fuera / 20px dentro en desktop */}
        <div className="relative w-full aspect-video md:aspect-auto md:h-[650px] rounded-[20px] md:rounded-[30px] bg-brand-100 p-4 overflow-hidden z-10">
          {loading ? (
            <div className="w-full h-full flex justify-center items-center bg-white rounded-[10px] md:rounded-[20px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="w-full h-full rounded-[10px] md:rounded-[20px] overflow-hidden">
              {renderMap()}
            </div>
          )}
        </div>

        {/* Tarjeta de Información de la Tienda (Overlapping, casi al finalizar el mapa) */}
        <div className="absolute bottom-[-250px] md:bottom-[-220px] left-1/2 -translate-x-1/2 w-[80%] md:w-[600px] bg-white/95 backdrop-blur-md rounded-[30px] p-5 md:py-6 md:px-10 shadow-card-custom text-center z-20 transition-all hover:scale-[1.01]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {/* Dirección */}
              <div>
                <h5 className="font-bold capitalize text-neutral-900 mb-1">
                  Dirección de la tienda
                </h5>
                <p className="text-neutral-900 text-p-s md:text-p-b leading-relaxed font-normal">
                  {address}
                </p>
              </div>

              {/* Horario */}
              <div>
                <h5 className="font-bold capitalize text-neutral-900 mb-1">
                  Nuestro Horario de Atención
                </h5>
                <div className="space-y-0.5 text-p-s md:text-p-b text-neutral-900 font-normal">
                  <p className="font-semibold text-neutral-900">
                    Lunes a viernes
                  </p>
                  <p className="text-neutral-900">
                    {hoursMonFri.toLowerCase().includes("lunes a viernes")
                      ? hoursMonFri.replace(/lunes a viernes/i, "").trim()
                      : hoursMonFri}
                  </p>
                  <p className="font-semibold text-neutral-900 mt-1">
                    Sábados
                  </p>
                  <p className="text-neutral-900">
                    {hoursSat.toLowerCase().includes("sábados")
                      ? hoursSat.replace(/sábados/i, "").trim()
                      : hoursSat}
                  </p>
                </div>
              </div>

              {/* Número Telefónico */}
              <div>
                <h5 className="font-bold capitalize text-neutral-900 mb-1">
                  Nuestro Número telefónico
                </h5>
                <a
                  href={`tel:${phone}`}
                  className="text-neutral-900 text-p-s md:text-p-b font-normal hover:text-brand-600 transition-colors block md:inline-block cursor-pointer hover:underline"
                >
                  {phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Imágenes de Ondas de Decoración en el Fondo (Detrás del mapa y horario) - Ocupan el 50% de la página (50vw) y están posicionadas bien abajo */}
        <img
          src={ondasBanner}
          alt="Decoración de fondo izquierda"
          className="absolute bottom-[-240px] md:bottom-[-250px] left-[calc(-50vw+50%)] w-[50vw] opacity-90 z-0 pointer-events-none select-none transform scale-x-[-1]"
        />
        <img
          src={ondasBanner}
          alt="Decoración de fondo derecha"
          className="absolute bottom-[-240px] md:bottom-[-250px] right-[calc(-50vw+50%)] w-[50vw] opacity-90 z-0 pointer-events-none select-none"
        />
      </section>

      {/* ────────────────── SECCIÓN NUESTROS PILARES ────────────────── */}
      {showPillars && activePillars.length > 0 && (
        <section className="w-full max-w-5xl mx-auto mb-16 md:mb-24 z-10 px-4">
          <h3 className="text-center text-text-base mb-8 md:mb-12 font-bold tracking-tight">
            {pillarsTitle}
          </h3>
          <div className={getGridClass(activePillars.length)}>
            {activePillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex flex-col items-center group transition-all duration-300 hover:transform hover:scale-[1.03]"
              >
                <img
                  src={pillar.imageUrl}
                  alt={pillar.title}
                  className="h-20 w-20 md:h-24 md:w-24 object-contain mb-4 md:mb-5 filter drop-shadow-sm transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/${pillar.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.webp`;
                  }}
                />
                <h5 className="font-bold text-neutral-900 mb-2 text-[18px] md:text-[20px]">
                  {pillar.title}
                </h5>
                <p className="text-neutral-600 text-[14px] leading-relaxed max-w-[240px]">
                  {pillar.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ────────────────── SECCIÓN MISIÓN Y VISIÓN ────────────────── */}
      {showMissionVision && (showMission || showVision) && (
        <section className="w-[95vw] md:w-[90vw] max-w-7xl mx-auto z-10 px-0 md:px-4">
          <div className="bg-white rounded-[30px] p-8 md:py-16 md:px-12">
            {showMission && showVision ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative">
                {/* Línea divisora central rosada en desktop */}
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[1.5px] bg-brand-100 -translate-x-1/2" />

                {/* Misión */}
                <div className="text-center md:pr-10 flex flex-col justify-center">
                  <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-5 tracking-tight">
                    {missionTitle}
                  </h3>
                  <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-md mx-auto">
                    {missionContent}
                  </p>
                </div>

                {/* Línea divisora en móvil */}
                <div className="block md:hidden h-[1.5px] bg-brand-100 my-2" />

                {/* Visión */}
                <div className="text-center md:pl-10 flex flex-col justify-center pt-2 md:pt-0">
                  <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-5 tracking-tight">
                    {visionTitle}
                  </h3>
                  <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-md mx-auto">
                    {visionContent}
                  </p>
                </div>
              </div>
            ) : (
              // Solo uno activo
              <div className="text-center max-w-3xl mx-auto flex flex-col items-center justify-center py-4">
                <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-6 tracking-tight">
                  {showMission ? missionTitle : visionTitle}
                </h3>
                <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-2xl">
                  {showMission ? missionContent : visionContent}
                </p>
              </div>
            )}
          </div>
        </section>
      )}


      {/* Estilos adicionales inyectados para asegurar que el iframe del mapa tome el 100% */}
      <style>{`
        .map-iframe-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default NosotrosPage;
