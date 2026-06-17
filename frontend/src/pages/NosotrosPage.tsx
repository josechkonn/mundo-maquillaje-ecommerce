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

  const activePillars = (config?.pillars ?? []).filter(p => p.isActive !== false);

  const renderEssence = () => {
    if (!config?.ourEssence) return null;
    return config.ourEssence.split("\n").map((paragraph, index) => (
      <p key={index} className="text-center text-neutral-900 max-w-3xl mx-auto mb-6 leading-relaxed text-[16px]">
        {paragraph}
      </p>
    ));
  };

  const renderMap = () => {
    if (!config?.googleMapsEmbed) return null;
    const cleanEmbed = config.googleMapsEmbed.trim();
    if (cleanEmbed.startsWith("<iframe")) {
      return (
        <div
          className="map-iframe-container w-full h-full"
          dangerouslySetInnerHTML={{ __html: cleanEmbed }}
        />
      );
    }
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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-[#FFF2F4] to-[#FFEBEF] py-12 md:py-20 px-4 md:px-8 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#FFF2F4] to-[#FFEBEF] py-12 md:py-20 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      {/* ────────────────── SECCIÓN NUESTRA ESENCIA ────────────────── */}
      {config?.ourEssence && (
        <section className="w-full max-w-4xl mx-auto mb-12 md:mb-16 z-10">
          <h2 className="text-center text-text-base mb-6 md:mb-10 font-bold tracking-tight">
            Nuestra Esencia
          </h2>
          <div className="px-4 md:px-8">
            {renderEssence()}
          </div>
        </section>
      )}

      {/* ────────────────── SECCIÓN VISÍTANOS Y CONÓCENOS ────────────────── */}
      {(config?.address || config?.hoursMonFri || config?.hoursSat || config?.phone || config?.googleMapsEmbed) && (
        <section className="w-full max-w-5xl mx-auto mb-[290px] md:mb-[270px] relative z-10">
          <h3 className="text-center text-text-base mb-8 md:mb-12 font-bold tracking-tight">
            Visítanos y conócenos
          </h3>

          <div className="relative w-full aspect-video md:aspect-auto md:h-[650px] rounded-[20px] md:rounded-[30px] bg-brand-100 p-4 overflow-hidden z-10">
            {config?.googleMapsEmbed ? (
              <div className="w-full h-full rounded-[10px] md:rounded-[20px] overflow-hidden">
                {renderMap()}
              </div>
            ) : (
              <div className="w-full h-full rounded-[10px] md:rounded-[20px] bg-white flex items-center justify-center text-text-muted text-sm">
                Mapa no configurado
              </div>
            )}
          </div>

          <div className="absolute bottom-[-250px] md:bottom-[-220px] left-1/2 -translate-x-1/2 w-[80%] md:w-[600px] bg-white/95 backdrop-blur-md rounded-[30px] p-5 md:py-6 md:px-10 shadow-card-custom text-center z-20 transition-all hover:scale-[1.01]">
            <div className="space-y-4 md:space-y-5">
              {config?.address && (
                <div>
                  <h5 className="font-bold capitalize text-neutral-900 mb-1">
                    Dirección de la tienda
                  </h5>
                  <p className="text-neutral-900 text-p-s md:text-p-b leading-relaxed font-normal">
                    {config.address}
                  </p>
                </div>
              )}

              {(config?.hoursMonFri || config?.hoursSat) && (
                <div>
                  <h5 className="font-bold capitalize text-neutral-900 mb-1">
                    Nuestro Horario de Atención
                  </h5>
                  <div className="space-y-0.5 text-p-s md:text-p-b text-neutral-900 font-normal">
                    {config.hoursMonFri && (
                      <>
                        <p className="font-semibold text-neutral-900">Lunes a viernes</p>
                        <p className="text-neutral-900">{config.hoursMonFri}</p>
                      </>
                    )}
                    {config.hoursSat && (
                      <>
                        <p className="font-semibold text-neutral-900 mt-1">Sábados</p>
                        <p className="text-neutral-900">{config.hoursSat}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {config?.phone && (
                <div>
                  <h5 className="font-bold capitalize text-neutral-900 mb-1">
                    Nuestro Número telefónico
                  </h5>
                  <a
                    href={`tel:${config.phone}`}
                    className="text-neutral-900 text-p-s md:text-p-b font-normal hover:text-brand-600 transition-colors block md:inline-block cursor-pointer hover:underline"
                  >
                    {config.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

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
      )}

      {/* ────────────────── SECCIÓN NUESTROS PILARES ────────────────── */}
      {config?.showPillars && activePillars.length > 0 && (
        <section className="w-full max-w-5xl mx-auto mb-16 md:mb-24 z-10 px-4">
          <h3 className="text-center text-text-base mb-8 md:mb-12 font-bold tracking-tight">
            {config.pillarsTitle || "Nuestros Pilares"}
          </h3>
          <div className={(() => {
            const count = activePillars.length;
            if (count >= 4) return "grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-5xl mx-auto text-center";
            if (count === 3) return "grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-12 max-w-4xl mx-auto text-center";
            if (count === 2) return "grid grid-cols-2 gap-x-12 gap-y-12 max-w-2xl mx-auto text-center";
            return "flex flex-col items-center max-w-sm mx-auto text-center";
          })()}>
            {activePillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex flex-col items-center group transition-all duration-300 hover:transform hover:scale-[1.03]"
              >
                {pillar.imageUrl && (
                  <img
                    src={pillar.imageUrl}
                    alt={pillar.title}
                    className="h-20 w-20 md:h-24 md:w-24 object-contain mb-4 md:mb-5 filter drop-shadow-sm transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/${pillar.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.webp`;
                    }}
                  />
                )}
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
      {config?.showMissionVision && (config?.showMission || config?.showVision) && (
        <section className="w-[95vw] md:w-[90vw] max-w-7xl mx-auto z-10 px-0 md:px-4">
          <div className="bg-white rounded-[30px] p-8 md:py-16 md:px-12">
            {config.showMission && config.showVision ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative">
                <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[1.5px] bg-brand-100 -translate-x-1/2" />

                {config.showMission && (
                  <div className="text-center md:pr-10 flex flex-col justify-center">
                    <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-5 tracking-tight">
                      {config.missionTitle || "Nuestra Misión"}
                    </h3>
                    <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-md mx-auto">
                      {config.missionContent}
                    </p>
                  </div>
                )}

                <div className="block md:hidden h-[1.5px] bg-brand-100 my-2" />

                {config.showVision && (
                  <div className="text-center md:pl-10 flex flex-col justify-center pt-2 md:pt-0">
                    <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-5 tracking-tight">
                      {config.visionTitle || "Nuestra Visión"}
                    </h3>
                    <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-md mx-auto">
                      {config.visionContent}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center max-w-3xl mx-auto flex flex-col items-center justify-center py-4">
                <h3 className="text-text-base font-bold text-neutral-900 mb-4 md:mb-6 tracking-tight">
                  {config.showMission ? (config.missionTitle || "Nuestra Misión") : (config.visionTitle || "Nuestra Visión")}
                </h3>
                <p className="text-neutral-800 text-[15px] md:text-[16px] leading-relaxed max-w-2xl">
                  {config.showMission ? config.missionContent : config.visionContent}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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
