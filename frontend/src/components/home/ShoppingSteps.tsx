import React from 'react';
import { useNavigate } from 'react-router-dom';

// Assets
import imgStep1 from '../../assets/imgs/2Banner 1.png';
import imgStep2 from '../../assets/imgs/Carrito Banner 2.png';
import imgStep3 from '../../assets/imgs/Carrito Banner 1.png';
import imgOndas1 from '../../assets/imgs/Ondas Banner 1.png';
import imgOndas2 from '../../assets/imgs/Ondas Banner 2.png';

const ShoppingSteps = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      icon: imgStep1,
      text: "Selecciona tus productos favoritos.",
    },
    {
      id: 2,
      icon: imgStep2,
      text: "Realiza tu pago de manera rapida y segura.",
    },
    {
      id: 3,
      icon: imgStep3,
      text: "Finalmente, espera que tu pedido llegue a su destino",
    }
  ];

  return (
    <section className="w-full pt-4 md:pt-16 pb-4 md:pb-[36px] px-4 bg-[#FDEDF1] relative overflow-hidden">
      {/* Elementos decorativos (Ondas) - AÚN MÁS GRANDES */}
      <div className="absolute bottom-0 left-0 w-[60%] md:w-[60%] pointer-events-none z-0">
        <img src={imgOndas2} alt="Ondas decorativas" className="w-full h-auto opacity-70" />
      </div>
      <div className="absolute bottom-0 right-0 w-[60%] md:w-[60%] pointer-events-none z-0">
        <img src={imgOndas1} alt="Ondas decorativas" className="w-full h-auto opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        {/* Título */}
        <h2 className="text-h2-s md:text-h2-b font-bold text-[#222222] mb-10 md:mb-24 tracking-tight leading-tight">
          Hacer tus compras nunca fue <br className="md:hidden" />
          tan facil
        </h2>

        {/* Contenedor de Pasos */}
        <div className="flex flex-row items-start justify-center gap-2 md:gap-8 px-2 md:px-12 w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Card de Paso */}
              <div className="flex flex-col items-center flex-1 max-w-[110px] md:max-w-[280px] group transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 md:w-48 md:h-48 flex items-center justify-center mb-3 md:mb-6">
                  <img
                    src={step.icon}
                    alt={`Paso ${step.id}`}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <p className="text-[11px] md:text-xl font-medium md:font-medium text-[#222222] md:text-[#4A4A4A] leading-tight md:leading-relaxed px-1">
                  {step.text}
                </p>
              </div>

              {/* Flecha Conectora (Ahora visible en ambos, horizontal) */}
              {index < steps.length - 1 && (
                <div className="flex flex-col items-center justify-start pt-6 md:pt-20">
                  <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[#EA4C73] flex items-center justify-center shadow-sm md:shadow-lg transform transition-transform group-hover:scale-110 opacity-90">
                    <svg
                      width="60%"
                      height="60%"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón Call to Action */}
        <div className="mt-4 md:mt-28">
          <button
            onClick={() => navigate('/productos')}
            className="bg-[#EA4C73] text-white px-8 md:px-12 py-[10px] md:py-[8px] rounded-[16px] md:rounded-[14px] text-base md:text-xl font-medium md:font-normal shadow-lg transition-all duration-300 hover:bg-[#D43D61] hover:scale-105 active:scale-95"
          >
            Empieza a comprar fácil
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShoppingSteps;
