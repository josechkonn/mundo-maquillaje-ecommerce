import { useEffect, useState } from "react";
import { configService, type StoreConfig } from "../services/configService";

const ContactoPage = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configService
      .getConfig()
      .then(setConfig)
      .catch((error) => console.error("Error fetching store config:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const whatsappDigits = config?.whatsapp?.replace(/\D/g, "");
  const rows: { label: string; value?: string; href?: string }[] = [
    { label: "Dirección", value: config?.address },
    { label: "Teléfono", value: config?.phone, href: config?.phone ? `tel:${config.phone}` : undefined },
    { label: "WhatsApp", value: config?.whatsapp, href: whatsappDigits ? `https://wa.me/${whatsappDigits}` : undefined },
    { label: "Instagram", value: config?.instagramUrl, href: config?.instagramUrl },
    { label: "TikTok", value: config?.tiktokUrl, href: config?.tiktokUrl },
    { label: "Facebook", value: config?.facebookUrl, href: config?.facebookUrl },
    { label: "Lunes a viernes", value: config?.hoursMonFri },
    { label: "Sábados", value: config?.hoursSat },
    { label: "Domingos", value: config?.hoursSun },
  ].filter((r) => r.value);

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-center font-bold text-text-base mb-8">Contacto</h1>
      {rows.length === 0 ? (
        <p className="text-center text-neutral-700">Información de contacto no disponible por el momento.</p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="font-semibold text-neutral-800">{r.label}</dt>
              <dd className="text-neutral-700 break-words">
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default ContactoPage;
