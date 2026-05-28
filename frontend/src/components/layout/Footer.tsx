import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { configService, type StoreConfig } from "../../services/configService";
import { checkoutService, type PaymentMethod } from "../../services/checkoutService";
import logo from "../../assets/imgs/logo.webp";

const Footer = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await configService.getConfig();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching store config:", error);
      }
    };
    fetchConfig();

    const fetchPaymentMethods = async () => {
      try {
        const checkoutConfig = await checkoutService.getConfig();
        setPaymentMethods(checkoutConfig.paymentMethods.filter(pm => pm.isActive));
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentMethods();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="w-full bg-brand-100 text-[#2D2D2D] font-sans">
      {/* Barra superior de Métodos de Pago - Carrusel Automático */}
      <div className="w-full bg-brand-200 py-3 md:py-6 border-b border-brand-300/50 overflow-hidden">
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {paymentMethods.length > 0 && (() => {
              const repeated = Array(20).fill(paymentMethods).flat();
              return repeated.map((method, index) => (
                <div key={index} className="marquee-item">
                  <span className="text-p-xs md:text-sm font-medium whitespace-nowrap uppercase tracking-wider">
                    {method.name}
                  </span>
                  <span className="text-brand-400/40 font-light mx-2">|</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:w-[90%] lg:mx-auto lg:py-12">

          {/* Branding */}
          <div className="flex flex-col items-center lg:items-start py-10 lg:py-0 border-b border-brand-300 lg:border-b-0 lg:border-r lg:border-brand-300/60 px-6 lg:pr-10">
            <img src={logo} alt="Mundo Maquillaje" className="w-32 mb-2" />
            <div className="flex gap-4 mb-4">
              <a href={config?.facebookUrl} target="_blank" rel="noreferrer" className="w-11 h-11 bg-brand-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href={config?.instagramUrl} target="_blank" rel="noreferrer" className="w-11 h-11 bg-brand-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z" /></svg>
              </a>
              <a href={config?.tiktokUrl} target="_blank" rel="noreferrer" className="w-11 h-11 bg-brand-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>
              </a>
            </div>
            <div className="flex flex-col items-center lg:items-start leading-none text-center lg:text-left">
              <h4 className="text-[32px] font-black tracking-tight">Más que bella</h4>
              <span className="font-parisienne text-[48px] text-brand-500 -mt-2">Elegante</span>
            </div>
          </div>

          {/* Atención al Cliente */}
          <div className="border-b border-brand-300 lg:border-b-0 lg:border-r lg:border-brand-300/60 lg:px-10">
            <button onClick={() => toggleSection('atencion')} className="w-full flex justify-between items-center py-5 px-6 lg:p-0 text-left lg:cursor-default">
              <h4 className="text-h4-s md:text-h4-b font-bold tracking-wider text-neutral-800">Atención al cliente</h4>
              <ChevronDownIcon className={`w-5 h-5 transition-transform lg:hidden ${openSection === 'atencion' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 lg:h-auto lg:opacity-100 ${openSection === 'atencion' ? 'max-h-40 py-4 px-6 lg:p-0 opacity-100' : 'max-h-0 lg:max-h-none opacity-0 lg:block'}`}>
              <div className="space-y-4 text-sm mt-4 lg:mt-6">
                <div>
                  <p className="font-bold mb-1 text-neutral-700">Lunes a Viernes:</p>
                  <p className="text-neutral-600">{config?.hoursMonFri || 'de 8:30a.m a 6:00p.m'}</p>
                </div>
                <div>
                  <p className="font-bold mb-1 text-neutral-700">Sábados:</p>
                  <p className="text-neutral-600">{config?.hoursSat || 'de 8:30a.m a 5:30p.m'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="border-b border-brand-300 lg:border-b-0 lg:border-r lg:border-brand-300/60 lg:px-10">
            <button onClick={() => toggleSection('contacto')} className="w-full flex justify-between items-center py-5 px-6 lg:p-0 text-left lg:cursor-default">
              <h4 className="text-h4-s md:text-h4-b font-bold tracking-wider text-neutral-800">Contacto</h4>
              <ChevronDownIcon className={`w-5 h-5 transition-transform lg:hidden ${openSection === 'contacto' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 lg:h-auto lg:opacity-100 ${openSection === 'contacto' ? 'max-h-60 py-4 px-6 lg:p-0 opacity-100' : 'max-h-0 lg:max-h-none opacity-0 lg:block'}`}>
              <div className="space-y-6 text-sm mt-4 lg:mt-6">
                <div>
                  <p className="font-bold mb-1 text-neutral-700">Línea Whatsapp:</p>
                  <p className="text-neutral-600">{config?.whatsapp || '+58 422-2772709'}</p>
                </div>
                <div>
                  <p className="font-bold mb-1 text-neutral-700">Sede Física:</p>
                  <p className="leading-relaxed text-neutral-600">{config?.address || 'Carrera 5 con calle 6, San Juan de Colón, Táchira'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces */}
          <div className="border-b border-brand-300 lg:border-0 lg:pl-10">
            <button onClick={() => toggleSection('enlaces')} className="w-full flex justify-between items-center py-5 px-6 lg:p-0 text-left lg:cursor-default">
              <h4 className="text-h4-s md:text-h4-b font-bold tracking-wider text-neutral-800">Enlaces de interés</h4>
              <ChevronDownIcon className={`w-5 h-5 transition-transform lg:hidden ${openSection === 'enlaces' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 lg:h-auto lg:opacity-100 ${openSection === 'enlaces' ? 'max-h-40 py-4 px-6 lg:p-0 opacity-100' : 'max-h-0 lg:max-h-none opacity-0 lg:block'}`}>
              <ul className="space-y-4 text-sm mt-4 lg:mt-6">
                <li><Link to="/productos" className="text-neutral-600 hover:text-brand-600 transition-colors">Productos</Link></li>
                <li><Link to="/nosotros" className="text-neutral-600 hover:text-brand-600 transition-colors">Sobre Nosotros</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Parisienne&display=swap');
        .font-parisienne { font-family: 'Parisienne', cursive; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-wrapper { overflow: hidden; white-space: nowrap; }
        .marquee-track {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
